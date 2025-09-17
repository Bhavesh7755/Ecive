import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
  origin: ["http://localhost:5173"], // allow frontend
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

// // routes decleration
app.use("/api/v1/users", userRouter) // http://localhost:8000/api/v1/users
app.use("/api/v1/recyclers", recyclerRouter) // http://localhost:8000/api/v1/recyclers

export { app }