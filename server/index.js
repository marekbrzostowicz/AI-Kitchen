require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { OpenAI } = require("openai");
const path = require("path");
const cron = require("node-cron");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = process.env.PORT || 8000;
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      // "https://gleaming-longma-5a0d19.netlify.app",
      "https://f4fdv33rbjsdc.xyz",
    ],
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

// app.get("/", (req, res) => {
//   res.redirect("/api/recipes");
// });

cron.schedule("0 0 * * *", async () => {
  try {
    await pool.query("DELETE FROM user_operations_log");
  } catch (error) {
    console.error(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
