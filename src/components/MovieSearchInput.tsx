import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'



interface Movie {
  title: string;
  year: string;
  id: number;
}

interface MovieSearchInputProps {
  source: 'tmdb' | 'local';
  onMovieSelect: (movie: Movie) => void;
}

export default function MovieSearchInput({ source, onMovieSelect }: MovieSearchInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(`/api/search-movies?q=${encodeURIComponent(query)}&source=${source}`);
        const data = await res.json();
        setSuggestions(data.results || []);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    };

    const delayDebounce = setTimeout(fetchSuggestions, 300); // debounce input

    return () => clearTimeout(delayDebounce);
  }, [query, source]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
  <div className="relative w-full max-w-xl">
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute left-4 top-4 transform text-grey-400 z-10 pointer-events-none">
        <FontAwesomeIcon icon={faMagnifyingGlass}/>
      </div>
      
      <input
        type="text"
        ref={inputRef}
        value={query}
        onChange={(e) => {
          console.log('Input Changed:', e.target.value);
          setQuery(e.target.value);
        }}
        placeholder="Search for a movie..."
        className="w-full rounded-xl border border-gray-300 bg-black px-11 py-3 text-lg shadow-lg backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
      />
    </div>
    

    {suggestions.length > 0 && (
      <ul className="absolute left-0 right-0 mt-2 rounded-xl border border-gray-300 bg-black shadow-xl z-50 max-h-60 overflow-y-auto backdrop-blur-md">
        {suggestions.map((movie) => (
          <li key={movie.id}>
            <button
              className="w-full text-left px-5 py-3 hover:bg-gray-800 transition"
              onClick={() => {
                onMovieSelect(movie);
                setQuery('');
                setSuggestions([]);
              }}
            >
              <span className="font-medium">{movie.title}</span> ({movie.year})
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>
  );
}