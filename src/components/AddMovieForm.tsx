import React, { useState } from 'react';
import MovieSearchInput from '../components/MovieSearchInput';
import { useNavigate } from 'react-router-dom';
import '@/styles/AddMovieForm.module.css'

interface AddMovieFormProps {
  onClose: () => void;
}

interface SelectedMovie {
  title: string;
  year: string;
  id: number;
}

export default function AddMovieForm({ onClose }: AddMovieFormProps) {
  const [selectedMovie, setSelectedMovie] = useState<SelectedMovie | null>(null);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-2">Search for a Movie</h2>

      <MovieSearchInput
        source="tmdb"
        onMovieSelect={(movie) => {
          console.log("This is the selected movie id: ", movie.id);
          navigate(`/preview/${movie.id}?title=${encodeURIComponent(movie.title)}&year=${movie.year}`);
        }}
      />

      <button
        onClick={onClose}
        className="mt-4 bg-gray-300 text-black p-2 rounded hover:bg-gray-400"
      >
        Cancel
      </button>
    </div>
  );
}