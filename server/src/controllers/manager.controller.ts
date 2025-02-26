import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";

const prisma = new PrismaClient();
export class ManagerController {
  public async getManager(req: Request, res: Response): Promise<void> {
    try {
      // Getting manager id
      const { cognitoId } = req.params;

      // Throw error if manager id not provided
      if (!cognitoId) {
        res.status(200).json({
          message: "Manager ID required",
        });
      }

      // Getting manager
      const manager = await prisma.manager.findUnique({
        where: {
          cognitoId,
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

  public async createManager(req: Request, res: Response): Promise<void> {
    try {
      // Getting manager data
      const { cognitoId, name, email, phoneNumber } = req.body;

      // Creating manager

      const manager = await prisma.manager.create({
        data: {
          cognitoId,
          name,
          email,
          phoneNumber,
        },
      });

      res.status(201).json(manager);
    } catch (err: any) {
      res.status(500).json({
        message: `Failed to create manager ${err.message}`,
      });
    }
  }

  public async updateManager(req: Request, res: Response): Promise<void> {
    try {
      const { cognitoId } = req.params;
      const { name, email, phoneNumber } = req.body;

      const updateManager = await prisma.manager.update({
        where: { cognitoId },
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
}
