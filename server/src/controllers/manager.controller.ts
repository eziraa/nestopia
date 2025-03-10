import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";

const prisma = new PrismaClient();
export class ManagerController {
  static async getManager(req: Request, res: Response): Promise<void> {
    try {
      // Getting manager id
      const { id } = req.params;

      // Throw error if manager id not provided
      if (!id) {
        res.status(200).json({
          message: "Manager ID required",
        });
      }

      // Getting manager
      const manager = await prisma.manager.findUnique({
        where: {
          id: Number(id),
        },
      });

      // Throw err of manager not found
      if (!manager) {
        res.status(200).json({
          message: "Manager not found",
        });
      }

      // Sending response
      res.status(200).json(manager);
    } catch (err: any) {
      res.status(500).json({
        message: `Error fetching manager: ${err.message}`,
      });
    }
  }

  static async createManager(req: Request, res: Response): Promise<void> {
    try {
      // Getting manager data
      const { id, name, email, phoneNumber } = req.body;

      // Creating manager

      const manager = await prisma.manager.create({
        data: {
          id,
          cognitoId: id,
          name,
          email,
          phoneNumber,
          password: "password",
        },
      });

      res.status(201).json(manager);
    } catch (err: any) {
      res.status(500).json({
        message: `Failed to create manager ${err.message}`,
      });
    }
  }

  static async updateManager(req: Request, res: Response): Promise<void> {
    try {
      const { cognitoId } = req.params;
      if(!cognitoId) {
        res.status(400).json({ message: "Cognito ID required" });
        return
      }
      const { name, email, phoneNumber } = req.body;

      const manager = await prisma.manager.findUnique({
        where: { cognitoId: cognitoId },
      })
      if(!manager) {
        res.status(404).json({ message: "Manager not found" });
        return
      }
    

      const updateManager = await prisma.manager.update({
        where: { id: manager.id },
        data: {
          name,
          email,
          phoneNumber,
        },
      });

      res.json(updateManager);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: `Error updating manager: ${error.message}` });
    }
  }

  static async getManagerProperties(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { cognitoId } = req.params;
      const properties = await prisma.property.findMany({
        where: { managerCognitoId: cognitoId },
        include: {
          location: true,
        },
      });

      const propertiesWithFormattedLocation = await Promise.all(
        properties.map(async (property) => {
          const coordinates: { coordinates: string }[] =
            await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

          const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
          const longitude = geoJSON.coordinates[0];
          const latitude = geoJSON.coordinates[1];

          console.log(property);
          return {
            ...property,
            location: {
              ...property.location,
              coordinates: {
                longitude,
                latitude,
              },
            },
          };
        })
      );

      res.json(propertiesWithFormattedLocation);
    } catch (err: any) {
      res
        .status(500)
        .json({
          message: `Error retrieving manager properties: ${err.message}`,
        });
    }
  }
}
