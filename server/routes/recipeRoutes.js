require("dotenv").config();
const express = require("express");
const path = require("path");
const { OpenAI } = require("openai");
const { checkDailyLimit, logUserOperation } = require("../limits");

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/generate", async (req, res) => {
  try {
    const { userId, ingredients, language, cuisine, calories } = req.body;

    const canGenerate = await checkDailyLimit(userId, "generate_recipe", 16);
    if (!canGenerate) {
      return res
        .status(403)
        .json({ error: "Daily recipe generation limit reached" });
    }

    await logUserOperation(userId, "generate_recipe");

    console.log(
      "Składniki:",
      ingredients,
      "Language:",
      language,
      "Cuisine:",
      cuisine,
      "Carlories",
      calories
    );

    const languageMap = {
      gb: "English",
      pl: "Polish",
      de: "German",
      es: "Spanish",
      fr: "French",
    };
    const cuisineMap = {
      pl: "polish",
      it: "italy",
      jp: "japanese",
      cn: "chineese",
      mx: "mexician",
      in: "india",
      fr: "french",
    };
    const selectedCuisine = cuisineMap[cuisine] || "any";
    const selectedLanguage = languageMap[language] || "English";

    const prompt = `
  You are a strict AI chef assistant. Each request is a NEW, independent task. Ignore any previous instructions or conclusions.
  
  **IMPORTANT**:
  - Your entire response (titles, ingredients, instructions, any additional comments) must be written in ${selectedLanguage}.
  - If the user-provided ingredients are in a different language, translate them into ${selectedLanguage}.
  
  ### Ingredients:
  ${ingredients}
  
  ### Cuisine: ${cuisine}
  
  ### Rules:
  1. Use only the provided ingredients. Do not add new ones.
  2. Stick **strictly** to the ${cuisine} cuisine style.
3. If the provided ingredients are not typically used in ${cuisine} cuisine, still generate two creative recipes using only the provided ingredients. However, at the end of each recipe's instructions, include a warning in English such as: "Warning: With the provided ingredients, it is challenging to prepare a traditional ${cuisine} dish." Make sure to include all recipe sections (Title, Ingredients, Instructions, and Cuisine code).

  4. If the ingredients cannot make a dish at all, return **"no_recipe"** with no explanation.
  5. If any ingredient is not food, return **"no_recipe"** and list the non-food items starting with "non-food items:".
  
  ### Format:
  If the ingredients qualify for ${cuisine} cuisine:
  Title1: [Recipe Name]
  Ingredients1: [List only the provided ingredients in ${selectedLanguage} in format 1. 2. 3. ...] 
  Instructions1:
    - Start each line with a number and a period (e.g., "1.").
    - Be placed on its own line.
    - Be detailed and descriptive, explaining techniques, textures, and flavors.
    - Include alternative methods, tips for enhancing flavor, and common mistakes to avoid.
  Cuisine1: [ISO 3166-1 cuisine code]
  
  Title2: [Recipe Name]
  Ingredients2: [List only the provided ingredients in ${selectedLanguage} in format 1. 2. 3. ...]
  Instructions2:
    - Start each line with a number and a period (e.g., "1.").
    - Be placed on its own line.
    - Be detailed and descriptive, explaining techniques, textures, and flavors.
    - Include alternative methods, tips for enhancing flavor, and common mistakes to avoid.
  Cuisine2: [ISO 3166-1 cuisine code]
  
  ### IMPORTANT:
  Instructions must be long at least 8, 9 detailed steps.
  - If the ingredients **do not qualify** for ${cuisine} cuisine, return **only**:
    - Cuisine1: ${cuisine}
    - Cuisine2: ${cuisine}
  - If the ingredients **cannot make a dish**, return **"no_recipe"**.
  - If the ingredients contain non-food items, return **"no_recipe"** and list them.
  - The response must always include **either two full recipes OR only the cuisine flags OR "no_recipe"**.
  
  Answer in ${selectedLanguage}.
  calories = ${calories}
  
  If "calories" is true, list the estimated calories for each ingredient next to it in the "Ingredients1:" and "Ingredients2:" sections in the following format:
  
  **Example (when calories is true):  
  IngredientName (100 kcal) 50 g  
  write unit abbreviations
  
  - Ensure the calorie count is accurate and appropriate for a standard serving size of the ingredient.
  - The calorie value should always be inside parentheses, while the portion size should follow after the parentheses without brackets.
  - Do not include any commas between the calorie count and portion size.
  - Always specify a detailed portion unit (e.g., grams, slices, tbsp, tsp, ml, cups, pieces, whole).
  
  If "calories" is false, do not include calorie information. Instead, list the ingredient name **followed directly** by the portion size:
  
  **Example (when calories is false):  
  IngredientName 50 grams
  
  - Do not use parentheses for portion sizes, only for calories when "calories" is true.
  - Ensure every ingredient always includes a portion size in both cases.
  `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const chatResponse = response.choices[0].message.content;
    res.json({ recipe: chatResponse });
  } catch (error) {
    console.error("Błąd podczas wywołania OpenAI:", error);
    res
      .status(500)
      .json({ error: "Something went wrong with OpenAI request." });
  }
});

module.exports = router;
