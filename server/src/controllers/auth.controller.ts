import { Request, Response } from "express";
import bcrypt from "bcrypt";
export class AuthController {
  public async signin(req: Request, res: Response): Promise<void> {
    try {
      // Getting signin data
      const { password, email } = req.body;
      if (!password || !email) {
        res.status(400).json({
          message: "Bad request please check your data",
        });
      }

      const { user } = req;
      if (!user) {
        res.status(401).json({
          message: "Unauthorized",
        });
        return;
      }

      const isVerified = await bcrypt.compare(password, user?.password || "");
      if (!isVerified) {
        res.status(401).json({
          message: "Unauthorized",
        });
        return;
      }
      res.status(200).json({
        message: "Success",
      });
    } catch (err: any) {
      res.status(500).json({
        message: `Failed to signin ${err.message}`,
      });
    }
  }
}
