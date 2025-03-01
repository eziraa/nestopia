import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { Role } from "../enums/RoleEnums";
import { getRandomValues } from "crypto";

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
        id: newUser.id.toString(),
        email: newUser.email,
        role: role || Role.TENANT,
      };

      res
        .status(201)
        .json({ message: "User registered successfully", newUser });
    } catch (error) {
      console.error("Signup Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  /**
   * User Sign-In
   */
  static async signin(req: Request, res: Response) {
    try {
      // Getting sign in payload
      const { email, password } = req.body;

      // Validate email and password
      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      // Find user by email
      const user = await prisma.manager.findFirst({ where: { email } });
      if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password || "password");
      if (!isMatch) {
        res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user in session (or generate JWT)
      req.user = { id: user.id.toString(), role: Role.NONE, email: user.email };

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error: any) {
      console.error("Signin Error:", error);
      // Handle known Prisma errors
      if (error.code === "ECONNREFUSED") {
        res.status(503).json({
          message: "Database connection failed. Please try again later.",
        });
      } else res.status(500).json({ message: "Internal Server Error" });
    }
  }

  /**
   * Get current user
   */
  static async getCurrUser(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    try {
      // Get tenant or manager by user ID
      const tenant = await prisma.tenant.findFirst({
        where: { email: req.user.email },
      });
      const manager = await prisma.manager.findFirst({
        where: { email: req.user.email },
      });
      if (tenant) {
        req.user.role = Role.TENANT;
      }
      if (manager) {
        req.user.role = Role.MANAGER;
      }
    } catch (err) {
      res.status(500).json({ message: "Failed to current user" });
    }
    res.json({ user: req.user });
  }

  /**
   * Logout
   */
  static async logout(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
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


