import { useState, useEffect } from "react";
import DemoInputs from "./DemoInput";
import DemoRecipe from "./DemoRecipe";
import DemoIngredients from "./DemoIngredients";

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slideTitles = [
    "Enter Ingredients with Parameters",
    "Explore Recipes, Save, Rate & Generate Images",
    "Ingredient List & Detailed Info on Click",
  ];


  const slides = [
    <div
      key="inputs"
      className="w-full h-full flex flex-col items-center justify-center p-4 md:p-6 scale-95"
    >
      <DemoInputs />
    </div>,
    <div
      key="recipe"
      className="w-full h-full flex flex-col items-center justify-center p-4 md:p-6 scale-95"
    >
      <DemoRecipe />
    </div>,
    <div
      key="ingredients"
      className="w-full h-full flex flex-col items-center justify-center p-4 md:p-6 scale-95"
    >
      <DemoIngredients />
    </div>,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-start py-16 md:py-24 px-4 overflow-hidden">

      <div
        className="z-20 text-center text-green-200 font-bold mb-8 md:mb-12
                   text-xl sm:text-2xl md:text-3xl lg:text-4xl
                   transition-opacity duration-300"
      >
        {slideTitles[currentSlide]}
      </div>


      <div
        className="relative z-10 w-full max-w-[500px] lg:max-w-[800px]
                   min-h-[300px] md:min-h-[400px]
                   bg-gray-700 rounded-3xl shadow-lg 
                   border-[2px] border-green-300 overflow-hidden
                   flex items-center justify-center"
      >

        <div
          className="flex transition-transform duration-700 ease-in-out w-full h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 h-full flex items-center justify-center"
            >
              <div
                className={`w-full h-full transform transition-transform duration-300
                            ${
                              index === currentSlide ? "scale-100" : "scale-95"
                            }`}
              >
                {slide}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slider;
