require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const articleRoutes = require("./routes/articleRoutes");
const userRoutes = require("./routes/userRoutes");
const moderationRoutes = require("./routes/moderationRoutes");
const commentRoutes = require("./routes/commentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000'];
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : defaultOrigins;

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "MediaGuard API is running", health: "/api/health" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

// Обработчик ошибок должен быть последним в цепочке middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
