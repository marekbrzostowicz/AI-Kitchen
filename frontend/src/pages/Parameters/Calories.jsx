import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import PropTypes from "prop-types";

const Calories = ({ calories, setCalories }) => {
  const [isOn, setIsOn] = useState(false);

  const toggleState = () => {
    setIsOn((prev) => !prev); // Zmień stan isOn
    setCalories(!calories); // Przełącz stan kalorii w nadrzędnym komponencie
  };

  return (
    <div
      className="relative flex items-center justify-between gap-[6px] border-[3px] p-2 border-gray-400 rounded-xl hover:bg-slate-700 cursor-pointer"
      onClick={toggleState} // Obsługa kliknięcia
    >
      <p className="font-semibold text-[14px]">
        {calories ? "Display Calories" : "Display Calories"}
      </p>
      {/* Kwadrat pojawiający się wewnątrz diva */}
      {isOn && (
        <div>
          <FaCheckCircle size={20} color="#ffe345" />
        </div>
      )}
    </div>
  );
};

Calories.propTypes = {
  calories: PropTypes.bool.isRequired,
  setCalories: PropTypes.func.isRequired,
};

export default Calories;
