import { Request, Response } from "express";
import { ApplicationStatus, PrismaClient } from "@prisma/client";
import { Role } from "../enums/RoleEnums";
import { PaymentUtil } from "./utils/paymentUtils";
import { ICApplication } from "../types/application";
const prisma = new PrismaClient();

export class ApplicationController {
  static async listApplications(req: Request, res: Response): Promise<void> {
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
        where: {},
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
          if (!app.tenantCognitoId) {
            return {
              ...app,
              property: {
                ...app.property,
                address: app.property.location.address,
              },
              manager: app.property.manager,
              lease: null,
            };
          }
          const lease = await prisma.lease.findFirst({
            where: {
              tenantCognitoId: app.tenantCognitoId,
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

  static async createApplication(req: Request, res: Response): Promise<void> {
    try {
      //getting application details
      const {
        applicationDate,
        status,
        propertyId,
        tenantId,
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
              connect: { id: Number(tenantId) },
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
              connect: { id: Number(tenantId) },
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

  static async updateApplicationStatus(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      // Getting appplication id from request parameters
      const { id } = req.params;
      // Getting status from request body
      const { status } = req.body;

      // Getting application by its id
      const application = await prisma.application.findUnique({
        where: { id: Number(id) },
        include: {
          property: true,
          tenant: true,
        },
      });

      // Throw error if application not found
      if (!application) {
        res.status(404).json({
          message: "Application not found",
        });
        return;
      }

      if (status === ApplicationStatus.Approved) {
        // Create a new lease for the application
        const newLease = await prisma.lease.create({
          data: {
            startDate: new Date(),
            endDate: new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ),
            rent: application.property.pricePerMonth,
            deposit: application.property.securityDeposit,
            propertyId: application.propertyId,
            tenantCognitoId: application.tenantCognitoId,
          },
        });

        // Update the property to connect the tenant
        await prisma.property.update({
          where: { id: application.propertyId },
          data: {
            tenants: {
              connect: { id: Number(application.tenantCognitoId) },
            },
          },
        });

        // Update the application  with new lease
        await prisma.application.update({
          where: { id: Number(id) },
          data: {
            status,
            leaseId: newLease.id,
          },
        });
      } else {
        // Update the application status (for both "Denied" and other statuses)
        await prisma.application.update({
          where: { id: Number(id) },
          data: { status },
        });
      }

      // Getting the updated application details
      const updatedApplication = await prisma.application.findUnique({
        where: { id: Number(id) },
        include: {
          property: true,
          tenant: true,
          lease: true,
        },
      });

      // Sending the updated application details in response
      res.status(200).json(updatedApplication);
    } catch (error: any) {
      res.status(500).json({
        message: `Error updating application: ${error.message}`,
      });
    }
  }
}
