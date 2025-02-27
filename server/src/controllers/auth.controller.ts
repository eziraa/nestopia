import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
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
      const { name, email, password, confirmPassword } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });
      if (existingUser) {
        res.status(400).json({ message: "User already exists" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user in DB
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
      });

      // Save user ID in session (if using sessions)
      req.user = { id: user.id.toString(), email: user.email, role: Role.NONE };

      res.status(201).json({ message: "User registered successfully", user });
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
      const user = await prisma.user.findFirst({ where: { email } });
      if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user in session (or generate JWT)
      req.user = { id: user.id.toString(), role: Role.NONE, email: user.email };

      res.json({ message: "Login successful", user });
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


