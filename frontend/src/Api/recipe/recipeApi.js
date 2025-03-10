export const recipeApi = {
  generateIngredientDescription: async (param) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/ingredient?param=${encodeURIComponent(param)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: localStorage.getItem("userId") }),
        }
      );
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Przekroczono limit informacji");
        } else {
          throw new Error(`Save Error: ${response.message}`);
        }
      }

      return await response.json();
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  },

  saveRecipe: async (recipeData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/save-recipe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recipeData),
        }
      );
      if (!response.ok) throw new Error("Recipe save failed");
      return await response.json();
    } catch (error) {
      throw new Error(`Save Error: ${error.message}`);
    }
  },

  storeImage: async (imageUrl) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/store-image`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Image storage failed");
      }
      return data.localPath;
    } catch (error) {
      throw new Error(`Image Error: ${error.message}`);
    }
  },
};
