import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { optionalAuthentication } from "./middleware/auth";
import { handleError } from "./middleware/error";
import routes from "./routes";

const app = express();

app.use(bodyParser.json()); // Middleware to parse JSON input
app.use(cors());
app.use(optionalAuthentication);
app.use(handleError);
app.use("/api/v1", routes);

export default app;
