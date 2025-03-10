import { useEffect, useRef, useState } from "react";
import Flag from "react-world-flags";
import ImageLoading from "../Loading/imageLoading.jsx";
import { FaImage, FaSave, FaCheckCircle, FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingDot from "../Loading/LoadingDot.jsx";
import ServingsSelector from "../Components/ServingSelector.jsx";
import InfoIcon from "../Components/InfoIcon.jsx";
import { recipeApi } from "../../Api/recipe/recipeApi.js";
import TimerToast from "../Components/TimerToast.jsx";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const RecipeCard = ({
  title,
  ingredients,
  ingredientsPortions,
  instructions,
  cuisineFlag,
  onGenerateImage,
  totalCalories,
  setRecipeTitle,
  recipeTitle,
  onSave,
  modalOpen,
  setModalOpen,
  onSaveFav,
  modalOpenFav,
  setModalOpenFav,
  showInfoIcon,
}) => {
  const saveIconRef = useRef(null);
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const favButtonRef = useRef(null);
  const favModalRef = useRef(null);

  const [showSaveButton, setShowSaveButton] = useState(true);
  const [showImage, setShowImage] = useState(true);
  const [showRateButton, setShowRateButton] = useState(true);
  const [showGenrateImageButton, setShowGenerateImageButton] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [description, setDescription] = useState("");
  const [descriptionLoading, setDescriptionLoading] = useState(false);
  const [servings, setServings] = useState(1);
  const [scaledPortions, setScaledPortions] = useState([]);
  const [isSave, setIsSave] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const processIngredient = (ingredient) => {
    const cleaned = ingredient.replace(/^\d+\.\s*/, "");
    const parts = cleaned.split(" ");
    if (parts.length < 2) return { name: cleaned, portion: "" };

    const portion = parts.slice(-2).join(" ");
    const name = parts.slice(0, -2).join(" ");
    return { name, portion };
  };

  function getTimeUntilReset() {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow - now;
  }

  const timeUntilReset = getTimeUntilReset();

  const handleGnerateIngredients = async ({ param }) => {
    try {
      setDescriptionLoading(true);
      setShowDescription(false);
      const data = await recipeApi.generateIngredientDescription(param);
      const [name, details] = data.description.split(" - ");
      setDescription({ name: name.trim(), details: details.trim() });
      setShowDescription(true);
    } catch (err) {
      if (err.message.includes("Przekroczono limit informacji")) {
        toast.info(
          <TimerToast initialTime={timeUntilReset} type="ingredient" />
        );
      } else {
        toast.error(err.message);
        console.error("Error:", err);
      }
    } finally {
      setDescriptionLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    try {
      setIsImageLoading(true);
      setImageUrl(null);
      const generatedImageUrl = await onGenerateImage();
      console.log("Generated image URL in RecipeCard:", generatedImageUrl);
      setImageUrl(generatedImageUrl);
    } catch (error) {
      if (error.message === "Limit przekroczony") {
        toast.info(<TimerToast initialTime={timeUntilReset} type="image" />, {
          toastId: "image-limit",
        });
      } else {
        toast.error("Failed to generate image");
        console.error("Error generating image:", error);
      }
    } finally {
      setIsImageLoading(false);
    }
  };

  const storeImageLocally = async () => {
    try {
      if (!imageUrl) return null;

      if (imageUrl.includes("sirv.com")) {
        return imageUrl;
      }

      const response = await fetch(`${API_URL}/upload-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload image to Sirv");
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Error storing image:", error);
      return null;
    }
  };

  const handleSaveToDatabase = async (imgUrl) => {
    try {
      const recipeData = {
        title: recipeTitle || title,
        ingredients,
        instructions,
        cuisineFlag,
        totalCalories,
        imageUrl: imgUrl,
        rating: selectedStars,
        userId: localStorage.getItem("userId"),
      };

      await recipeApi.saveRecipe(recipeData);
      toast.success("Recipe Saved");
      toast.error("Save failed");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveClick = async (e) => {
    e.stopPropagation();
    setIsSave(true);
    setModalOpen(true);

    setShowSaveButton(false);
    setShowRateButton(false);
    setShowGenerateImageButton(false);

    try {
      const sirvUrl = await storeImageLocally();
      await handleSaveToDatabase(sirvUrl || null);
    } catch (error) {
      console.error("Error saving recipe:", error);
    } finally {
      setIsSave(false);
      setModalOpen(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !saveIconRef.current?.contains(event.target)
      ) {
        setModalOpen(false);
      }
    }

    if (modalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalOpen]);

  useEffect(() => {
    function handleClickOutsideFav(event) {
      if (
        favModalRef.current &&
        !favModalRef.current.contains(event.target) &&
        !favButtonRef.current?.contains(event.target)
      ) {
        setModalOpenFav(false);
      }
    }

    if (modalOpenFav) {
      document.addEventListener("mousedown", handleClickOutsideFav);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideFav);
    };
  }, [modalOpenFav]);

  const [hoveredStars, setHoveredStars] = useState(0);
  const [selectedStars, setSelectedStars] = useState(0);

  const handleStarHover = (index) => {
    setHoveredStars(index);
  };

  const handleStarLeave = () => {
    setHoveredStars(0);
  };

  const handleStarClick = (index) => {
    if (selectedStars === index) {
      setSelectedStars(0);
    } else {
      setSelectedStars(index);
    }
  };

  const scalePortions = (ingredientsPortions, servings) => {
    if (!ingredientsPortions || !Array.isArray(ingredientsPortions)) return [];

    return ingredientsPortions.map((item) => {
      if (typeof item !== "object" || !item.portion) return item;

      const portion = item.portion;
      if (typeof portion !== "string" || portion.trim() === "") return item;

      const words = portion.split(" ");
      if (words.length < 2) return item;

      const amount = parseFloat(words[0]);
      if (isNaN(amount)) return item;

      const unit = words.slice(1).join(" ");
      const newAmount = (amount * servings).toFixed(0);

      return {
        ...item,
        portion: `${newAmount} ${unit}`,
      };
    });
  };

  useEffect(() => {
    if (ingredientsPortions && ingredientsPortions.length > 0) {
      setScaledPortions(scalePortions(ingredientsPortions, servings));
    }
  }, [servings, ingredientsPortions]);

  return (
    <>
      <div className="flex flex-col lg:flex-row justify-evenly gap-8">
        <div className="flex flex-col w-full max-w-[450px] justify-center gap-2 border-[3px] rounded-xl border-yellow-500 p-4 bg-gray-800 relative">
          <div className="absolute top-4 left-4">
            <ServingsSelector servings={servings} setServings={setServings} />
          </div>
          {showInfoIcon && (
            <div className="absolute top-4 right-4">
              <InfoIcon />
            </div>
          )}

          <p className="font-bold text-3xl text-yellow-200 items-center text-center mt-16">
            Ingredients:
          </p>

          {ingredients.map((line, index) => {
            const { name } = processIngredient(line);
            return (
              <div
                key={index}
                className="text-xl text-center hover:text-yellow-300 hover:cursor-pointer transition-transform duration-300 hover:translate-x-2 flex items-center justify-center gap-2 p-1"
                onClick={() => {
                  console.log(`Kliknięto składnik ${name}`),
                    handleGnerateIngredients({ param: name });
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="font-bold text-yellow-300 text-2xl">
                    {index + 1}.
                  </div>
                  <div>{name}</div>
                  <div>
                    {scaledPortions[index] && (
                      <div className="flex gap-2 text-yellow-100">
                        <div className="w-[2px] h-8 bg-yellow-300"></div>
                        {scaledPortions[index].portion}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {descriptionLoading ? (
            <div className="flex justify-center items-center mt-4">
              <LoadingDot />
            </div>
          ) : (
            showDescription &&
            description && (
              <div className="p-4 bg-white text-black rounded-lg border-[3px] border-gray-400 mt-4">
                <p className="text-2xl font-bold border-b-[3px] border-gray-400">
                  {description.name}
                </p>
                <p className="text-medium mt-2 text-gray-800">
                  {description.details}
                </p>
                <button
                  onClick={() => setShowDescription(false)}
                  className="mt-4 bg-yellow-400 px-4 py-2 rounded-lg font-medium hover:bg-yellow-300"
                >
                  Close
                </button>
              </div>
            )
          )}

          {totalCalories && (
            <>
              <hr />
              <div className="text-right font-medium text-[19px]">
                <span className="font-black">Total:</span> {totalCalories} kcal
              </div>
            </>
          )}
        </div>

        <div className="relative p-6 pb-14 bg-yellow-100 text-black max-w-3xl flex flex-col items-start text-left border-[3px] rounded-xl border-yellow-500">
          <div className="flex justify-between items-start w-full">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-2xl border-b-2 border-yellow-600 p-[5px] break-words mb-16 flex items-center gap-2">
                {title}
                {cuisineFlag && (
                  <Flag
                    code={cuisineFlag}
                    className="w-8 h-auto rounded-lg ml-2"
                  />
                )}
              </p>
            </div>
            <div className="flex-shrink-0 ml-4">
              {isImageLoading ? (
                <ImageLoading />
              ) : showImage ? (
                imageUrl ? (
                  <div className="relative w-[200px] h-[200px] border-4 border-yellow-500 rounded-2xl object-cover group">
                    <img
                      src={imageUrl}
                      alt="Generated Recipe"
                      className="w-full h-full rounded-xl hover:cursor-pointer transition-opacity duration-300"
                    />
                  </div>
                ) : (
                  showGenrateImageButton && (
                    <button
                      onClick={handleGenerateImage}
                      className="px-4 py-2 bg-yellow-400 text-black rounded-xl hover:bg-yellow-300 font-medium flex gap-[8px]"
                    >
                      Image
                      <FaImage size={25} color="#a36418" />
                    </button>
                  )
                )
              ) : null}
            </div>
          </div>

          {instructions &&
            instructions.split("\n").map((step, index) => {
              if (index >= 9) return null;
              return (
                <p key={index} className="mb-2 font-medium text-[17px]">
                  <span className="font-black text-xl">{index + 1}.</span>{" "}
                  {step.replace(/^\d*\.\s*/, "")}
                  <hr className="border-t border-gray-900 my-2 border-[1px]" />
                </p>
              );
            })}

          {showSaveButton && (
            <div
              className="absolute bottom-4 right-4 flex gap-2 items-center"
              ref={modalRef}
            >
              <button
                onClick={onSave}
                className="bg-yellow-400 font-medium p-2 rounded-xl text-xm flex items-center gap-[5px] hover:bg-yellow-300"
              >
                Save <FaSave size={20} color="#a36418" />
              </button>

              {modalOpen && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={recipeTitle}
                    onChange={(e) => setRecipeTitle(e.target.value)}
                    onBlur={() => setTimeout(() => setModalOpen(false), 100)}
                    ref={inputRef}
                    autoFocus
                    className="w-[300px] bg-transparent border-b-[3px] border-yellow-600 focus:outline-none text-xm font-medium"
                  />
                  <FaCheckCircle
                    ref={saveIconRef}
                    size={30}
                    className="text-yellow-500 transition duration-200 hover:text-yellow-800 hover:cursor-pointer"
                    onClick={handleSaveClick}
                  />
                </div>
              )}
            </div>
          )}

          <div className="absolute bottom-4 left-4 flex gap-2 items-center">
            {showRateButton && (
              <button
                ref={favButtonRef}
                onClick={() => setModalOpenFav(true)}
                className="bg-yellow-400 font-medium p-2 rounded-xl text-xm flex items-center gap-[5px] hover:bg-yellow-300"
              >
                Rate
                <FaStar color={"#f53364"} size={20} />
              </button>
            )}

            {modalOpenFav && (
              <div ref={favModalRef} className="flex gap-2">
                {[1, 2, 3, 4, 5].map((index) => (
                  <FaStar
                    key={index}
                    size={30}
                    className={`cursor-pointer transition-colors ${
                      index <= (hoveredStars || selectedStars)
                        ? "text-red-400"
                        : "text-gray-300"
                    }`}
                    onMouseEnter={() => handleStarHover(index)}
                    onMouseLeave={handleStarLeave}
                    onClick={() => handleStarClick(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RecipeCard;
