import { useState } from "react";

const DemoIngredients = () => {
  const [description, setDescription] = useState({
    name: "Salmon Fillet 🐟",
    details:
      "A rich source of omega-3 fatty acids and high-quality protein, salmon fillet is a heart-healthy choice. Perfect for grilling, baking, or pan-searing, it provides essential nutrients like vitamin D and selenium, making it a versatile and flavorful option for any meal.",
  });

  return (
    <div className="flex flex-col w-full max-w-[400px] justify-center gap-2 border-[3px] rounded-xl border-yellow-500 p-4 bg-gray-800">
      <p className="font-bold text-3xl text-yellow-300 items-center text-center">
        Ingredients:
      </p>

      <div className="text-xl text-center text-yellow-200">
        <span className="font-bold ">1.</span> Salmon Fillet (165 kcal)
      </div>

      <div className="text-xl text-center text-yellow-200">
        <span className="font-bold">2.</span> Soy Sauce (10 kcal)
      </div>
      <div className="text-xl text-center text-yellow-200">
        <span className="font-bold">3.</span>Ginger Root (5 kcal)
      </div>
      <div className="text-xl text-center text-yellow-200">
        <span className="font-bold">4.</span> Rice Vinegar (5 kcal)
      </div>
      <div className="text-xl text-center text-yellow-200">
        <span className="font-bold">5.</span> Avocado (160 kcal)
      </div>
      <div className="text-xl text-center text-yellow-200">
        <span className="font-bold">6.</span> Cucumber (10 kcal)
      </div>
      <div className="text-xl text-center text-yellow-200">
        <span className="font-bold">7.</span> Wasabi Paste (15 kcal) 
      </div>
      <div className="text-xl text-center text-yellow-200">
        <span className="font-bold">8.</span> Sesame Seeds (50 kcal )
      </div>
      <div className="text-xl text-center text-yellow-200">
        <span className="font-bold">9.</span> Nori (10 kcal)
      </div>

      <div className="p-4 bg-white text-black rounded-lg border-2 border-yellow-500 mt-4">
        {/* Wyświetl nazwę i emotkę */}
        <p className="text-2xl font-bold border-b-[3px] border-black">
          Salmon Fillet 🐟
        </p>

        {/* Wyświetl szczegóły */}
        <p className="text-md mt-2 text-gray-800">
          A rich source of omega-3 fatty acids and high-quality protein, salmon
          fillet is a heart-healthy choice. Perfect for grilling, baking, or
          pan-searing, it provides essential nutrients like vitamin D and
          selenium, making it a versatile and flavorful option for any meal.
        </p>

        {/* Przycisk zamykający */}
        <button className="mt-4 bg-yellow-400 px-4 py-2 rounded-lg font-medium hover:bg-yellow-300">
          Close
        </button>
      </div>

      <hr />
      <div className="text-right font-medium text-[19px] text-yellow-200">
        <span className="font-black">Total:</span> 198 kcal
      </div>
    </div>
  );
};

export default DemoIngredients;
