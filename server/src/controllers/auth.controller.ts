import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { Role } from "../enums/RoleEnums";

const prisma = new PrismaClient();

export class AuthController {
  /**
   * User Signup
   */
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      if (!(await AuthController.validateSignup(req, res))) {
        return;
      }
      const { name, email, password, phoneNumber, role } = req.body;

      let existingUser;
      // Check if user already exists
      if (role === Role.MANAGER)
        existingUser = await prisma.manager.findFirst({
          where: {
            email: email,
          },
        });
      else {
        existingUser = await prisma.tenant.findFirst({
          where: {
            email: email,
          },
        });
      }
      if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      let newUser;
      if (role === Role.MANAGER) {
        newUser = await prisma.manager.create({
          data: {
            cognitoId: crypto.randomUUID(),
            name,
            email,
            phoneNumber,
            password: hashedPassword,
            role: Role.MANAGER,
          },
        });
      } else {
        newUser = await prisma.tenant.create({
          data: {
            cognitoId: crypto.randomUUID(),
            name,
            email,
            phoneNumber,
            password: hashedPassword,
          },
        });
      }

      // Save user ID in session (if using sessions)
      req.user = {
        cognitoId: newUser.cognitoId,
        id: newUser.id,
        email: newUser.email,
        role: role || Role.TENANT,
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
      };

      res
        .status(201)
        .json({ message: "User registered successfully", newUser });
      return;
    } catch (error) {
      console.error("Signup Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  /**
   * User Sign-In
   */

  static async signin(req: Request, res: Response):Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
         res.status(400).json({ message: "Email and password are required" });
         return;
      }

      res.clearCookie("token",{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        })

      let role = Role.MANAGER;
      let user = await prisma.manager.findFirst({ where: { email } });

      if (!user) {
        user = await prisma.tenant.findFirst({ where: { email } });
        role = Role.TENANT;
      }

      if (!user) {
         res.status(404).json({ message: "User not found" });
         return
      }
      if(user.password === 'password'){
        const hashedPassword = await bcrypt.hash(password, 10);
        if(user.role === Role.TENANT)
          user = await prisma.tenant.update({
            where: { id: user.id },
            data: {
              password: hashedPassword,
              cognitoId: user.cognitoId
            },
          });
        else
        user = await prisma.manager.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
            cognitoId: user.cognitoId
          },
        });
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT secret is not defined");
      }
      
      const isMatch = await bcrypt.compare(password, user.password!);
      if (!isMatch) {
         res.status(401).json({ message: "Invalid credentials" });
         return;
      }
      if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
        throw new Error("JWT secrets are not defined");
      }

      // Generate Access Token (short-lived)
      const token = jwt.sign({ id: user.cognitoId, role }, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });


      // Store access token in HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      // Generate Refresh Token (long-lived)
      const refreshToken = jwt.sign({ id: user.cognitoId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
      });

      // Store refresh token in HTTP-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });


      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          role,
        },
      });
    } catch (error: any) {
      console.error("Signin Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Refresh Token Method
  static async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
      }

      if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error("JWT_REFRESH_SECRET is not defined");
      }

      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err: any, decoded: any) => {
        if (err) return res.status(403).json({ message: "Invalid refresh token" });

        const user = await prisma.manager.findUnique({ where: { id: decoded.id } }) ||
                     await prisma.tenant.findUnique({ where: { id: decoded.id } });

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        if(!process.env.JWT_SECRET){
          res.json("JWT_SECRET is not defined")
          return;
        }
        // Generate a new access token
        const newAccessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
          expiresIn: "15m",
        });

        res.json({ token: newAccessToken });
      });
    } catch (error: any) {
      console.error("Refresh Token Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  /**
   * Get current user
   */
  static async getCurrUser(req: Request, res: Response) {
    if (!req.user?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    try {
     
      if (req.user) {
        res.json({ user: { ...req.user } });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (err) {
      res.status(500).json({ message: "Failed to current user" });
    }
  }

  /**
   * Logout
   */
  static async logout(req: Request, res: Response) {

    try {

      
      res.clearCookie("token",{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        })

        res.json({ message: "Logged out successfully" });

    } catch (error) {
      res.status(500).json({ message: "Logout failed please tray again!!" });
    }
    
  }

  static async validateSignup(req: Request, res: Response) {
    // Getting data
    const { name, email, password, confirmpassword } = req.body;
    const errors = [];
    if (!name) {
      errors.push("Name is required");
    }
    if (name && name.length < 3) {
      errors.push("Name length should be at least 3");
    }
    if (!email) {
      errors.push("Email is required");
    }
    const emailregex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
    if (!email.match(emailregex)) {
      errors.push("Invalid email format");
    }
    if (!password) {
      errors.push("Password is required");
    }
    if (password && password.length < 8) {
      errors.push("Password length should be at leaset 8");
    }
    if (password !== confirmpassword) {
      errors.push("Password not match with the confirmition");
    }

    if (errors.length) {
      res.status(400).json({
        message: errors.join(","),
      });
      return false;
    } else return true;
  }
}


