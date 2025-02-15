import { useState } from "react";
import { HiInformationCircle } from "react-icons/hi";

function InfoIcon() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipSide, setTooltipSide] = useState("right"); // 'right' by default

  const handleMouseEnter = () => {
    // If window width < 600, switch to left
    if (window.innerWidth < 800) {
      setTooltipSide("left");
    } else {
      setTooltipSide("right");
    }
    setShowTooltip(true);
  };

  return (
    <div className="relative flex items-center">
      {/* Icon */}
      <HiInformationCircle
        size={25}
        className="hover:cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
      />

      {/* Tooltip */}
      {showTooltip && (
        <div
          className={`absolute top-1 bg-gray-600 text-white text-sm p-2 rounded-lg shadow-lg w-[250px] z-[50] 
            ${tooltipSide === "left" ? "right-8" : "left-8"}
          `}
        >
          Click on an ingredient to get detailed information about it.
          <div className="flex flex-col gap-2">
            <div className="font-black mt-4 text-red-300">LIMITS</div>

            <div>
              <span className="font-black text-orange-300">
                Image Generation:
              </span>{" "}
              3 per day
            </div>
            <hr />
            <div>
              <span className="font-black text-orange-300">
                Recipe Generation:
              </span>{" "}
              15 per day
            </div>
            <hr />
            <div>
              <span className="font-black text-orange-300">
                Detailed Ingredients Information:
              </span>{" "}
              30 per day
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InfoIcon;
