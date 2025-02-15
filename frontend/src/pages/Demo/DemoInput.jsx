import Input from "../Components/Input";
import DemoParameters from "./DemoParameters";

const DemoInputs = () => {
  return (
    <div className="flex flex-col gap-11 bg-gray-800 text-white p-12 rounded-xl  w-[700px] h-[950px] mx-auto border-[2px] border-green-200 items-center justify-evenly">
      <p className="text-green-200 text-xl font-semibold">
        Enter your available ingredients (max 20) and let AI generate the
        recipe.
      </p>

      {/* Statyczne inputy */}
      <div className="flex gap-8">
        <div className="flex flex-col gap-2">
          <Input value="Salmon Fillet" placeholder="Ingredient 1" disabled />
          <Input value="Soy Sauce" />
          <Input value="Ginger Root" />
          <Input value="Rice Vinegar" />
        </div>
        <div className="flex flex-col gap-2">
          <Input value="Avocado" />
          <Input value="Cucumber" />
          <Input value="Wasabi Paste" />
          <Input value="Nori" />
        </div>
        <div className="flex flex-col gap-2">
          <Input value="Sesame Seeds" />
        </div>
      </div>

      {/* Statyczne kontrolki */}
      <div className="flex gap-4 items-center">
        <DemoParameters label="Recipe Language" flagCode="gb" showFlag={true} />
        <DemoParameters label="Cuisine" flagCode="jp" showFlag={true} />
        <DemoParameters label="Display Calories" showFlag={false} />
      </div>

      {/* Przycisk "Generate" */}
      <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold">
        START
      </button>
    </div>
  );
};

export default DemoInputs;
