import { useEffect, useState } from "react";

export function useRecipeData(parsedRecipe) {
  const [data, setData] = useState({
    arrayOfIngredients1: [],
    arrayOfPortions1: [],
    totalCaloriesSum1: 0,
    arrayOfIngredients2: [],
    arrayOfPortions2: [],
    totalCaloriesSum2: 0,
  });

  useEffect(() => {
    if (!parsedRecipe) {
      setData({
        arrayOfIngredients1: [],
        arrayOfPortions1: [],
        totalCaloriesSum1: 0,
        arrayOfIngredients2: [],
        arrayOfPortions2: [],
        totalCaloriesSum2: 0,
      });
      return;
    }

    const { Ingredients1, Ingredients2 } = parsedRecipe;

    const arrayOfIngredients1 = Ingredients1
      ? Ingredients1.split("\n").filter((line) => line.trim() !== "")
      : [];
    const arrayOfIngredients2 = Ingredients2
      ? Ingredients2.split("\n").filter((line) => line.trim() !== "")
      : [];

    const arrayOfPortions1 = arrayOfIngredients1.map((line) => {
      const words = line.split(" ");
      const portion = words.slice(-2).join(" ");
      const ingredient = words.slice(0, -2).join(" ");
      return { ingredient, portion };
    });

    const arrayOfPortions2 = arrayOfIngredients2.map((line) => {
      const words = line.split(" ");
      const portion = words.slice(-2).join(" ");
      const ingredient = words.slice(0, -2).join(" ");
      return { ingredient, portion };
    });

    const sumCalories = (arr) =>
      arr.reduce((sum, item) => {
        const cleaned = item.replace(/^\d+\.\s*/, "");
        const match = cleaned.match(/\((\d+)\s*kcal\)/i);
        return match ? sum + parseInt(match[1], 10) : sum;
      }, 0);

    const totalCaloriesSum1 = sumCalories(arrayOfIngredients1);
    const totalCaloriesSum2 = sumCalories(arrayOfIngredients2);

    setData({
      arrayOfIngredients1,
      arrayOfPortions1,
      totalCaloriesSum1,
      arrayOfIngredients2,
      arrayOfPortions2,
      totalCaloriesSum2,
    });
  }, [parsedRecipe]);

  return data;
}
