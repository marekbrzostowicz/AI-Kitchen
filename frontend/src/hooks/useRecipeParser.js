    const cuisineToCountryCode = {
    mexican: "mx",
    italian: "it",
    french: "fr",
    japanese: "jp",
    chinese: "cn",
    indian: "in",
    thai: "th",
    german: "de",
    spanish: "es",
    polish: "pl",
    };

    export function parseRecipe(recipeText = "") {
    const lines = recipeText.split("\n").map((line) => line.trim());

    let title1 = "Untitled";
    let title2 = "Untitled";
    let cuisine1Code = "";
    let cuisine2Code = "";
    let ingredients1Array = [];
    let ingredients2Array = [];
    let instructions1Array = [];
    let instructions2Array = [];
    let currentSection = null;

    for (let line of lines) {
        if (!line) continue;

        if (line.startsWith("Title1:")) {
        title1 = line.replace("Title1:", "").trim();
        currentSection = null;
        } else if (line.startsWith("Title2:")) {
        title2 = line.replace("Title2:", "").trim();
        currentSection = null;
        } else if (line.startsWith("Ingredients1:")) {
        currentSection = "ingredients1";
        } else if (line.startsWith("Ingredients2:")) {
        currentSection = "ingredients2";
        } else if (line.startsWith("Instructions1:")) {
        currentSection = "instructions1";
        const instructionPart = line.replace("Instructions1:", "").trim();
        if (instructionPart) instructions1Array.push(instructionPart);
        } else if (line.startsWith("Instructions2:")) {
        currentSection = "instructions2";
        const instructionPart = line.replace("Instructions2:", "").trim();
        if (instructionPart) instructions2Array.push(instructionPart);
        } else if (line.startsWith("Cuisine1:")) {
        const cuisine = line.replace("Cuisine1:", "").trim().toLowerCase();
        cuisine1Code = cuisineToCountryCode[cuisine] || cuisine;
        } else if (line.startsWith("Cuisine2:")) {
        const cuisine = line.replace("Cuisine2:", "").trim().toLowerCase();
        cuisine2Code = cuisineToCountryCode[cuisine] || cuisine;
        } else {
        if (currentSection === "ingredients1") {
            ingredients1Array.push(line);
        } else if (currentSection === "ingredients2") {
            ingredients2Array.push(line);
        } else if (currentSection === "instructions1") {
            instructions1Array.push(line);
        } else if (currentSection === "instructions2") {
            instructions2Array.push(line);
        }
        }
    }

    return {
        title1,
        title2,
        Ingredients1: ingredients1Array.join("\n"),
        Ingredients2: ingredients2Array.join("\n"),
        content1: instructions1Array.join("\n"),
        content2: instructions2Array.join("\n"),
        cuisine1Code,
        cuisine2Code,
    };
    }
