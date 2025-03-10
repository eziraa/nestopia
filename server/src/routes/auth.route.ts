import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { Role } from "../enums/RoleEnums";
const router = Router();
router.post("/signin", AuthController.signin);
router.post("/signup", AuthController.signup);
router.post(
  "/logout",
  authMiddleware([Role.MANAGER, Role.TENANT, Role.NONE]),
  AuthController.logout
);
router.get(
  "/current",
  authMiddleware([Role.MANAGER, Role.TENANT, Role.NONE]),
  AuthController.getCurrUser
);

export default router;

