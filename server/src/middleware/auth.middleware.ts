import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Role } from "../enums/RoleEnums";
import { Manager, PrismaClient, Tenant } from "@prisma/client";

const prisma = new PrismaClient();

interface DecodedToken extends JwtPayload {
  id: string;
  role: Role;
}

interface User {
  id: number;
  role: Role;
  password?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: (User & { role: Role , cognitoId: string}) | null;
      cookie?: { token: string; refreshToken: string };
    }
  }
}

// Helper function to generate a new access token
const generateAccessToken = (user: User): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret is not defined");
  }
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // Short lifespan for access token
  );
};

// Helper function to verify and refresh the access token
const verifyAndRefreshToken = async (req: Request, res: Response) => {
  const cookies = req.headers.cookie
    ?.split("; ")
    .reduce((acc, cookie) => {
      const [name, value] = cookie.split("=");
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>) || {};

  let token = cookies?.token;
  const refreshToken = cookies?.refreshToken;
  console.log("@@AT COOKIE", token);
  console.log("@@ACCESS TOKEN", token);
  console.log("@@REFRESH TOKEN", refreshToken);



  if (!token && !refreshToken) {
    return null;
  }

  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    res.status(500).json({ message: "Internal server error" });
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
  } catch (err) {
    console.log("Access token expired, attempting refresh...");

    if (!refreshToken) {
      res.status(401).json({ message: "Unauthorized, please login" });
      return null;
    }

    try {
      const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as DecodedToken;
      let user = await prisma.manager.findUnique({ where: { cognitoId: decodedRefresh.id } });

      let role = Role.MANAGER;
      if (!user) {
        user = await prisma.tenant.findUnique({ where: { cognitoId: decodedRefresh.id } });
        role = Role.TENANT;
      }

      if (!user) {
        res.status(401).json({ message: "Invalid refresh token" });
        return null;
      }

      const newAccessToken = generateAccessToken({ id: user.id, role });

      res.cookie("token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      return jwt.verify(newAccessToken, process.env.JWT_SECRET) as DecodedToken;
    } catch (refreshError) {
      console.error("Failed to refresh token:", refreshError);
      res.status(401).json({ message: "Invalid refresh token, please login again" });
      return null;
    }
  }
};

// Middleware to check authentication and refresh if needed
export const authMiddleware = (allowedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const decoded = await verifyAndRefreshToken(req, res);
    console.log("@@DECODDE",decoded)
    if (!decoded) {
      res.status(401).json({ message: "Unauthorized, please login" });
      return;
    }

    let role = decoded.role;
    if(!role){
      res.status(401).json({ message: "Unauthorized, please login" });
      return
    }

    let user : Manager | Tenant | null = null;

    if(role === Role.MANAGER){
     user = await prisma.manager.findUnique({ where: { cognitoId: decoded.id } });
    }
    if (!user) {
      user = await prisma.tenant.findUnique({ where: { cognitoId: decoded.id } });
      role = Role.TENANT;
    }

    if (!user) {
      console.log("Error finding user");
      console.log("Cog ID", decoded.id);
      console.log("Role", role);
      res.status(401).json({ message: "Unauthorized, please login" });
      return;
    }

    req.user = {
      id: user.id,
      role,
      name: user.name || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      cognitoId: user.cognitoId || "",
    };

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: `Access Denied for role: ${role}` });
      return;
    }

    next();
  };
};
