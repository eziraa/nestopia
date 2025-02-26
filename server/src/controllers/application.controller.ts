import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Role } from "../enums/RoleEnums";
import { PaymentUtil } from "./utils/paymentUtils";
import { ICApplication } from "../types/application";
const prisma = new PrismaClient();

export class ApplicationController {
  async listApplications(req: Request, res: Response): Promise<void> {
    try {
      //getting query parameteres
      const { userId, role } = req.query as { userId: string; role: Role };

      //prepate conditions
      let whereClause = {};
      if (userId && role) {
        if (role === Role.TENANT) {
          whereClause = {
            tenantCognitoId: String(userId),
          };
        }
      } else if (role === Role.MANAGER) {
        whereClause = {
          property: {
            managerCognitoId: String(userId),
          },
        };
      }

      //getting applications
      const application = await prisma.application.findMany({
        where: whereClause,
        include: {
          property: {
            include: {
              location: true,
              manager: true,
            },
          },
          tenant: true,
        },
      });

      //formatting applications

      const formattedApplications = await Promise.all(
        application.map(async (app) => {
          const lease = await prisma.lease.findFirst({
            where: {
              tenant: {
                cognitoId: app.tenantCognitoId,
              },
              propertyId: app.propertyId,
            },
            orderBy: { startDate: "asc" },
          });

          return {
            ...app,
            property: {
              ...app.property,
              address: app.property.location.address,
            },
            manager: app.property.manager,
            lease: lease
              ? {
                  ...lease,
                  nextPaymentDate: PaymentUtil.calculateNextPaymentDate(
                    lease.startDate
                  ),
                }
              : null,
          };
        })
      );

      //sending response
      res.json(formattedApplications);
    } catch (error: any) {
      res.status(500).json({
        message: `Error fetching applicatios ${error.message}`,
      });
    }
  }

  async createApplication(req: Request, res: Response): Promise<void> {
    try {
      //getting application details
      const {
        applicationDate,
        status,
        propertyId,
        tenantCognitoId,
        name,
        email,
        phoneNumber,
        message,
      } = req.body as ICApplication;

      // getting property details
      const property = await prisma.property.findUnique({
        where: {
          id: propertyId,
        },
        select: {
          pricePerMonth: true,
          securityDeposit: true,
        },
      });

      //thorw error if property not found
      if (!property) {
        res.status(404).json({ message: "Property not found" });
        return;
      }

      //create application with transaction

      const newApplication = await prisma.$transaction(async (prisma) => {
        //Creating lease first

        const lease = await prisma.lease.create({
          data: {
            startDate: new Date(),
            endDate: new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ),
            rent: property.pricePerMonth,
            deposit: property.securityDeposit,
            property: {
              connect: { id: propertyId },
            },
            tenant: {
              connect: { cognitoId: tenantCognitoId },
            },
          },
        });

        // Then create application with lease connection
        const application = await prisma.application.create({
          data: {
            applicationDate: new Date(applicationDate),
            status,
            name,
            email,
            phoneNumber,
            message,
            property: {
              connect: { id: propertyId },
            },
            tenant: {
              connect: { cognitoId: tenantCognitoId },
            },
            lease: {
              connect: { id: lease.id },
            },
          },
          include: {
            tenant: true,
            lease: true,
            property: true,
          },
        });

        return application;
      });

      res.status(201).json(newApplication);
    } catch (err: any) {
      res.status(500).json({
        message: `Failed to create application ${err.message}`,
      });
    }
  }
}
