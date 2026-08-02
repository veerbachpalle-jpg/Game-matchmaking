import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import router from './routes/userRoutes.router.js';
import matchRouter from './routes/matchRoutes.router.js';

import { getCorsOptions } from './utils/corsOptions.js';

fs.mkdirSync("./Public/temp", { recursive: true })

const app = express()

app.use(cors(getCorsOptions()))

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