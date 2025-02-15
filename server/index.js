require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { OpenAI } = require("openai");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

// Ustaw klucz API (w praktyce: przechowuj w .env lub innym bezpiecznym miejscu)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = process.env.PORT;
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

// Połączenie z bazą MySQL
const db = require("./database");
const { checkDailyLimit } = require("./limits");

// REJESTRACJA
app.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";
    db.query(query, [email, username, hashedPassword], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGOWANIE
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      "secret_key",
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      username: user.username,
      userId: user.id,
    });
  });
});

//=========================================================
// GENEROWANIE PRZEPISU
app.post("/generate", async (req, res) => {
  try {
    const { userId, ingredients, language, cuisine, calories } = req.body;

    const canGenerate = await limits.checkDailyLimit(
      userId,
      "generate_recipe",
      15
    );
    if (!canGenerate) {
      return res
        .status(403)
        .json({ error: "Daily recipe generation limit reached" });
    }

    await limits.logUserOperation(userId, "generate_recipe");

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
3. If the ingredients do not qualify for ${cuisine} cuisine, return only **Cuisine1: ${cuisine}** and **Cuisine2: ${cuisine}** with no explanation.
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

//=========================================================
const limits = require("./limits");
const { error } = require("console");

app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, userId } = req.body;

    const canGenerate = await limits.checkDailyLimit(
      userId,
      "generate_image",
      3
    );
    if (!canGenerate) {
      return res
        .status(403)
        .json({ error: "Daily image generation limit reached" });
    }

    await limits.logUserOperation(userId, "generate_image");

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
    const uploadPath = path.join(__dirname, "uploads", fileName);

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
//=========================================================
app.post("/api/save-recipe", async (req, res) => {
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
//=========================================================
app.get("/api/recipes", async (req, res) => {
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
//=========================================================
app.delete("/api/recipes/:recipeId", async (req, res) => {
  const recipeId = parseInt(req.params.recipeId, 10);
  console.log("Otrzymane ID do usunięcia:", recipeId); // 👀 Sprawdź, jakie ID dostaje Express

  try {
    const [result] = await db
      .promise()
      .execute("DELETE FROM recipes WHERE id = ?", [recipeId]);

    console.log("Wynik usunięcia:", result); //

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ message: "Recipe deleted" });
  } catch (err) {
    console.error("Błąd serwera:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/ingredient", async (req, res) => {
  const param = req.query.param;
  const { userId } = req.body;
  console.log("Otrzymano parametr:", param);

  try {
    const canGenerate = await checkDailyLimit(userId, "ingredient_info", 30);
    if (!canGenerate) {
      return res.status(403).json({ error: "Przekroczono limit informacji" });
    }
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Podaj krótką i przydatną informację o składniku: "${param}" w języku, w jakim jest napisany składnik.  
- Nie podawaj koloru składnika (chyba że jest kluczowy dla jego identyfikacji, np. "Black Pepper").  
- Nie podawaj kalorii, nawet jeśli są w nazwie składnika.  
- Na początku podaj nazwę składnika wraz z pasującą emotką, emotke pisz zawsze po składniku a następnie podaj jego krótki i wartościowy opis oddziel emoteke i opis za pomocą znaku -.  
- Opis powinien zawierać: główne właściwości, zastosowanie w kuchni i ewentualne korzyści zdrowotne.  
- Nie podawaj zbyt długich odpowiedzi – maksymalnie 2-3 zdania.  
- Unikaj powtarzania ogólnikowych informacji, skup się na unikalnych cechach składnika.  
- WAZNE PODAWAJ OPIS W JEZYKU W KTORYM JEST PODANY SKLADNIK.
`,
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

//=========================================================
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
