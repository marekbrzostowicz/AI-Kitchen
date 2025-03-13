import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import burger from "../assets/burger.jpg";
import Input from "./Components/Input.jsx";
import Generate from "./Components/StartButton.jsx";
import Recipe from "./Recipes/RecipeContainer.jsx";
import Language from "./Parameters/Language.jsx";
import Cuisine from "./Parameters/Cuisine.jsx";
import Calories from "./Parameters/Calories.jsx";
import TimerToast from "./Components/TimerToast.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const chunkArray = (array, chunkSize) => {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

const Welcome = () => {
  const [username, setUsername] = useState("");

  const [ingredients, setIngredients] = useState([""]);
  const [language, setLanguagage] = useState("gb");
  const [cuisine, setCuisine] = useState("ANY");
  const [calories, setCalories] = useState(false);

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [recipe, setRecipe] = useState("");

  const [setSavedIngredients] = useState([]);

  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const recipeRef = useRef(null);

  const handleScroll = () => {
    if (window.scrollY > lastScrollY) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    setLastScrollY(window.scrollY);
  };

  const handleChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);

    if (value.length >= 2 && ingredients.length < 20) {
      if (index === ingredients.length - 1) {
        setIngredients([...newIngredients, ""]);
      }
    }
  };

  function getTimeUntilReset() {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow - now;
  }

  const timeUntilReset = getTimeUntilReset();

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      console.log("Skladniki:", ingredients);
      setSavedIngredients(ingredients.filter((item) => item.trim() !== ""));

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/recipes/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ingredients,
            language,
            cuisine,
            calories,
            userId: localStorage.getItem("userId"),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server error");
      }

      setRecipe(data.recipe);
      setIngredients([""]);
      setIsLoading(false);

      setTimeout(() => {
        recipeRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Błąd podczas generowania przepisu:", error);

      if (error.message.includes("Daily recipe generation limit reached")) {
        setTimeout(() => {
          toast.info(() => (
            <TimerToast initialTime={timeUntilReset} type="recipe" />
          ));
        }, 500);
      } else {
        toast.error(error.message || "Wystąpił błąd.");
      }

      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, ingredients.length);
    for (let i = 0; i < ingredients.length; i++) {
      if (!inputRefs.current[i]) {
        inputRefs.current[i] = React.createRef();
      }
    }
  }, [ingredients]);

  const chunkedIngredients = chunkArray(ingredients, 5);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("userId");

    navigate("/");
  };

  return (
    <>
      <div className="h-screen flex">
        <nav
          className={`bg-gray-600 bg-opacity-70 fixed top-0 left-0 w-full font-mono text-xl z-10 text-green-200 font-bold pt-2 transition-transform duration-300 ${
            isVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="container mx-auto flex justify-between items-center pr-16 pl-16">
            <img
              src={logo}
              alt="Logo"
              style={{ width: "100px", height: "auto" }}
            />
            <div className="flex gap-48">
              <div
                className="relative group py-2 inline-block cursor-pointer 
                 hover:text-green-400 transition-colors duration-300"
                onClick={() => console.log("GENERATE clicked")}
              >
                GENERATE
                <span
                  className="absolute left-0 bottom-0 h-[2px] w-full bg-current
                   scale-x-0 origin-left
                   transition-transform duration-300
                   group-hover:scale-x-100"
                />
              </div>

              <div
                onClick={() => navigate("/recipes")}
                className="relative group py-2 inline-block cursor-pointer
                 hover:text-green-400 transition-colors duration-300"
              >
                YOUR RECIPES
                <span
                  className="absolute left-0 bottom-0 h-[2px] w-full bg-current
                   scale-x-0 origin-left
                   transition-transform duration-300
                   group-hover:scale-x-100"
                />
              </div>

              <div
                onClick={handleLogout}
                className="relative group py-2 inline-block cursor-pointer 
                 hover:text-green-400 transition-colors duration-300"
              >
                LOGOUT
                <span
                  className="absolute left-0 bottom-0 h-[2px] w-full bg-current
                   scale-x-0 origin-left
                   transition-transform duration-300
                   group-hover:scale-x-100"
                />
              </div>
            </div>
          </div>
        </nav>

        <div className="flex h-full w-full">
          <div className="flex-1 bg-gray-800 text-white flex flex-col items-center justify-center p-8 gap-4">
            <p className="text-xl text-green-200 text-[25px] font-semibold mt-4 animated-text ">
              Enter your available ingredients (max 20) and let AI generate the
              recipe.
            </p>

            <div className="flex gap-8 w-full max-w-3xl justify-center">
              {chunkedIngredients.map((col, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-2">
                  {col.map((ingredient, rowIndex) => {
                    const globalIndex = colIndex * 5 + rowIndex;
                    return (
                      <Input
                        key={globalIndex}
                        placeholder={`Ingredient ${globalIndex + 1}`}
                        value={ingredient}
                        onChange={(e) =>
                          handleChange(globalIndex, e.target.value)
                        }
                        maxLength={25}
                        ref={(el) => {
                          inputRefs.current[globalIndex] = el;
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            {ingredients.length >= 4 && <Generate onClick={handleGenerate} />}

            <div className="absolute bottom-4 left-4 flex flex-col sm:flex-row sm:gap-4 gap-2 items-center">
              <Language language={language} setLanguage={setLanguagage} />
              <Cuisine language={cuisine} setLanguage={setCuisine} />
              <Calories calories={calories} setCalories={setCalories} />
            </div>
          </div>

          <div className="relative flex-1">
            <img
              src={burger}
              alt="Burger"
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 80%" }}
            />
            <div className="absolute top-32 right-4 text-right z-10 max-w-xs">
              <p className="text-5xl text-green-300 font-bold break-words whitespace-normal">
                Welcome {username}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Recipe
        recipe={recipe}
        recipeRef={recipeRef}
        isLoading={isLoading}
        calories={calories}
      />
    </>
  );
};

export default Welcome;
