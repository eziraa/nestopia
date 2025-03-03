import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Role } from "../enums/RoleEnums";
import { Manager, Tenant } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
interface DecodedToken extends JwtPayload {
  sub: string;
  "custom:role"?: string;
}

interface User {
  id: string;
  role: Role;
  password?: string;
  name?: string;
  email?: string;
  confirmpassword?: string;
  phoneNumber?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: (User | Tenant | Manager) & { role: Role };
      cookie?: { token: string };
    }
  }
}

export const authMiddleware = (allowedRoles: Role[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const cookies = req.headers.cookie?.split("; ").reduce((acc, cookie) => {
      const [name, value] = cookie.split("=");
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);
    const token = cookies?.token;
    if (!token) {
      res.status(401).json({ message: "Unauthorized please login" });
      return;
    }

    try {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        id: number;
        role: Role;
      };
      let role = Role.MANAGER;

      let user = await prisma.manager.findUnique({ where: { id: decoded.id } });
      if (!user) {
        user = await prisma.tenant.findUnique({ where: { id: decoded.id } });
        role = Role.TENANT;
      }
      req.user = {
        id: decoded.id,
        role: role,
        cognitoId: user?.cognitoId || "",
        name: user?.name || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        password: "",
      };
      // Set token in HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true, // Prevents client-side access
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "strict", // CSRF protection
        maxAge: 3600000, // 1 hour
      });
      console.log("User:", req.user);

      if (!req.user) {
        res.status(401).json({ message: "Unauthorized please login" });
        return;
      } else {
        next();
      }
      const hasAccess = allowedRoles.includes(req.user.role);
      if (!hasAccess) {
        res.status(403).json({ message: "Access Denied" });
        return;
      }
    } catch (err) {
      console.error("Failed to decode token:", err);
      res.status(400).json({ message: "Invalid token" });
      return;
    }
  };
};
