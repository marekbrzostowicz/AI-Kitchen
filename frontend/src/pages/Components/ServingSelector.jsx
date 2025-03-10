import { useState } from "react";
import { FaUser, FaUserFriends } from "react-icons/fa";

function ServingSelector({ servings, setServings }) {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const toggleSelector = () => {
    setIsSelectorOpen((prev) => !prev);
  };

  return (
    <div className="relative">
      <div
        className="border-[3px] border-gray-400 rounded-xl p-2 hover:bg-slate-700 cursor-pointer flex items-center gap-2"
        onClick={toggleSelector}
      >
        Servings: {servings}
        {servings > 1 ? (
          <FaUserFriends size={24} color={"#73a9ff"} />
        ) : (
          <FaUser color={"#73a9ff"} />
        )}
      </div>

      {isSelectorOpen && (
        <div className="absolute z-10 mt-2 bg-gray-800 text-white border-[3px] border-gray-400 rounded-lg p-4 shadow-lg">
          <p className="mb-2 font-medium">Select number of servings:</p>
          <select
            className="bg-gray-700 text-white border border-gray-600 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={servings}
            onChange={(e) => {
              setServings(parseInt(e.target.value));
              setIsSelectorOpen(false);
            }}
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default ServingSelector;
