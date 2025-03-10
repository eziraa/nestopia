import express, { NextFunction, Response, Request } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import { authMiddleware } from "./middleware/auth.middleware";
/* ROUTE IMPORT */
import authrouter from "./routes/auth.route";
import tenantRoutes from "./routes/tenant.route";
import managerRoutes from "./routes/manager.route";
import propertyRoutes from "./routes/property.route";
import leaseRoutes from "./routes/lease.route.";
import applicationRoutes from "./routes/applications.route";
import { Role } from "./enums/RoleEnums";
import path from "path";
/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Keep this if you want to enforce a cross-origin policy

// Configure Referrer-Policy header manually to allow for cross-origin
app.use((req, res, next) => {
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  next();
});

app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* CORS CONFIGURATION */
app.use(
  cors({
    origin: "http://localhost:3000", // Allow your frontend to make requests
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies/authorization headers to be sent with requests
  })
);

/* ROUTES */
app.get("/api/", (req, res) => {
  res.send("This is the home route");
});

app.use("/api/auth", authrouter);
app.use("/api/applications", applicationRoutes);
app.use(
  "/api/properties",
  propertyRoutes
);
app.use("/api/leases", leaseRoutes);
app.use("/api/tenants", authMiddleware([Role.TENANT]), tenantRoutes);
app.use("/api/managers", authMiddleware([Role.MANAGER]), managerRoutes);

/* SERVER */
const port = Number(process.env.PORT) || 3002;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
app.use(
  "/api/uploads",
  express.static(path.join(__dirname, "/uploads"))
);

