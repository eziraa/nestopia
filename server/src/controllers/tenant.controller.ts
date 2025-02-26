import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ICTenant } from "../types/tenantTypes";
const prisma = new PrismaClient();
export class TenantController {
  public async listTetents(req: Request, res: Response): Promise<void> {
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

  public async createTenant(req: Request, res: Response): Promise<void> {
    try {
      // Getting tenant data
      const { cognitoId, name, email, phoneNumber } = req.body as ICTenant;

      // Creating tenant
      const tenant = await prisma.tenant.create({
        data: {
          cognitoId,
          name,
          email,
          phoneNumber,
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
    
    public async updateTenant(req: Request, res: Response): Promise<void> {
        try
        {
            // Getting tenant cognito id from request parameters
            const { cognitoId } = req.params;
            // Getting tenant data
            const { name, email, phoneNumber } = req.body as ICTenant;

            // Updating tenant
            const updatedTenant = await prisma.tenant.update({
                where: { cognitoId },
                data: {
                    name,
                    email,
                    phoneNumber,
                },
            });

            // Sending response
            res.json(updatedTenant);
        } catch (error: any)
        {
            res.status(500).json({
                message: `Error updating tenant ${error.message}`,
            });
        }
    }
}
