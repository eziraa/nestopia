import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { Role } from "../enums/RoleEnums";
import { PropertyController } from "../controllers/property.controller";


const router = express.Router();

router.get("/", PropertyController.listProperties);
router.get("/:id", PropertyController.getProperty);
router.post(
  "/",
  authMiddleware([Role.MANAGER]),
  PropertyController.createPropery
);

export default router;
