import express from 'express';
import { ApiResponse } from './src/utils/api-response.js';
import userRouter from './src/routes/user.routes.js';

const app = express();

app.use(express.json());
app.use("/api/v1/users", userRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, null, message));
});

export default app;