import { ApplicationStatus } from "@prisma/client";

export interface ICApplication {
  applicationDate: Date;
  status: ApplicationStatus;
  propertyId: number;
  tenantId: string;
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
}
