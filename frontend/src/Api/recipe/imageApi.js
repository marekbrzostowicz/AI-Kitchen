const API_URL = "http://localhost:8000/api";

export async function generateRecipeImage(recipeTitle, userId) {
  try {
    const prompt = `Generate an image of: ${recipeTitle}`;
    const response = await fetch(`${API_URL}/generate-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, userId }),
    });
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Limit przekroczony");
      }
      if (response.status === 502) {
        throw new Error("Server error");
      }
      throw new Error("Błąd podczas generowania obrazu");
    }
    const data = await response.json();
    return `http://localhost:8000/${data.localImagePath}`;
  } catch (error) {
    console.error("Błąd:", error);
    throw error;
  }
}
