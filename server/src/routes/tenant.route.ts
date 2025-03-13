import express from "express";
import { TenantController } from "../controllers/tenant.controller";

const router = express.Router();

router.get("/:cognitoId", TenantController.getTenenant);
router.put("/:id", TenantController.updateTenant);
router.post("/", TenantController.createTenant);
router.get("/:id/current-residences", TenantController.getCurrentResidences);
router.post("/:cognitoId/favorites/:propertyId", TenantController.addFavoriteProperty);
router.delete("/:cognitoId/favorites/:propertyId", TenantController.removeFavoriteProperty);

export default router;
