const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { OpenAI } = require("openai");
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");

const limits = require("../limits");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/save-recipe
 */
router.post("/save-recipe", async (req, res) => {
  try {
    const {
      title,
      ingredients,
      instructions,
      cuisineFlag,
      totalCalories,
      imageUrl,
      rating,
      userId,
    } = req.body;

    console.log("Otrzymano żądanie zapisu:", req.body);

    if (!title || !ingredients || !instructions) {
      console.log("Brak wymaganych pól:", req.body);
      return res.status(400).json({ message: "Brak wymaganych pól" });
    }
    const query = `INSERT INTO recipes (title, ingredients, instructions, cuisineFlag, totalCalories, imageUrl, rating, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      query,
      [
        title,
        JSON.stringify(ingredients),
        instructions,
        cuisineFlag,
        totalCalories,
        imageUrl,
        rating,
        userId,
      ],
      (err, result) => {
        if (err) {
          console.error("Błąd zapisu do bazy:", err);
          return res
            .status(500)
            .json({ message: "Błąd zapisu do bazy", error: err.message });
        }
        console.log("Przepis zapisany do bazy:", title);
        res.status(201).json({
          message: "Przepis został zapisany!",
          recipeId: result.insertId,
        });
      }
    );
  } catch (error) {
    console.error("Błąd serwera:", error);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

/**
 * GET /api/recipes
 */
router.get("/recipes", async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: "Brak userId" });
    }

    const query = "SELECT * FROM recipes WHERE user_id = ?";
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Błąd pobierania przepisów:", err);
        return res.status(500).json({ message: "Błąd pobierania przepisów" });
      }
      res.json(results);
    });
  } catch (error) {
    console.error("Błąd serwera:", error);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

/**
 * DELETE /api/recipes/:recipeId
 */
router.delete("/recipes/:recipeId", async (req, res) => {
  const recipeId = parseInt(req.params.recipeId, 10);
  console.log("Otrzymane ID do usunięcia:", recipeId);

  try {
    const [result] = await db
      .promise()
      .execute("DELETE FROM recipes WHERE id = ?", [recipeId]);

    console.log("Wynik usunięcia:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ message: "Recipe deleted" });
  } catch (err) {
    console.error("Błąd serwera:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /ingredient
 */
router.post("/ingredient", async (req, res) => {
  const param = req.query.param;
  const { userId } = req.body;
  console.log("Otrzymano parametr:", param);

  try {
    const canGenerate = await limits.checkDailyLimit(
      userId,
      "ingredient_info",
      30
    );
    if (!canGenerate) {
      return res.status(403).json({ error: "Przekroczono limit informacji" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Podaj krótką i przydatną informację o składniku: "${param}" w języku, w jakim jest napisany składnik. Napisz 3 zdania z ciekawymi informacjami o składniku.  
- Nie podawaj koloru składnika... odpowiedz w formacie SKŁADNIK(emotka) - OPIS`,
        },
      ],
      temperature: 0,
    });

    await limits.logUserOperation(userId, "ingredient_info");
    console.log(response.choices[0].message.content);
    res.json({ description: response.choices[0].message.content });
  } catch (error) {
    console.error("Błąd OpenAI:", error);
    res.status(500).json({ error: "Błąd podczas pobierania danych" });
  }
});

module.exports = router;
