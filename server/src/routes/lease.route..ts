import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { Role } from "../enums/RoleEnums";
import { LeaseController } from "../controllers/lease.controller";

const router = express.Router();

router.get(
  "/",
  authMiddleware([Role.MANAGER, Role.TENANT]),
  LeaseController.listLeases
);
router.get(
  "/:id/payments",
  authMiddleware([Role.MANAGER, Role.TENANT]),
  LeaseController.getLeasePayments
);

export default router;
