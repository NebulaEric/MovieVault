import React from "react";
import profileLogo from "/src/assets/EW.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  filter: string;
  setFilter: (filter: string) => void;
  onAddMovie: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ filter, setFilter, onAddMovie }) => {
    const navigate = useNavigate();
  return (
    <nav className="bg-[#09090b] border-b border-gray-600 shadow-md sticky top-0 z-50 w-full">
      <div className="mx-3 px-4 py-3 pr-12 flex items-center w-full">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <button
            onClick={() => {
            navigate("/");
            setFilter("all");
            }}
            className="flex items-center gap-2 text-xl font-semibold text-white hover:text-blue-600"
          >
            <img src={profileLogo} alt="logo" className="w-8 h-8 rounded-full" />
            Eric's Projects
          </button>

          {/* Nav Links */}
          <div className="hidden md:flex gap-6">
            {[
              { label: "Home", value: "all" },
              { label: "Movies", value: "movie" },
              { label: "TV Shows", value: "tv" },
              { label: "Anime", value: "anime" },
              { label: "Books", value: "book" },
              { label: "Games", value: "game" },
              { label: "Actors", value: "actor" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => {
                    navigate(`/?filter=${item.value}`); 
                    setFilter(item.value); 
                }}
                className={`font-medium ${
                  filter === item.value
                    ? "text-blue-500"
                    : "text-white hover:text-slate-500"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add Movie Button (aligned right) */}
        <button
          onClick={onAddMovie}
          className="flex items-center ml-auto gap-2 bg-zinc-900 hover:bg-rose-100 text-white hover:text-zinc-500 px-4 py-2 rounded-md shadow transition"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          Add Movie
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
