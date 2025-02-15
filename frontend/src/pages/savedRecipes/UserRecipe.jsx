import { useState, useEffect, useRef } from "react";
import Flag from "react-world-flags";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import { FaSortAlphaDown, FaStar, FaTrash } from "react-icons/fa";
import { deleteRecipe } from "../../Api/recipe/deleteRecipe";
import Input from "../Components/Input";

// Funkcja do ucieczki znaków w RegEx (dla highlight):
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Funkcja do wyróżniania pasującego fragmentu w tekście (podkreślenie, kolor czerwony)
function highlightMatches(text, query) {
  if (!query) return text;
  // Dzielimy zapytanie na słowa (ignorujemy puste fragmenty) i łączymy je wzorem, który pozwala na dowolne spacje pomiędzy
  const safeQuery = query
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegExp)
    .join("\\s*");
  const regex = new RegExp(`(${safeQuery})`, "gi");
  return text.replace(regex, (match) => {
    // Podziel match na części – zachowując spacje – i podświetl tylko te, które nie są spacjami
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

  // Kontrola, czy pokazywać listę przepisów i listę "starred"
  const [showRecipes, setShowRecipes] = useState(false);
  const [showStarredRecipes, setShowStarredRecipes] = useState(false);

  // Mechanizm chowający/pokazujący navbar na scroll:
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Usuwanie przepisu:
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  // Pola wyszukiwania
  const [searchTitle, setSearchTitle] = useState("");
  const [searchIngredients, setSearchIngredients] = useState("");

  // Przepis wybrany do powiększonego widoku (modal)
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // 1. Pobieranie przepisów
  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("Brak userId w localStorage");
      }
      const response = await fetch(
        `http://localhost:8000/api/recipes?userId=${userId}`
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

  // 2. Funkcje do przełączania list
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

  // 3. Funkcje do usuwania przepisu
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

  // 4. Mechanizm chowający navbar
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY.current) {
      // Scroll w dół -> chowamy navbar
      setIsVisible(false);
    } else {
      // Scroll w górę -> pokazujemy navbar
      setIsVisible(true);
    }
    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 5. Ładujemy przepisy przy starcie
  useEffect(() => {
    setShowRecipes(true);
    fetchRecipes();
  }, []);

  // 6. Zamykanie powiększonego widoku klawiszem Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setSelectedRecipe(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // 7. Renderowanie gwiazdek ratingu
  const renderStars = (rating) => {
    return Array.from({ length: rating }, (_, i) => (
      <FaStar size={20} key={i} className="mr-1" />
    ));
  };

  // 8. Filtrowanie przepisów
  let displayedRecipes = [];
  if (showStarredRecipes) {
    // Tylko te z rating > 0
    displayedRecipes = recipes
      .filter((recipe) => recipe.rating > 0)
      .sort((a, b) => b.rating - a.rating);
  } else if (showRecipes) {
    // Wszystkie w kolejności alfabetycznej
    displayedRecipes = [...recipes].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }

  // Filtrowanie po tytule
  if (searchTitle.trim() !== "") {
    displayedRecipes = displayedRecipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(searchTitle.toLowerCase())
    );
  }

  // Filtrowanie po składnikach
  if (searchIngredients.trim() !== "") {
    displayedRecipes = displayedRecipes.filter((recipe) =>
      recipe.ingredients.toLowerCase().includes(searchIngredients.toLowerCase())
    );
  }

  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`bg-gray-700 bg-opacity-70 fixed top-0 left-0 w-full font-mono text-xl z-10 text-yellow-200 font-bold pt-2 transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto flex justify-between items-center pr-16 pl-16 py-2">
          {/* Logo */}
          <Link to="/welcome">
            <img
              src={logo}
              alt="Logo"
              style={{ width: "100px", height: "auto", cursor: "pointer" }}
            />
          </Link>

          {/* Linki */}
          <div className="flex gap-32">
            {/* GENERATE */}
            <Link
              to="/welcome"
              className="relative group py-2 inline-block cursor-pointer 
                 hover:text-yellow-500 transition-colors duration-300"
            >
              GENERATE
              <span
                className="absolute left-0 bottom-0 h-[2px] w-full bg-current
                   scale-x-0 origin-left transition-transform duration-300 
                   group-hover:scale-x-100"
              />
            </Link>

            {/* STARRED */}
            <button
              className="relative group py-2 flex items-center gap-2 cursor-pointer 
                 hover:text-yellow-500 transition-colors duration-300"
              onClick={toggleStarredRecipes}
            >
              STARRED <FaStar />
              <span
                className="absolute left-0 bottom-0 h-[2px] w-full bg-current
                   scale-x-0 origin-left transition-transform duration-300 
                   group-hover:scale-x-100"
              />
            </button>

            {/* ALL RECIPES */}
            <button
              className="relative group py-2 flex items-center gap-2 cursor-pointer 
                 hover:text-yellow-500 transition-colors duration-300"
              onClick={toggleAllRecipes}
            >
              ALL RECIPES <FaSortAlphaDown />
              <span
                className="absolute left-0 bottom-0 h-[2px] w-full bg-current
                   scale-x-0 origin-left transition-transform duration-300 
                   group-hover:scale-x-100"
              />
            </button>
          </div>
        </div>
      </nav>

      {/* SIDEBAR - stały, dynamicznie przesuwany w pionie w zależności od isVisible */}
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

      {/* GŁÓWNA ZAWARTOŚĆ – flex wrap i offset left ~340px */}
      <div className="pl-[340px] pt-4 pr-4 pb-4">
        {loading && <div className="text-white">Loading recipes...</div>}
        {displayedRecipes.length === 0 && !loading && !error ? (
          <p className="text-white text-lg mt-[170px]">No recipe found.</p>
        ) : (
          <div
            className="mt-[170px] flex flex-wrap gap-8 justify-evenly"
            // UWAGA: top offset = 170px, by recipes były poniżej nav i sidebar
          >
            {displayedRecipes.map((recipe, index) => {
              // Wyróżnianie tytułu
              const highlightedTitle = highlightMatches(
                recipe.title,
                searchTitle
              );

              // Wyróżnianie składników w modalu i tutaj jest odrębnie – tu wystarczy normalne wyświetlanie,
              // bo highlight zrobimy w dangerouslySetInnerHTML:
              return (
                <div
                  key={index}
                  className="relative flex flex-col bg-yellow-100 border-4 border-yellow-500 rounded-xl group transition-transform duration-300 hover:scale-[1.03] p-4"
                  style={{ width: "520px", marginBottom: "20px" }}
                  onClick={() => setSelectedRecipe(recipe)} // Otwieramy modal
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
                    {/* Gwiazdki ratingu */}
                    {recipe.rating > 0 && (
                      <div className="flex text-orange-500 p-2">
                        {renderStars(recipe.rating)}
                      </div>
                    )}
                  </div>

                  {/* Sekcja Ingredients */}
                  <div className="flex justify-between mb-4">
                    <div>
                      <p className="font-black text-lg border-b-[3px] border-yellow-600 mb-2">
                        Ingredients:
                      </p>
                      {recipe.ingredients
                        .slice(1, -1)
                        .split(",")
                        .map((ingredient, idx) => {
                          // wyróżnienie składnika
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
                    {/* Kcal + obrazek */}
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

                  {/* Instructions */}
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

                  {/* Ikona usuwania (FaTrash) */}
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
          <p className=" absolute top-36 right-4 text-orange-400 text-[14px]">Total: {recipes.length}</p>
        </div>
      </div>

      {/* Modal potwierdzenia usuwania */}
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

      {/* Modal z większym widokiem przepisu (selectedRecipe) */}
      {selectedRecipe && (
        <div
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            className="bg-white w-[600px] max-h-[80vh] overflow-auto p-6 rounded-lg shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Przycisk zamykający */}
            <button
              className="absolute top-2 right-2 text-xl font-bold text-gray-600 hover:text-gray-900"
              onClick={() => setSelectedRecipe(null)}
            >
              X
            </button>

            {/* Szczegóły wybranego przepisu */}
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

            {/* Ingredients i obrazek */}
            {/* Ingredients i obrazek w modal */}
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
                {/* Renderowanie informacji o kaloriach tylko gdy wartość jest dostępna i większa od 0 */}
                {selectedRecipe.totalCalories !== null &&
                  selectedRecipe.totalCalories > 0 && (
                    <p className="font-medium text-sm">
                      <span className="font-semibold text-base">Total:</span>{" "}
                      {selectedRecipe.totalCalories} kcal
                    </p>
                  )}
                {/* Obrazek, renderowany niezależnie od kaloryczności */}
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

            {/* Instructions */}
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
