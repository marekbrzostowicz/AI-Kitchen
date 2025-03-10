import Flag from "react-world-flags";
import { FaImage, FaSave, FaStar } from "react-icons/fa";
import salad from "../../assets/salad.png";



const DemoRecipeCard = () => {
  return (
    <div className="relative p-6 pb-14 bg-yellow-100 text-black max-w-3xl flex flex-col items-start text-left border-[4px] rounded-xl border-yellow-500">
      <div className="flex flex-wrap justify-between w-full gap-4 items-start mb-8">
        <p className="font-bold text-2xl border-b-2 border-yellow-600 p-[5px] flex items-center gap-2">
          Salmon Avocado Salad
          <Flag code="jp" className="w-8 h-auto rounded-lg" />
        </p>

        <div className="flex-shrink-0">
          <img
            src={salad}
            alt="Generated Recipe"
            className="w-[200px] h-[200px] border-4 border-yellow-500 rounded-xl object-cover"
          />
        </div>
      </div>

      <div>
        <p className="font-bold text-xl">Instructions:</p>
        <p className="mb-2 font-medium text-[17px]">
          <span className="font-black text-xl">1.</span> Start by poaching the
          salmon fillet. In a saucepan, bring water to a gentle simmer and add a
          splash of soy sauce and a few slices of ginger root for flavor.
          <hr className="border-t border-gray-900 my-2 border-[1px]" />
        </p>
        <p className="mb-2 font-medium text-[17px]">
          <span className="font-black text-xl">2.</span> Carefully place the
          salmon in the simmering water and poach for about 10-12 minutes, or
          until the salmon is cooked through and flakes easily with a fork.
          <hr className="border-t border-gray-900 my-2 border-[1px]" />
        </p>
        <p className="mb-2 font-medium text-[17px]">
          <span className="font-black text-xl">3.</span> While the salmon is
          cooking, prepare the salad dressing by whisking together 2 tablespoons
          of soy sauce, 1 tablespoon of rice vinegar, and a small amount of
          wasabi paste to taste.
          <hr className="border-t border-gray-900 my-2 border-[1px]" />
        </p>
        <p className="mb-2 font-medium text-[17px]">
          <span className="font-black text-xl">4.</span> Once the salmon is
          done, remove it from the water and let it cool slightly before flaking
          it into bite-sized pieces.
          <hr className="border-t border-gray-900 my-2 border-[1px]" />
        </p>
        <p className="mb-2 font-medium text-[17px]">
          <span className="font-black text-xl">5.</span> In a large bowl,
          combine diced avocado and sliced cucumber. Add the flaked salmon on
          top.
          <hr className="border-t border-gray-900 my-2 border-[1px]" />
        </p>
        <p className="mb-2 font-medium text-[17px]">
          <span className="font-black text-xl">6.</span> Drizzle the dressing
          over the salad and gently toss to combine, being careful not to mash
          the avocado.
          <hr className="border-t border-gray-900 my-2 border-[1px]" />
        </p>
        <p className="mb-2 font-medium text-[17px]">
          <span className="font-black text-xl">7.</span> Sprinkle sesame seeds
          over the top for added crunch and flavor.
          <hr className="border-t border-gray-900 my-2 border-[1px]" />
        </p>
        <p className="mb-2 font-medium text-[17px]">
          <span className="font-black text-xl">8.</span> Serve the salad chilled
          or at room temperature, and enjoy the fresh, vibrant flavors!
          <hr className="border-t border-gray-900 my-2 border-[1px]" />
        </p>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2 items-center">
        <button className="bg-yellow-400 font-medium p-2 rounded-xl text-xm flex items-center gap-[5px] hover:bg-yellow-300 cursor-default">
          Save <FaSave size={20} color="#a36418" />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 flex gap-2 items-center">
        <button className="bg-yellow-400 font-medium p-2 rounded-xl text-xm flex items-center gap-[5px] hover:bg-yellow-300 cursor-default">
          Rate <FaStar color={"#f53364"} size={20} />
          
        </button>
        <FaStar color={"#f53364"} size={24} />
        <FaStar color={"#f53364"} size={24} />
        <FaStar color={"#f53364"} size={24} />
        <FaStar color={"#f53364"} size={24} />
        <FaStar color={"#9ca2ad"} size={24} />
      </div>
    </div>
  );
};

export default DemoRecipeCard;
