import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class LeaseController {
  static async listLeases(req: Request, res: Response): Promise<void> {
    try {
      const leases = await prisma.lease.findMany({
        include: {
          tenant: true,
          property: true,
        }, 
      });

      res.json(leases);
    } catch (err: any) {
      res.status(200).json({
        message: `Failed to fetch leases ${err.message}`,
      });
    }
  }

  static async getLeasePayments(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payments = await prisma.payment.findMany({
        where: { leaseId: Number(id) },
      });
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({
        message: `Error retrieving lease payments: ${error.message}`,
      });
    }
  }
}
