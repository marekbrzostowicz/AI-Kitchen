require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { OpenAI } = require("openai");
const path = require("path");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = process.env.PORT || 8000;
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(bodyParser.json());

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const imageRoutes = require("./routes/imageRoutes");

const extraRoutes = require("./routes/extraRoutes");

app.use("/auth", authRoutes);
app.use("/recipes", recipeRoutes);
app.use("/api", imageRoutes);
app.use("/api", extraRoutes);

app.get("/", (req, res) => {
  res.redirect("/api/recipes"); // Zmieniasz na swój endpoint
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
