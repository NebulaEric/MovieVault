import React from "react"
import { useState, useEffect } from 'react'
import { Outlet } from "react-router-dom"
import  Modal  from './Modal';
import MovieSearchInput from '../components/MovieSearchInput';
import Navbar from "./NavBar";
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
  const [medias, setMedia] = useState<Movie[]>([]);
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const filterParam = params.get("filter") || "all";
  const [filter, setFilter] = useState(filterParam);
  
  // Fetch media for home page
  useEffect(() => {
    
    const fetchMedia = async () => {
    try {
      const response = await fetch(`/api/media?filter=${filter}`);
      const data = await response.json();
      
      if (data.success) {
        setMedia(data.data);
      } else {
          console.error('Failed to load movies');
        }
    } catch (err) {
      console.error('Error fetching movies:', err);
    }
  };
  fetchMedia();
  }, [filter]);

  return <>
    <header className="fixed top-0 w-full z-[1000] flex">
      <Navbar 
        filter={filter} 
        setFilter={setFilter} 
        onAddMovie={() => setIsModalOpen(true)} 
      />

      {/* Search Bar Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <MovieSearchInput
          source="tmdb"
          onMovieSelect={(media) => {
            setIsModalOpen(false);
            navigate(`/preview/${media.media_type}/${media.id}/tmdb`);
          }}
        />
      </Modal>
    </header>
        
    <main className="flex flex-col flex-1 pt-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-6">
        {medias.map((media) => (
          <Link
            to={`/preview/${media.media_type}/${media.id}/local`}
            key={media.id}
            className="bg-[#09090b] rounded-2xl shadow-sm shadow-gray-600 hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200"
          >
            {/* Poster */}
            <div className="aspect-[2/3] bg-gray-100">
              <img
                src={media.poster ? `${media.poster}` : '/posters/NoPoster.png'}
                alt={media.title}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Movie Title/Year */}
            <div className="p-4 text-center">
              <p className="text-lg font-semibold text-white">
                {media.title} <span className="text-gray-500">({media.year?.toString().substring(0, 4)})</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  <Outlet />
  </>
}