import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import router from './routes/userRoutes.router';
import matchRouter from './routes/matchRoutes.router';

fs.mkdirSync("./Public/temp",{recursive:true})

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN==="*"?true:process.env.CORS_ORIGIN,
  credentials:true
}))

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/user", router);
app.use("/match", matchRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statuscode || err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || []
  });
});

export default app;