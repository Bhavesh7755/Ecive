import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN.split(","), // allow frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));


app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true, limit: '16kb'}));
app.use(express.static('public'));
app.use(cookieParser());


// /routes import
import userRouter from './routes/user.routes.js';
import recyclerRouter from './routes/recycler.routes.js';
import postRouter from './routes/post.routes.js';

// // routes decleration
app.use("/api/v1/users", userRouter) // http://localhost:8000/api/v1/users
app.use("/api/v1/recyclers", recyclerRouter) // http://localhost:8000/api/v1/recyclers
app.use('/api/v1/posts', postRouter); // http://localhost:8000/api/v1/posts



import { ApiError } from "./utils/ApiError.js";

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors
    });
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});





export { app }