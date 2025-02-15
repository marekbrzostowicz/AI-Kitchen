import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import cookingAnimation from "../../assets/Animation.json";
import RecipeCard from "./RecipeCard.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";
import { generateRecipeImage } from "../../Api/recipe/imageApi.js";
import { parseRecipe } from "../../hooks/useRecipeParser.js";
import { useRecipeData } from "../../hooks/useRecipeData.js";
import TimerToast from "../Components/TimerToast.jsx";

const Recipe = ({ recipe, recipeRef, isLoading }) => {
  // Stany dla obrazków
  const [imageUrl1, setImageUrl1] = useState(null);
  const [isImageLoading1, setIsImageLoading1] = useState(false);
  const [imageUrl2, setImageUrl2] = useState(null);
  const [isImageLoading2, setIsImageLoading2] = useState(false);

  // Stan na parsowany przepis
  const [parsedRecipe, setParsedRecipe] = useState(null);

  // Stany modali oraz tytułów do zapisu
  const [ModalOpen1, setModalOpen1] = useState(false);
  const [ModalOpen2, setModalOpen2] = useState(false);
  const [ModalOpenFav1, setModalOpenFav1] = useState(false);
  const [ModalOpenFav2, setModalOpenFav2] = useState(false);
  const [recipeTitle1, setRecipeTitle1] = useState("");
  const [recipeTitle2, setRecipeTitle2] = useState("");

  // Resetowanie stanów przy zmianie przepisu
  useEffect(() => {
    setImageUrl1(null);
    setIsImageLoading1(false);
    setImageUrl2(null);
    setIsImageLoading2(false);
    setModalOpen1(false);
    setModalOpen2(false);
    setModalOpenFav1(false);
    setModalOpenFav2(false);
    setRecipeTitle1("");
    setRecipeTitle2("");
  }, [recipe]);

  useEffect(() => {
    if (isLoading && recipeRef.current) {
      recipeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isLoading, recipeRef]);

  useEffect(() => {
    if (!recipe) {
      setParsedRecipe(null);
      return;
    }
    const parsed = parseRecipe(recipe);
    setParsedRecipe(parsed);
  }, [recipe]);

  // Użycie hooka useRecipeData do przetwarzania sparsowanych danych
  const {
    arrayOfIngredients1,
    arrayOfPortions1,
    totalCaloriesSum1,
    arrayOfIngredients2,
    arrayOfPortions2,
    totalCaloriesSum2,
  } = useRecipeData(parsedRecipe);

  if (isLoading) {
    return (
      <div
        ref={recipeRef}
        className="bg-gray-700 p-8 text-white flex justify-center items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="w-64 h-64">
          <Lottie animationData={cookingAnimation} loop={true} />
        </div>
      </div>
    );
  }

  if (!recipe || !parsedRecipe) return null;

  if (recipe.trim() === "no_recipe") {
    return (
      <div
        ref={recipeRef}
        className="bg-gray-700 p-8 text-white flex items-center justify-center"
      >
        <div className="p-4 bg-yellow-100 text-black rounded-xl border-4 border-yellow-500 font-semibold max-w-3xl">
          <p>Sorry, you can&apos;t cook anything with these ingredients.</p>
        </div>
      </div>
    );
  }

  if (recipe.trim().startsWith("no_recipe")) {
    const nonFoodItemsMatch = recipe.match(/non-food items:\s*(.+)/i);
    const nonFoodItems = nonFoodItemsMatch
      ? nonFoodItemsMatch[1].split(", ")
      : [];
    return (
      <div
        ref={recipeRef}
        className="bg-gray-700 p-8 text-white flex items-center justify-center"
      >
        <div className="p-4 bg-yellow-100 text-black rounded-xl border-4 border-yellow-500 font-semibold max-w-3xl">
          <p>Sorry, you can&apos;t cook anything with these ingredients.</p>
          {nonFoodItems.length > 0 && (
            <div className="mt-4">
              <p className="font-bold text-red-600">Non-food items detected:</p>
              <ul className="list-disc list-inside">
                {nonFoodItems.map((item, index) => (
                  <li key={index} className="text-red-500">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  function getTimeUntilReset() {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow - now; // w milisekundach
  }

  const timeUntilReset = getTimeUntilReset();

  // Destrukturyzacja sparsowanych danych (pozostałe dane, np. tytuły, treść, kody)
  const { title1, title2, content1, content2, cuisine1Code, cuisine2Code } =
    parsedRecipe;

  // Lokalna funkcja generująca obraz
  const handleGenerateImage = async (whichRecipe) => {
    try {
      const recipeTitle = whichRecipe === 1 ? title1 : title2;
      const userId = localStorage.getItem("userId");

      // Ustaw stan ładowania PRZED rozpoczęciem generowania
      if (whichRecipe === 1) {
        setIsImageLoading1(true);
        setImageUrl1(null); // Resetuj poprzedni obraz
      } else {
        setIsImageLoading2(true);
        setImageUrl2(null);
      }

      const imageUrl = await generateRecipeImage(recipeTitle, userId);

      if (whichRecipe === 1) {
        setImageUrl1(imageUrl);
      } else {
        setImageUrl2(imageUrl);
      }
    } catch (error) {
      console.error("Błąd:", error);
      if (error.message === "Limit przekroczony") {
        toast.info(<TimerToast initialTime={timeUntilReset} type="image" />);
      } else {
        alert("Error during image generation.");
      }
    } finally {
      // Zawsze wyłącz ładowanie, niezależnie od wyniku
      if (whichRecipe === 1) {
        setIsImageLoading1(false);
      } else {
        setIsImageLoading2(false);
      }
    }
  };

  return (
    <div
      ref={recipeRef}
      className="bg-gray-700 p-12 gap-16 text-white flex flex-col pt-24"
    >
      <RecipeCard
        title={title1}
        ingredients={arrayOfIngredients1}
        ingredientsPortions={arrayOfPortions1}
        instructions={content1}
        cuisineFlag={cuisine1Code}
        imageUrl={imageUrl1}
        isImageLoading={isImageLoading1}
        onGenerateImage={() => handleGenerateImage(1)}
        totalCalories={totalCaloriesSum1 > 0 ? totalCaloriesSum1 : null}
        onSave={() => {
          setModalOpen1(true);
          setRecipeTitle1(title1);
        }}
        setModalOpen={setModalOpen1}
        modalOpen={ModalOpen1}
        onSaveFav={() => {
          setModalOpenFav1(true);
          console.log("Setting modalOpenFav1 to true");
        }}
        modalOpenFav={ModalOpenFav1}
        setModalOpenFav={setModalOpenFav1}
        recipeTitle={recipeTitle1}
        setRecipeTitle={setRecipeTitle1}
        showInfoIcon={true}
      />

      <hr className="ml-72 mr-72 mt-2 h-[2px] border-0 bg-gradient-to-r from-yellow-200 to-yellow-400" />

      <RecipeCard
        title={title2}
        ingredients={arrayOfIngredients2}
        ingredientsPortions={arrayOfPortions2}
        instructions={content2}
        cuisineFlag={cuisine2Code}
        imageUrl={imageUrl2}
        isImageLoading={isImageLoading2}
        onGenerateImage={() => handleGenerateImage(2)}
        totalCalories={totalCaloriesSum2 > 0 ? totalCaloriesSum2 : null}
        onSave={() => {
          setModalOpen2(true);
          setRecipeTitle2(title2);
        }}
        modalOpen={ModalOpen2}
        setModalOpen={setModalOpen2}
        onSaveFav={() => {
          setModalOpenFav2(true);
          console.log("Setting modalOpenFav2 to true");
        }}
        modalOpenFav={ModalOpenFav2}
        setModalOpenFav={setModalOpenFav2}
        recipeTitle={recipeTitle2}
        setRecipeTitle={setRecipeTitle2}
        showInfoIcon={false}
      />

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

Recipe.propTypes = {
  recipe: PropTypes.string.isRequired,
  recipeRef: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  calories: PropTypes.bool.isRequired,
};

export default Recipe;
