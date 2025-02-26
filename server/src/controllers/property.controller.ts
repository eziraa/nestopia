import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { S3Client } from "@aws-sdk/client-s3";
import { Location } from "@prisma/client";
import { Upload } from "@aws-sdk/lib-storage";
import { IQProperty } from "../types/propertyType";
const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

export class PropertyController {
  public async listProperties(req: Request, res: Response): Promise<void> {
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

      res.json(properties);
    } catch (err: any) {
      res
        .status(500)
        .json({ message: `Error fetching properties: ${err.message}` });
    }
  }
}
