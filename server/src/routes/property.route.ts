import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware";
import { Role } from "../enums/RoleEnums";
import { PropertyController } from "../controllers/property.controller";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/", PropertyController.listProperties);
router.get("/:id", PropertyController.getProperty);
router.post(
  "/",
  authMiddleware([Role.MANAGER]),
  upload.array("photos"),
  PropertyController.createPropery
);

export default router;
