import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
// app.use(
//   cors({
//     origin: process.env.CROSS_ORIGIN,
//     credentials: true,
//   })
// );
app.use(cors({ credentials: true, origin: "http://localhost:8000" }));
app.use(cookieParser());
app.use(express.json({ limit: "16KB" }));
app.use(express.urlencoded({ extended: true, limit: "16KB" }));
app.use(express.static("public"));
// app.use(cookieParser());
// ROUTES
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter);

// LOCALHOST:3000/users/register
export { app };
