import express, { NextFunction, Response, Request } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
/* ROUTE IMPORT */
import authrouter from "./routes/auth.route";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret_key90nfi2",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
/* ROUTES */
app.get("/", (req, res) => {
  res.send("This is home route");
});

app.use("/auth", authrouter);

/* SERVER */
const port = Number(process.env.PORT) || 3002;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
