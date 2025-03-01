import express from "express";
import { TenantController } from "../controllers/tenant.controller";

const router = express.Router();

router.get("/:id", TenantController.getTenenant);
router.put("/:id", TenantController.updateTenant);
router.post("/", TenantController.createTenant);
router.get("/:id/current-residences", TenantController.getCurrentResidences);

export default router;
