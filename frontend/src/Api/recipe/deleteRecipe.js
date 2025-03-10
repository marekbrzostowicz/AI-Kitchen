const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export async function deleteRecipe(recipeId) {
  console.log("Usuwanie przepisu o ID:", recipeId);
  try {
    const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error during deleting recipe");
    }

    return await response.json();
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

