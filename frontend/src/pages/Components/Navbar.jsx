import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = ({
  theme = "green",
  links = [],
  onScroll = null,
  onLinkClick = null,
  isFixed = true,
  isTransparent = true,
  containerPadding = "pr-16 pl-16",
  containerDisplay = "flex justify-between",
  logoSize = "100px",
  gapBetweenLinks = "gap-48",
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY.current) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    lastScrollY.current = currentScrollY;

    if (onScroll) {
      onScroll(currentScrollY);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getThemeColors = () => {
    switch (theme) {
      case "yellow":
        return {
          bg: "bg-gray-700",
          text: "text-yellow-200",
          hover: "hover:text-yellow-500",
          border: "border-yellow-600",
        };
      case "green":
      default:
        return {
          bg: "bg-gray-600",
          text: "text-green-200",
          hover: "hover:text-green-400",
          border: "border-green-400",
        };
    }
  };

  const colors = getThemeColors();

  return (
    <nav
      className={`${colors.bg} ${isTransparent ? "bg-opacity-70" : ""} ${
        isFixed ? "fixed" : ""
      } top-0 left-0 w-full font-mono text-xl z-10 ${
        colors.text
      } font-bold pt-2 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div
        className={`container mx-auto ${containerDisplay} items-center ${containerPadding}`}
      >
        <img
          src={logo}
          alt="Logo"
          style={{ width: logoSize, height: "auto" }}
          className="cursor-pointer"
          onClick={() => {
            if (onLinkClick) {
              onLinkClick("logo");
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        />
        <div className={`flex ${gapBetweenLinks}`}>
          {links.map((link, index) => {
            const LinkElement = link.onClick
              ? link.to
                ? Link
                : "button"
              : "div";

            const props = link.to ? { to: link.to } : {};

            return (
              <LinkElement
                key={index}
                {...props}
                className={`relative group py-2 inline-block cursor-pointer ${
                  colors.text
                } ${colors.hover} transition-colors duration-300 ${
                  link.className || ""
                }`}
                onClick={() => {
                  if (link.onClick) {
                    link.onClick();
                  } else if (onLinkClick) {
                    onLinkClick(link.text);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  {link.text}
                  {link.icon && link.icon}
                </div>
                <span
                  className={`absolute left-0 bottom-0 h-[2px] w-full bg-current
                   scale-x-0 origin-left
                   transition-transform duration-300
                   group-hover:scale-x-100`}
                />
              </LinkElement>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
