import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import userPlanRoutes from "./routes/userPlanRoutes.js";
import withdrawRoutes from "./routes/withdrawRoutes.js";
import levelRoutes from "./routes/levelRoutes.js";
import levelUnlockRoutes from "./routes/levelUnlockRoutes.js";
import rankRoutes from "./routes/rankRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import "./cron/roiCron.js";

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "https://avgstaking.com",
  "https://www.avgstaking.com",
  "http://localhost:5173", // Local development
];

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header, such as server-to-server requests
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/user-plans", userPlanRoutes);
app.use("/api/withdrawals", withdrawRoutes);
app.use("/api/levels", levelRoutes);
app.use("/api/level-unlock", levelUnlockRoutes);
app.use("/api/ranks", rankRoutes);
app.use("/api/banner-slides", bannerRoutes);

export default app;
