import dotenv from "dotenv";
import fileupload from "express-fileupload";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { json, urlencoded } from "body-parser";

import HttpError from "./models/HttpError";
import latestNewsRouter from "./routes/latestNews";
import ticketsRouter from "./routes/tickets";
import authRouter from "./routes/auth";

dotenv.config();
const app = express();

app.use(fileupload());
app.use(
  urlencoded({
    extended: false,
    limit: "50mb",
  })
);

app.use(cors());
app.use(json());
app.use(express.static(path.join(__dirname, "/controllers/public/")));

const PORT = process.env.PORT ? process.env.PORT : 3000;

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/latestNews", latestNewsRouter);
app.use("/api/v1/tickets", ticketsRouter);

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.code || 500).json({
    error: {
      message: err.message || "Server is busy at the moment !",
      statusCode: err.code || 500,
      requestStatus: "Fail",
    },
  });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.flykt.mongodb.net/Group-Houses?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started at port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
