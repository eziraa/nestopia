import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { S3Client } from "@aws-sdk/client-s3";
import { Location } from "@prisma/client";
import fs from "fs";
import { IQProperty } from "../types/propertyType";
import axios from "axios";
import path from "path";
const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

export class PropertyController {
  static async listProperties(req: Request, res: Response): Promise<void> {
    try {
      // Getting query parameters
      const {
        favoriteIds,
        priceMin,
        priceMax,
        beds,
        baths,
        propertyType,
        squareFeetMin,
        squareFeetMax,
        amenities,
        availableFrom,
        latitude,
        longitude,
      } = req.query as unknown as IQProperty;

      // Creating where conditions
      let whereConditions: Prisma.Sql[] = [];

      if (favoriteIds) {
        const favoriteIdsArray = (favoriteIds as string).split(",").map(Number);
        whereConditions.push(
          Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray)})`
        );
      }

      if (priceMin) {
        whereConditions.push(
          Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`
        );
      }

      if (priceMax) {
        whereConditions.push(
          Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`
        );
      }

      if (beds && beds !== "any") {
        whereConditions.push(Prisma.sql`p.beds >= ${Number(beds)}`);
      }

      if (baths && baths !== "any") {
        whereConditions.push(Prisma.sql`p.baths >= ${Number(baths)}`);
      }

      if (squareFeetMin) {
        whereConditions.push(
          Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`
        );
      }

      if (squareFeetMax) {
        whereConditions.push(
          Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`
        );
      }

      if (propertyType && propertyType !== "any") {
        whereConditions.push(
          Prisma.sql`p."propertyType" = ${propertyType}::"PropertyType"`
        );
      }

      if (amenities && amenities !== "any") {
        const amenitiesArray = (amenities as string).split(",");
        whereConditions.push(Prisma.sql`p.amenities @> ${amenitiesArray}`);
      }

      if (availableFrom && availableFrom !== "any") {
        const availableFromDate =
          typeof availableFrom === "string" ? availableFrom : null;
        if (availableFromDate) {
          const date = new Date(availableFromDate);
          if (!isNaN(date.getTime())) {
            whereConditions.push(
              Prisma.sql`EXISTS (
                    SELECT 1 FROM "Lease" l 
                    WHERE l."propertyId" = p.id 
                    AND l."startDate" <= ${date.toISOString()}
                  )`
            );
          }
        }
      }

      if (latitude && longitude) {
        const lat = parseFloat(latitude as string);
        const lng = parseFloat(longitude as string);
        const radiusInKilometers = 1000;
        const degrees = radiusInKilometers / 111; // Converts kilometers to degrees

        whereConditions.push(
          Prisma.sql`ST_DWithin(
                l.coordinates::geometry,
                ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
                ${degrees}
              )`
        );
      }

      const completeQuery = Prisma.sql`
            SELECT 
              p.*,
              json_build_object(
                'id', l.id,
                'address', l.address,
                'city', l.city,
                'state', l.state,
                'country', l.country,
                'postalCode', l."postalCode",
                'coordinates', json_build_object(
                  'longitude', ST_X(l."coordinates"::geometry),
                  'latitude', ST_Y(l."coordinates"::geometry)
                )
              ) as location
            FROM "Property" p
            JOIN "Location" l ON p."locationId" = l.id
            ${
              whereConditions.length > 0
                ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
                : Prisma.empty
            }
          `;

      const properties = await prisma.$queryRaw(completeQuery);

      console.log(properties);
      res.json(properties);
    } catch (err: any) {
      res
        .status(500)
        .json({ message: `Error fetching properties: ${err.message}` });
    }
  }

  static async getProperty(req: Request, res: Response): Promise<void> {
    try {
      // Getting property id from request parameters
      const { id } = req.params;

      // THrow error if property id is not provided
      if (!id) {
        res.status(400).json({ message: "Property ID is required" });
        return;
      }

      // Retrieving property by id
      const property = await prisma.property.findUnique({
        where: { id: Number(id) },
        include: {
          location: true,
        },
      });

      // Throw error if property is not found
      if (!property) {
        res.status(404).json({ message: "Property not found" });
        return;
      }

      // Formatting property with coordinates
      const coordinates: { coordinates: string }[] =
        await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

      const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
      const longitude = geoJSON.coordinates[0];
      const latitude = geoJSON.coordinates[1];

      const propertyWithCoordinates = {
        ...property,
        location: {
          ...property.location,
          coordinates: {
            longitude,
            latitude,
          },
        },
      };
      res.json(propertyWithCoordinates);
    } catch (err: any) {
      res
        .status(500)
        .json({ message: `Error retrieving property: ${err.message}` });
    }
  }

  static async createPropery(req: Request, res: Response): Promise<void> {
    try {
      const {
        address,
        city,
        state,
        country,
        postalCode,
        managerCognitoId,
        photoUrls,
        ...propertyData
      } = req.body;

      const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
        {
          street: address,
          city,
          country,
          postalcode: postalCode,
          format: "json",
          limit: "1",
        }
      ).toString()}`;

      const geocodingResponse = await axios.get(geocodingUrl, {
        headers: {
          "User-Agent": "Real State (ezratgab@gmail.com)",
        },
      });

      const [longitude, latitude] =
        geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat
          ? [
              parseFloat(geocodingResponse.data[0]?.lon),
              parseFloat(geocodingResponse.data[0]?.lat),
            ]
          : [0, 0];

      // create location
      const [location] = await prisma.$queryRaw<Location[]>`
                  INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
                  VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
                  RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;
                `;

      // create property
      const newProperty = await prisma.property.create({
        data: {
          ...propertyData,
          photoUrls,
          locationId: location.id,
          managerCognitoId,
          amenities:
            typeof propertyData.amenities === "string"
              ? propertyData.amenities.split(",")
              : [],
          highlights:
            typeof propertyData.highlights === "string"
              ? propertyData.highlights.split(",")
              : [],
          isPetsAllowed: propertyData.isPetsAllowed === "true",
          isParkingIncluded: propertyData.isParkingIncluded === "true",
          pricePerMonth: parseFloat(propertyData.pricePerMonth),
          securityDeposit: parseFloat(propertyData.securityDeposit),
          applicationFee: parseFloat(propertyData.applicationFee),
          beds: parseInt(propertyData.beds),
          baths: parseFloat(propertyData.baths),
          squareFeet: parseInt(propertyData.squareFeet),
        },
        include: {
          location: true,
          manager: true,
        },
      });

      res.status(201).json(newProperty);
    } catch (err: any) {
      res.status(500).json({
        message: `Failed to create Property ${err.message}`,
      });
    }
  }
}
