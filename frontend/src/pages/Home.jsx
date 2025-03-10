import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import backgroundImage from "../assets/mae-mu-PTdm4YUtloY-unsplash.jpg";
import logo from "../assets/logo.png";
import Flag from "react-world-flags";
import Slider from "./Demo/Slider";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { FaReact } from "react-icons/fa";
import { SiMysql, SiExpress, SiTailwindcss } from "react-icons/si";

const Home = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = () => {
    if (window.scrollY > lastScrollY) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80, 
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative">
      <nav
        className={`bg-gray-600 bg-opacity-70 fixed top-0 left-0 w-full font-mono text-xl z-[100] text-green-200 font-bold pt-2 transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 md:px-16">
          <img
            src={logo}
            alt="Logo"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-[100px] h-auto cursor-pointer mb-2 md:mb-0"
          />

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-x-48">
            <div
              onClick={() => scrollToSection("about")}
              className="relative group py-2 inline-block cursor-pointer text-green-200 hover:text-green-400 transition-colors duration-300"
            >
              ABOUT
              <span
                className="absolute left-0 bottom-0 h-[2px] w-full bg-current
                     scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"
              ></span>
            </div>
            <div
              onClick={() => scrollToSection("instructions")}
              className="relative group py-2 inline-block cursor-pointer text-green-200 hover:text-green-400 transition-colors duration-300"
            >
              INSTRUCTIONS
              <span
                className="absolute left-0 bottom-0 h-[2px] w-full bg-current
                     scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"
              ></span>
            </div>

            <Link
              to="/login"
              className="relative group py-2 inline-block cursor-pointer text-green-200 hover:text-green-400 transition-colors duration-300"
            >
              LOGIN
              <span
                className="absolute left-0 bottom-0 h-[2px] w-full bg-current
                     scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"
              ></span>
            </Link>
          </div>
        </div>
      </nav>

      <div
        className="w-full h-screen bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="absolute top-36 left-8">
          <h3 className="text-5xl md:text-5xl font-bold drop-shadow-lg text-green-100">
            AI kitchen helper for recipe ideas.
          </h3>
        </div>
      </div>

      <div className="flex p-20 gap-20" id="about">

        <p className="text-white p-5 text-justify border-2 border-green-200 rounded-lg text-xl">
          AI Kitchen Helper is your smart cooking assistant designed to make
          meal planning easy and fun. Simply tell the app what ingredients you
          have in your kitchen, and it will generate delicious recipe ideas for
          you. Whether you&apos;re looking to reduce food waste, try new dishes,
          or just cook something quick, this app has you covered.
        </p>
        <p className="text-white p-5 text-justify border-2 border-green-200 rounded-lg text-xl">
          AI Kitchen Helper is your ultimate cooking companion, packed with
          features to make your culinary journey seamless. Save your favorite
          recipes to a personal database for easy access anytime. The app also
          calculates the calorie count and nutritional value of each recipe,
          helping you maintain a balanced diet. Whether you&apos;re meal
          prepping, counting calories, or just looking for inspiration, this app
          has everything you need.
        </p>
      </div>
      <div id="instructions">
        <p className="text-3xl ml-8 text-green-200 font-black">
          You can choose cuisines from different countries
        </p>
        <div className="flex justify-evenly mt-8 mb-16">
          <Flag code="pl" alt="Poland" className="w-12 h-auto rounded-lg" />
          <Flag code="it" alt="Italy" className="w-12 h-auto rounded-lg" />
          <Flag code="jp" alt="Polska" className="w-12 h-auto rounded-lg" />
          <Flag code="cn" alt="Polska" className="w-12 h-auto rounded-lg" />
          <Flag code="mx" alt="Polska" className="w-12 h-auto rounded-lg" />
          <Flag code="in" alt="Polska" className="w-12 h-auto rounded-lg" />
          <Flag code="fr" alt="Polska" className="w-12 h-auto rounded-lg" />
        </div>
      </div>
      <div
        className="
    text-white flex flex-col items-center gap-5 
    border-2 border-green-200 rounded-lg
    mx-4 sm:mx-8 md:mx-16 lg:mx-64 p-8 bg-gray-700 mb-12
  "
      >
        <div className="text-2xl font-bold text-green-200 mb-4">HOW TO USE</div>

        <div
          className="
      flex flex-row       /* zawsze w wierszu, nawet na małych ekranach */
      gap-5 
      text-xl 
      w-full 
      justify-center 
      items-start
      overflow-x-auto     /* opcjonalne: poziomy scrollbar na małych ekranach */
    "
        >
          <div className="flex flex-col text-green-100">
            <div className="mb-2">1.</div>
            <div className="mb-2">2.</div>
            <div className="mb-2">3.</div>
            <div className="mb-2">4.</div>
            <div className="mb-2">5.</div>
            <div className="mb-2">6.</div>
          </div>

          <div className="flex flex-col items-center ">
            <div className="mb-5">
              <FaArrowAltCircleRight />
            </div>
            <div className="mb-4">
              <FaArrowAltCircleRight />
            </div>
            <div className="mb-4">
              <FaArrowAltCircleRight />
            </div>
            <div className="mb-4">
              <FaArrowAltCircleRight />
            </div>
            <div className="mb-4">
              <FaArrowAltCircleRight />
            </div>
            <div className="mb-4">
              <FaArrowAltCircleRight />
            </div>
          </div>

          <div className="flex flex-col text-green-300 text-center">
            <div className="mb-2">Log In or Sign Up</div>
            <div className="mb-2">Select Ingredients You Have</div>
            <div className="mb-2">Let AI Generate Recipes</div>
            <div className="mb-2">Explore Suggested Recipes</div>
            <div className="mb-2">Save Recipes to Your Favorites</div>
            <div className="mb-2">Create a Shopping List</div>
          </div>
        </div>
      </div>
      <hr className="ml-48 mr-48 mt-32 mb-8  border-t-2 border-yellow-300"></hr>

      <Slider />

      <div className="flex justify-center">
        <Link
          to="/register"
          className="mt-6 mb-32 bg-gradient-to-r from-green-400 to-green-500 p-6 font-semibold text-gray-800 rounded-2xl hover:bg-green-600 hover:text-white transition-transform duration-300 ease-in-out transform hover:scale-105 shadow-xl shadow-green-500/50 hover:shadow-green-500/60
               focus:outline-none"
        >
          GET STARTED
        </Link>
      </div>

      <footer className="text-white text-center bg-gray-600 opacity-70 p-6 text-xs">
        <p>
          &copy; {new Date().getFullYear()} Marek Brzostowicz. 
        </p>
        <div className="flex justify-center items-center gap-4 mt-2">
          {/* Ikonki technologii */}
          <FaReact className="text-blue-400 text-sm" title="React" size={30} />
          <SiExpress
            className="text-gray-400 text-sm"
            title="Express.js"
            size={30}
          />
          <SiMysql className="text-blue-500 text-sm " title="MySQL" size={34} />
          <SiTailwindcss
            className="text-teal-400 text-sm"
            title="Tailwind CSS"
            size={30}
          />
        </div>
      </footer>
    </div>
  );
};

export default Home;
