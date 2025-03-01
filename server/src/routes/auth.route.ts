import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
const router = Router();
router.post("/signin", AuthController.signin);
router.post("/signup", AuthController.signup);
router.post("/logout", AuthController.logout);
router.get("/current", AuthController.getCurrUser);

export default router;
