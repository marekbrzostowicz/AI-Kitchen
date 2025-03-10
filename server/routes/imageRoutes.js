const express = require("express");
const { OpenAI } = require("openai");
const fetch = require("node-fetch");
const { checkDailyLimit, logUserOperation } = require("../limits");

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getSirvToken() {
  const response = await fetch("https://api.sirv.com/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: process.env.SIRV_CLIENT_ID,
      clientSecret: process.env.SIRV_CLIENT_SECRET,
    }),
  });
  const data = await response.json();
  if (!data.token) {
    throw new Error("Nie udało się uzyskać tokenu Sirv");
  }
  return data.token;
}

async function uploadToSirv(imageBuffer, fileName) {
  const sirvPath = `/Images/${fileName}`;
  const token = await getSirvToken();
  const response = await fetch(
    `https://api.sirv.com/v2/files/upload?filename=${encodeURIComponent(
      sirvPath
    )}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "image/jpeg",
      },
      body: imageBuffer,
    }
  );

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    console.warn("Nie udało się sparsować odpowiedzi jako JSON:", text);
    data = {};
  }

  if (data.error) {
    throw new Error(`Błąd Sirv: ${data.error.message || JSON.stringify(data)}`);
  }

  const publicUrl = `https://${process.env.SIRV_SUBDOMAIN}.sirv.com${sirvPath}`;
  return publicUrl;
}

router.post("/generate-image", async (req, res) => {
  try {
    const { prompt, userId } = req.body;

    const canGenerate = await checkDailyLimit(userId, "generate_image", 3);
    if (!canGenerate) {
      return res.status(403).json({ error: "Limit przekroczony" });
    }

    await logUserOperation(userId, "generate_image");

    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: "256x256",
    });

    const imageUrl = response.data[0].url;
    res.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error("Error generating image:", error);
    if (error.response?.status === 403) {
      res.status(403).json({ error: "Limit przekroczony" });
    } else {
      res.status(500).json({ error: "Failed to generate image" });
    }
  }
});

router.post("/upload-image", async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl || typeof imageUrl !== "string") {
      return res.status(400).json({ error: "Invalid image URL" });
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch image from OpenAI");
    }
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    const fileName = `recipe-${Date.now()}.jpg`;
    const sirvUrl = await uploadToSirv(imageBuffer, fileName);

    res.json({ success: true, imageUrl: sirvUrl });
  } catch (error) {
    console.error("Error uploading image to Sirv:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

module.exports = router;
