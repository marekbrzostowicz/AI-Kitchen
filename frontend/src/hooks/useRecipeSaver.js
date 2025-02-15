import { useState } from "react";
import { saveRecipe, storeImage } from "../../Api/recipe/recipe.js";

export const useRecipeSaver = () => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveRecipe = async (recipeData, imageUrl) => {
    try {
      setIsSaving(true);
      const localPath = imageUrl ? await storeImage(imageUrl) : null;
      await saveRecipe({ ...recipeData, imageUrl: localPath || imageUrl });
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, handleSaveRecipe };
};