import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import profileLogo from '/src/assets/EW.png'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import '@/styles/MoviePreviewPage.module.css'

interface Movie {
  id: number;
  title: string;
  year: string;
  overview: string;
  poster: string;
}

export default function MoviePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
    async function fetchMovieDetails() {
      try {
        const res = await fetch(`/api/preview-movie?id=${id}`);
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error('Failed to load movie preview:', err);
      }
    }

    fetchMovieDetails();
  }, [id]);

  if (!movie) return <p>Loading movie...</p>;

  return (
    <>
    <header>
          <nav>
            <div className="container nav">
              <a className="profileLogo" href="/"><img src={profileLogo} alt="logo"/>Eric's Projects</a>
              {/* <!-- Navigation Links --> */}
              <div className="navLinks">
                <a className="button" href="/">Home</a>
                <a className="button" href="#about">Movies</a>
                <a className="button" href="#education">TV Shows</a>
                <a className="button" href="#project">Anime</a>
                <a className="button" href="#contact">Books</a>
                <a className="button" href="#contact">Actors</a>
              </div>
            </div>
          </nav>
    </header>
    <main>
        <div className="p-4">
            <img src={movie.poster} alt={movie.title} className="w-64" />
            <h2 className="text-2xl font-bold mt-2">{movie.title} ({movie.year})</h2>
            <p className="mt-2">{movie.overview}</p>

            <button className="mt-4 bg-green-600 text-white p-2 rounded"
            onClick={async () => {
    if (!movie) return;

    try {
      const res = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdb_id: movie.id,
          title: movie.title,
          year: movie.year,
          poster: movie.poster,
          overview: movie.overview,
        }),
      });

      if (res.ok) {
        alert('🎉 Movie added to your library!');
      } else {
        alert('❌ Failed to add movie.');
      }
    } catch (err) {
      console.error('Failed to add movie:', err);
      alert('⚠️ Error adding movie');
    }
  }}>
                Add to My Library
            </button>
        </div>
    </main>
    </>
    
    
  );
}
