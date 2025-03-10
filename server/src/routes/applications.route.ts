import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { Role } from "../enums/RoleEnums";
import { ApplicationController } from "../controllers/application.controller";

const router = express.Router();

router.post(
  "/",
  authMiddleware([Role.TENANT]),
  ApplicationController.createApplication
);
router.put(
  "/:id/status",
  authMiddleware([Role.MANAGER]),
  ApplicationController.updateApplicationStatus
);
router.get(
  "/",
  authMiddleware([Role.TENANT, Role.MANAGER]),
  ApplicationController.listApplications
);

export default router;
