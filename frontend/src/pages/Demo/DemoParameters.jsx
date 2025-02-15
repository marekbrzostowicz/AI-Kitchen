import Flag from "react-world-flags";
import { FaCheckCircle } from "react-icons/fa";

const DemoLanguage = ({label, flagCode, showFlag}) => {
  return (
    <div className="relative">
      <div className="flex gap-[6px] border-[3px] p-2 border-gray-400 rounded-xl bg-gray-800 text-white cursor-default items-center">
        <p className="font-semibold text-[14px]">{label}</p>
        {showFlag ? (
          <Flag code={flagCode} className="w-8 h-auto rounded-lg" />
        ) : (
          <FaCheckCircle size={20} color="#ffe345"/>
        )}
        
      </div>
    </div>
  );
};

export default DemoLanguage;
