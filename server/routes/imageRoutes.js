// routes/imageRoutes.js
const express = require("express");
const { OpenAI } = require("openai");
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");
const { checkDailyLimit, logUserOperation } = require("../limits");

const router = express.Router();

// Inicjalizacja OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GENEROWANIE OBRAZÓW
router.post("/generate-image", async (req, res) => {
  try {
    const { prompt, userId } = req.body;

    const canGenerate = await checkDailyLimit(userId, "generate_image", 3);
    if (!canGenerate) {
      return res
        .status(403)
        .json({ error: "Daily image generation limit reached" });
    }

    await logUserOperation(userId, "generate_image");

    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: "256x256",
    });

    const imageUrl = response.data[0].url;

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return res
        .status(400)
        .json({ error: "Something went wrong with image generation." });
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = `recipe-${Date.now()}.jpg`;
    const uploadPath = path.join(__dirname, "../uploads", fileName);

    fs.writeFileSync(uploadPath, buffer);

    res.json({ success: true, localImagePath: `uploads/${fileName}` });
  } catch (error) {
    console.error(
      "Błąd serwera podczas generowania obrazu:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      error: error.response
        ? error.response.data
        : "Something went wrong with image generation.",
    });
  }
});

module.exports = router;
