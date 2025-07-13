import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './MovieSearchInput.module.css';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';



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

  return (
    <div className="movie-search-wrapper relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          console.log('Input Changed:', e.target.value);
          setQuery(e.target.value);}} // <== ✅ This triggers the fetch
        placeholder="Search for a movie..."
        className="border p-2 w-full"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border mt-1 w-full max-h-40 overflow-y-auto shadow">
          {suggestions.map((movie) => (
            <li key={movie.id}>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-200"
                onClick={() => {
                  onMovieSelect(movie);
                  setQuery(''); // optionally clear input
                  setSuggestions([]);
                }}
              >
                {movie.title} ({movie.year}) 
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}