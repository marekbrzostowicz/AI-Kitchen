import { useState, useEffect, useRef } from "react";
import Flag from "react-world-flags";

import { FaSortAlphaDown, FaStar, FaTrash } from "react-icons/fa";
import { deleteRecipe } from "../../Api/recipe/deleteRecipe";
import Input from "../Components/Input";
import Navbar from "../Components/Navbar";

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatches(text, query) {
  if (!query) return text;
  const safeQuery = query
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegExp)
    .join("\\s*");
  const regex = new RegExp(`(${safeQuery})`, "gi");
  return text.replace(regex, (match) => {
    return match
      .split(/(\s+)/)
      .map((part) => {
        if (/^\s+$/.test(part)) {
          return part;
        }
        return `<span style="text-decoration: underline; color: red;">${part}</span>`;
      })
      .join("");
  });
}

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showRecipes, setShowRecipes] = useState(false);
  const [showStarredRecipes, setShowStarredRecipes] = useState(false);

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const [recipeToDelete, setRecipeToDelete] = useState(null);

  const [searchTitle, setSearchTitle] = useState("");
  const [searchIngredients, setSearchIngredients] = useState("");

  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("Brak userId w localStorage");
      }
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/recipes?userId=${userId}`
      );
      if (!response.ok) {
        throw new Error("Błąd pobierania przepisów");
      }
      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAllRecipes = () => {
    if (!showRecipes) {
      if (recipes.length === 0) {
        fetchRecipes();
      }
    }
    setShowRecipes(!showRecipes);
    setShowStarredRecipes(false);
  };

  const toggleStarredRecipes = () => {
    if (!showStarredRecipes) {
      if (recipes.length === 0) {
        fetchRecipes();
      }
    }
    setShowStarredRecipes(!showStarredRecipes);
    setShowRecipes(false);
  };

  const confirmDelete = (recipeId) => {
    setRecipeToDelete(recipeId);
  };
  const handleConfirmDelete = async (recipeId) => {
    if (recipeId) {
      try {
        await deleteRecipe(recipeId);
        setRecipes((prevRecipes) =>
          prevRecipes.filter((recipe) => recipe.id !== recipeId)
        );
        setRecipeToDelete(null);
      } catch (err) {
        console.error("Error:", err);
      }
    }
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY.current) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setShowRecipes(true);
    fetchRecipes();
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setSelectedRecipe(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: rating }, (_, i) => (
      <FaStar size={20} key={i} className="mr-1" />
    ));
  };

  let displayedRecipes = [];
  if (showStarredRecipes) {
    displayedRecipes = recipes
      .filter((recipe) => recipe.rating > 0)
      .sort((a, b) => b.rating - a.rating);
  } else if (showRecipes) {
    displayedRecipes = [...recipes].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }

  if (searchTitle.trim() !== "") {
    displayedRecipes = displayedRecipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(searchTitle.toLowerCase())
    );
  }

  if (searchIngredients.trim() !== "") {
    displayedRecipes = displayedRecipes.filter((recipe) =>
      recipe.ingredients.toLowerCase().includes(searchIngredients.toLowerCase())
    );
  }

  return (
    <>
      <Navbar
        theme="yellow"
        links={[
          { text: "GENERATE", to: "/welcome" },
          { text: "STARRED", icon: <FaStar />, onClick: toggleStarredRecipes },
          {
            text: "ALL RECIPES",
            icon: <FaSortAlphaDown />,
            onClick: toggleAllRecipes,
          },
        ]}
        containerPadding="pr-16 pl-16 py-2"
        gapBetweenLinks="gap-32"
        isVisible={isVisible}
      />
      <div
        className={`bg-gray-700 flex flex-col bg-opacity-40 fixed left-0 w-[300px] h-full z-50 p-6 transition-all duration-300 ${
          isVisible ? "top-[124px]" : "top-0"
        }`}
      >
        <h3 className=" text-2xl font-semibold mb-4 border-b-[2px] text-yellow-200 border-yellow-600">
          Search
        </h3>

        <p className="mt-8  text-yellow-100">Search By Title</p>
        <Input
          gradientVariant="orange"
          placeholder="Search by Title..."
          value={searchTitle}
          onChange={(e) => {
            setSearchTitle(e.target.value);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
        <p className="mt-8 text-yellow-100">Search by Ingredients</p>

        <Input
          gradientVariant="orange"
          placeholder="Search by Ingredients..."
          value={searchIngredients}
          onChange={(e) => {
            setSearchIngredients(e.target.value);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
      <div className="pl-[340px] pt-4 pr-4 pb-4">
        {loading && (
          <div className="text-white mt-[500px] mr-[500px]">
            Loading recipes...
          </div>
        )}
        {displayedRecipes.length === 0 && !loading && !error ? (
          <p className="text-white text-lg mt-[170px]">No recipe found.</p>
        ) : (
          <div className="mt-[170px] flex flex-wrap gap-8 justify-evenly">
            {displayedRecipes.map((recipe, index) => {
              const highlightedTitle = highlightMatches(
                recipe.title,
                searchTitle
              );

              return (
                <div
                  key={index}
                  className="relative flex flex-col bg-yellow-100 border-4 border-yellow-500 rounded-xl group transition-transform duration-300 hover:scale-[1.03] p-4"
                  style={{ width: "520px", marginBottom: "20px" }}
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <div className="mb-4">
                    <div className="font-black text-xl border-b-[3px] border-yellow-600 p-2 flex items-center justify-between">
                      <h2
                        className="leading-snug"
                        dangerouslySetInnerHTML={{ __html: highlightedTitle }}
                      ></h2>
                      {recipe.cuisineFlag && (
                        <div className="flex-shrink-0 w-[44px] h-[30px] ml-2">
                          <Flag
                            code={recipe.cuisineFlag}
                            className="rounded-xl w-full h-full"
                          />
                        </div>
                      )}
                    </div>
                    {recipe.rating > 0 && (
                      <div className="flex text-orange-500 p-2">
                        {renderStars(recipe.rating)}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mb-4">
                    <div>
                      <p className="font-black text-lg border-b-[3px] border-yellow-600 mb-2">
                        Ingredients:
                      </p>
                      {recipe.ingredients
                        .slice(1, -1)
                        .split(",")
                        .map((ingredient, idx) => {
                          const highlightedIng = highlightMatches(
                            ingredient.slice(3, -1),
                            searchIngredients
                          );
                          return (
                            <p
                              key={idx}
                              className="font-medium text-sm"
                              dangerouslySetInnerHTML={{
                                __html:
                                  `<span class="font-semibold mr-1">${
                                    idx + 1
                                  }.</span>` + highlightedIng,
                              }}
                            ></p>
                          );
                        })}
                    </div>
                    <div>
                      {recipe.totalCalories !== null &&
                        recipe.totalCalories > 0 && (
                          <p className="font-medium text-sm">
                            <span className="font-semibold text-base">
                              Total:
                            </span>{" "}
                            {recipe.totalCalories} kcal
                          </p>
                        )}
                      {recipe.imageUrl && (
                        <img
                          className="border-[3px] border-yellow-500 rounded-2xl mt-2"
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          style={{
                            width: "120px",
                            height: "120px",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <p className="font-black text-lg border-b-[3px] border-yellow-600 mb-2">
                    Instructions:
                  </p>
                  {recipe.instructions
                    .split(/\d+\.\s*/)
                    .filter(Boolean)
                    .map((instructionLine, idx) => (
                      <p key={idx} className="font-medium text-sm mb-2">
                        <span className="text-base font-bold">{idx + 1}. </span>
                        {instructionLine}
                      </p>
                    ))}

                  <FaTrash
                    size={20}
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(recipe.id);
                    }}
                    className="absolute right-2 bottom-2 text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:text-red-700"
                  />
                </div>
              );
            })}
          </div>
        )}
        <div>
          {" "}
          <p className=" absolute top-36 right-4 text-orange-400 text-[14px]">
            Total: {recipes.length}
          </p>
        </div>
      </div>
      {recipeToDelete && (
        <div
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
          onClick={() => setRecipeToDelete(null)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-bold">
              Are you sure you want to delete the recipe?
            </p>
            <div className="flex justify-around mt-4">
              <button
                onClick={() => handleConfirmDelete(recipeToDelete)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={() => setRecipeToDelete(null)}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedRecipe && (
        <div
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            className="bg-white w-[600px] max-h-[80vh] overflow-auto p-6 rounded-lg shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-xl font-bold text-gray-600 hover:text-gray-900"
              onClick={() => setSelectedRecipe(null)}
            >
              X
            </button>

            <h2
              className="font-black text-2xl mb-4 border-b-2 pb-2"
              dangerouslySetInnerHTML={{
                __html: highlightMatches(selectedRecipe.title, searchTitle),
              }}
            ></h2>
            {selectedRecipe.rating > 0 && (
              <div className="flex text-orange-500 p-2">
                {renderStars(selectedRecipe.rating)}
              </div>
            )}

            <div className="flex justify-between mb-4">
              <div>
                <p className="font-black text-xl mb-2">Ingredients:</p>
                {selectedRecipe.ingredients
                  .slice(1, -1)
                  .split(",")
                  .map((ingredient, idx) => {
                    const highlightedIng = highlightMatches(
                      ingredient.slice(3, -1),
                      searchIngredients
                    );
                    return (
                      <p
                        key={idx}
                        className="font-medium text-sm"
                        dangerouslySetInnerHTML={{
                          __html:
                            `<span class="font-semibold mr-1">${
                              idx + 1
                            }.</span>` + highlightedIng,
                        }}
                      ></p>
                    );
                  })}
              </div>
              <div>
                {selectedRecipe.totalCalories !== null &&
                  selectedRecipe.totalCalories > 0 && (
                    <p className="font-medium text-sm">
                      <span className="font-semibold text-base">Total:</span>{" "}
                      {selectedRecipe.totalCalories} kcal
                    </p>
                  )}
                {selectedRecipe.imageUrl && (
                  <img
                    className="border-[3px] border-yellow-500 rounded-2xl mt-2"
                    src={selectedRecipe.imageUrl}
                    alt={selectedRecipe.title}
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>
            </div>

            <p className="font-black text-xl mb-2">Instructions:</p>
            {selectedRecipe.instructions
              .split(/\d+\.\s*/)
              .filter(Boolean)
              .map((instructionLine, idx) => (
                <p key={idx} className="font-medium text-sm mb-2">
                  <span className="text-base font-bold">{idx + 1}. </span>
                  {instructionLine}
                </p>
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default RecipeList;
