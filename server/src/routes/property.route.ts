import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { Role } from "../enums/RoleEnums";
import { PropertyController } from "../controllers/property.controller";
import multer from "multer";
import { uploadPhotos } from "../upload";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

router.get("/", PropertyController.listProperties);
router.get("/:id", PropertyController.getProperty);
router.post(
  "/",
  upload.array("photos"),
  uploadPhotos,
  authMiddleware([Role.MANAGER]),
  PropertyController.createPropery
);

export default router;
