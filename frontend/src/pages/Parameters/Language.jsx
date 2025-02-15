import { useState, useEffect, useRef } from "react";
import Flag from "react-world-flags";
import PropTypes from "prop-types";

const Language = ({ language, setLanguage }) => {
  const [isDiv, setDiv] = useState(false); // Stan rozwinięcia dropdowna
  const dropdownRef = useRef(null); // Referencja do dropdowna

  // Obsługa kliknięcia w opcję języka
  const handleLanguageChange = (code) => {
    setLanguage(code); // Ustawienie nowej flagi w `Welcome.jsx`
    setDiv(false); // Zamknięcie dropdowna
  };

  // Zamknięcie dropdowna po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDiv(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Lista języków z różnymi wartościami `margin-right`
  const languages = [
    { code: "pl", name: "Polski", marginRight: "40px" },
    { code: "de", name: "Deutsch", marginRight: "17px" },
    { code: "es", name: "Español", marginRight: "19px" },
    { code: "fr", name: "Français", marginRight: "13px" },
    { code: "gb", name: "English", marginRight: "24px" },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Główny kontener kliknięcia */}
      <div
        className="flex gap-[6px] border-[3px] p-2 border-gray-400 rounded-xl hover:bg-slate-700 cursor-pointer"
        onClick={() => setDiv((prev) => !prev)} // Kliknięcie otwiera/zamyka dropdown
      >
        <p className="font-semibold text-[14px]">Recipe Language</p>
        <Flag code={language} className="w-8 h-auto rounded-lg" />
      </div>

      {/* Dodatkowy div - lista wyboru języka */}
      {isDiv && (
        <div className="absolute bottom-[50px] left-[14px] mt-2 border-[3px] rounded-xl border-gray-400 text-white p-2 flex flex-col bg-gray-800">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className="flex gap-[5px] mb-2 hover:bg-slate-700 rounded-xl p-1 hover:cursor-pointer"
              onClick={() => handleLanguageChange(lang.code)}
            >
              <p style={{ marginRight: lang.marginRight }}>{lang.name}</p>
              <Flag code={lang.code} className="w-8 h-auto rounded-lg" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



export default Language;
