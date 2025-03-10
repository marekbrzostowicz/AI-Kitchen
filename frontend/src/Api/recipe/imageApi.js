const API_URL = `${import.meta.env.VITE_API_URL}/api`;

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
    return data.imageUrl; 
  } catch (error) {
    console.error("Błąd:", error);
    throw error;
  }
}