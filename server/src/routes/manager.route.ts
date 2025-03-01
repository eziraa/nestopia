import express from "express";
import { ManagerController } from "../controllers/manager.controller";

const router = express.Router();

router.get("/:cognitoId", ManagerController.getManager);
router.put("/:cognitoId", ManagerController.updateManager);
// router.get("/:cognitoId/properties", ManagerController.);
router.post("/", ManagerController.createManager);

export default router;
