import React from "react"
import profileLogo from '/src/assets/EW.png'
import { useState, useEffect } from 'react'
import { Outlet } from "react-router-dom"
import  Modal  from './Modal';
import MovieSearchInput from '../components/MovieSearchInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface Movie {
  title: string;
  overview: string;
  poster: string;
  id: number;
  year: number;
  tmdb_id: number;
  media_type: string;
}

export const Home: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const navigate = useNavigate();
    
  useEffect(() => {
    
    const fetchMovies = async () => {
    try {
      const response = await fetch('/api/movies');
      const data = await response.json();
      
      if (data.success) {
        setMovies(data.data);
      } else {
          console.error('Failed to load movies');
        }
    } catch (err) {
      console.error('Error fetching movies:', err);
    }
  };
  fetchMovies();
  }, []);

  return <>
    <header className="fixed top-0 w-full z-[1000] flex">
      <nav className="bg-[#09090b] border-b border-gray-600 shadow-md sticky top-0 z-50">
        <div className="mx-3 px-4 py-3 pr-12 flex items-center w-screen">
          <div className="flex items-center space-x-8">
            
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 text-xl font-semibold text-white hover:text-blue-600">
              <img src={profileLogo} alt="logo" className="w-8 h-8 rounded-full"/>
              Eric's Projects
            </a>

            {/* Nav Links */}
            <div className="hidden md:flex gap-6">
              <a href="/" className="text-white hover:text-slate-500 font-medium">Home</a>
              <a href="#about" className="text-white hover:text-slate-500 font-medium">Movies</a>
              <a href="#education" className="text-white hover:text-slate-500 font-medium">TV Shows</a>
              <a href="#project" className="text-white hover:text-slate-500 font-medium">Anime</a>
              <a href="#contact" className="text-white hover:text-slate-500 font-medium">Books</a>
              <a href="#contact" className="text-white hover:text-slate-500 font-medium">Actors</a>
            </div>
          </div>
          
          {/* Add Movie Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center ml-auto gap-2 bg-zinc-900 hover:bg-rose-100 text-white hover:text-zinc-500 px-4 py-2 rounded-md shadow transition"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass}/>
            Add Movie
          </button>

          {/* Search Bar Modal */}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <MovieSearchInput
              source="tmdb"
              onMovieSelect={(movie) => {
                setIsModalOpen(false);
                navigate(`/preview/${movie.media_type}/${movie.id}/tmdb`);
              }}
            />
          </Modal>
        </div>
      </nav>
    </header>
        
    <main className="flex flex-col flex-1 pt-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-6">
        {movies.map((movie) => (
          <Link
            to={`/preview/${movie.media_type}/${movie.tmdb_id}/local`}
            key={movie.tmdb_id}
            className="bg-[#09090b] rounded-2xl shadow-sm shadow-gray-600 hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200"
          >
            {/* Poster */}
            <div className="aspect-[2/3] bg-gray-100">
              <img
                src={movie.poster ? `${movie.poster}` : '/NoPoster.png'}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Movie Title/Year */}
            <div className="p-4 text-center">
              <p className="text-lg font-semibold text-white">
                {movie.title} <span className="text-gray-500">({movie.year})</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  <Outlet />
  </>
}