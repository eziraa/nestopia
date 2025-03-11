import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ICTenant } from "../types/tenantTypes";
import { wktToGeoJSON } from "@terraformer/wkt";
const prisma = new PrismaClient();
export class TenantController {
  static async listTetents(req: Request, res: Response): Promise<void> {
    try {
      // Getting tenants
      const tenants = await prisma.tenant.findMany({
        include: {
          properties: true,
          applications: true,
        },
      });

      // Sending response
      res.json(tenants);
    } catch (error: any) {
      res.status(500).json({
        message: `Error fetching tenants ${error.message}`,
      });
    }
  }

  static async createTenant(req: Request, res: Response): Promise<void> {
    try {
      // Getting tenant data
      const { id, name, email, phoneNumber } = req.body as ICTenant;

      // Creating tenant
      const tenant = await prisma.tenant.create({
        data: {
          cognitoId: id,
          id: Number(id),
          name,
          email,
          phoneNumber,
          password: "password",
        },
      });

      // Sending response
      res.status(201).json(tenant);
    } catch (error: any) {
      res.status(500).json({
        message: `Error creating tenant ${error.message}`,
      });
    }
  }

  static async updateTenant(req: Request, res: Response): Promise<void> {
    try {
      // Getting tenant cognito id from request parameters
      const { id } = req.params;
      // Getting tenant data
      const { name, email, phoneNumber } = req.body as ICTenant;

      // Updating tenant
      const updatedTenant = await prisma.tenant.update({
        where: { cognitoId: (id) },
        data: {
          name,
          email,
          phoneNumber,
        },
      });

      // Sending response
      res.json(updatedTenant);
    } catch (error: any) {
      res.status(500).json({
        message: `Error updating tenant ${error.message}`,
      });
    }
  }

  static async getTenenant(req: Request, res: Response): Promise<void> {
    try {
      // Getting tenant cognito id from request parameters
      const { id } = req.params;

      // Throw error if cognito id is not provided
      if (!id) {
        res.status(400).json({ message: "Cognito ID is required" });
        return;
      }

      //Getting tenant
      const tenant = await prisma.tenant.findUnique({
        where: { id: Number(id) },
      });

      // throw error if tenant is not found
      if (!tenant) {
        res.status(404).json({ message: "Tenant not found" });
        return;
      }

      // Sending response
      res.status(200).json(tenant);
    } catch (err: any) {
      console.log("@@Error Getting tenant", err);
      res
        .status(500)
        .json({ message: `Error retrieving tenant: ${err.message}` });
        return;
    }
  }

  static async getCurrentResidences(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      // Getting tenant cognito id from request parameters
      const { id } = req.params;

      // Throw error if cognito id is not provided
      if (!id) {
        res.status(400).json({ message: "Cognito ID is required" });
        return;
      }

      // Getting properties by tenant cognito id
      const properties = await prisma.property.findMany({
        where: { tenants: { some: { id: Number(id) } } },
        include: {
          location: true,
        },
      });

      // Getting residences with formatted location
      const residentsWithFormattedLocation = await Promise.all(
        properties.map(async (property) => {
          const coordinates: { coordinates: string }[] =
            await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;
          const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
          const longitude = geoJSON.coordinates[0];
          const latitude = geoJSON.coordinates[1];
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
      res.status(200).json(residentsWithFormattedLocation);
    } catch (err: any) {
      res.status(500).json({
        message: `Error fetching current residences: ${err.message}`,
      });
    }
  }
}
