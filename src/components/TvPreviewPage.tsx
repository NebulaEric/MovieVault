// pages/TvPreviewPage.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./NavBar";
import  Modal  from './Modal';
import MovieSearchInput from '../components/MovieSearchInput';
import { useNavigate } from 'react-router-dom';
import { Bounce, toast } from 'react-toastify';
import MediaPreview, { type Media } from "../components/MediaPreviewPage";

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
}

export default function TvPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [tv, setTv] = useState<Media | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isTogglingWatchlist, setIsTogglingWatchlist] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const navigate = useNavigate();
  const notifyAdd = () => toast('🎉 Movie added to your library!', {
    position: "top-center",
    autoClose: 1500,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    transition: Bounce,
  });
  const notifyDelete = () => toast('Movie removed from your library!', {
    position: "top-center",
    autoClose: 1500,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    transition: Bounce,
  });

  //Fetch Reviews Function
    async function fetchReviews() {
        const res = await fetch(`/api/review?media_id=${id}`);
        const data = await res.json();
        setReviews(data.results || []);
    }
  
  //Fetch Movie Details Function
    async function fetchShowDetails() {
        try {
            const res = await fetch(`/api/preview-show?id=${id}`);

            if (!res.ok) throw new Error("Movie fetch failed");

            const data = await res.json();
            setTv(data.show);
            console.log("data in fetchShowDetails: ", data);
            setIsInLibrary(data.source === "local");

        } catch (err) {
            console.error("Failed to load movie preview:", err);
        }
    }
    useEffect(() => {
        if(id){
            fetchShowDetails();
            fetchReviews();
        }
    }, [id]);
    //Check watch list 
    async function checkWatchlistStatus(id: number) {
        try {
            const res = await fetch(`/api/watchlist/${id}`);
            if (res.ok) {
                const data = await res.json();
                setIsInWatchlist(data.exists === true);
            } else {
                console.warn('Could not verify watchlist status');
                setIsInWatchlist(false);
            }
        } catch (err) {
            console.error('Error checking watchlist:', err);
            setIsInWatchlist(false);
        }
    }
    useEffect(() => {
        if (tv) {
            checkWatchlistStatus(tv.id);
        }
    }, [tv]);

  if (!tv) {
    return (<>
      <header className="fixed top-0 w-full z-[1000] flex">
        {/* navbar */}
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

      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-600 text-lg font-medium">Loading TV show...</p>
        </div>
      </div>
    </>);
  }

  return (
    <MediaPreview
      media={tv}
      reviews={reviews}
      isInLibrary={isInLibrary}
      isInWatchlist={isInWatchlist}
      isTogglingWatchlist={isTogglingWatchlist}
      onToggleLibrary={async () => {
        if (!tv) return;
        
        try {
          if (isInLibrary) {
            // REMOVE MOVIE FROM LIBRARY
            const res = await fetch(`/api/movies?id=${tv.id}`, {
              method: 'DELETE',
            });
            if (res.ok) {
              notifyDelete();
              setIsInLibrary(false);
              setTimeout(() => {
                navigate('/');
              }, 1500);
            } else {
              alert('❌ Failed to remove movie.');
            }
          } else {
            // ADD MOVIE TO LIBRARY
            const res = await fetch('/api/tv', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tv: {
                  tmdb_id: tv.id,
                  title: tv.title,
                  year: tv.release_date,
                  poster: tv.poster,
                  backdrop: tv.backdrop,
                  overview: tv.overview,
                  num_season: tv.number_of_seasons,
                  num_episode: tv.number_of_episodes,
                  media_type: 'tv',
                },
                actors: tv.actors.map(actor => ({
                  id: actor.id,
                  name: actor.name,
                  character: actor.character,
                  order: actor.order,
                  profile_path: actor.profile_path
                })),
                seasons: tv.seasons.map(season => ({
                  id: tv.id,
                  name: season.name,
                  overview: season.overview,
                  season_number: season.season_number,
                  episode_count: season.episode_count,
                  air_date: season.air_date,
                  poster: season.poster
                }))
              }),
            });

            if (res.ok) {
              notifyAdd();
              const data = await res.json();
              setIsInLibrary(true);
              navigate(`/preview/tv/${data.id}/local`);
            } else {
            alert('Failed to add TV Show.');
            }
          }
        } catch (err) {
          console.error('Failed to modify TV Show:', err);
        }
      }}

      onToggleWatchlist={async () => {
        if (!tv) return;
        setIsTogglingWatchlist(true);
        try {
          if (isInWatchlist) {
            // REMOVE from watchlist
            const res = await fetch(`/api/watchlist`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                media_id: tv.id,
                profile_id: 1, //MAKE SURE TO UPDATE++++++++++++++++++++
              }),
            });

            if (res.ok) {
              setIsInWatchlist(false);
            } else {
              alert('❌ Failed to remove from watchlist.');
            }
          } else {
            // ADD to watchlist
            const res = await fetch('/api/watchlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                media_id: tv.id,
                profile_id: 1, //MAKE SURE TO UPDATE++++++++++++++++++++
              }),
            });

            if (res.ok) {
              setIsInWatchlist(true);
            } else {
              alert('Failed to add to watchlist.');
            }
          }
        } catch (err) {
          console.error('Error toggling watchlist:', err);
        } finally {
          setIsTogglingWatchlist(false);
        }
      }}

      onAddReview={async (rating, comment) => {
        const res = await fetch('/api/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            media_id: tv.id,
            profile_id: 1, // replace with profile logic
            rating: rating,
            comment: comment,
          }),
        });

        if (res.ok) {
          fetchReviews();
          console.log("Review Added.")
        } else {
          console.error('Failed to submit review');
        }
      }}

      onDeleteReview={async (review_id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
          const res = await fetch(`/api/review?id=${review_id}`, {
            method: 'DELETE',
          });

          if (res.ok) {
            fetchReviews();
          } else {
            console.error('Failed to delete review');
          }
        } catch (err) {
          console.error('Error deleting review:', err);
        }
      }}
    >
      {/* TV-specific section */}
      <div className="mt-10 bg-black/40 backdrop-blur-md p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold mb-4">Seasons</h3>

        {tv.seasons && tv.seasons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tv.seasons.map((season) => (
          <div 
            key={season.id} 
            className="bg-black/30 rounded-xl shadow-md overflow-hidden hover:scale-105 transition-transform"
            >
            {season.poster? (
            <img
            src={`https://image.tmdb.org/t/p/w300${season.poster}`}
            alt={season.name}
            className="w-full h-48 object-cover"
            />
            ) : (
            <div className="w-full h-48 bg-gray-700 flex items-center justify-center text-gray-400">
            No Image
            </div>
            )}
            <div className="p-4">
              <h4 className="text-lg font-semibold">{season.name}</h4>
              <p className="text-sm text-gray-300 line-clamp-3">
                {season.overview || "No overview available."}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Episodes: {season.episode_count} • Air Date: {season.air_date || "N/A"}
              </p>
              <p className="text-xs text-gray-400">
                Average Rating: {season.vote_average?.toFixed(1) ?? "N/A"}
              </p>
            </div>
          </div>
          ))}
          </div>
        ) : (
          <p className="text-gray-400">No seasons available.</p>
        )}
      </div>
    </MediaPreview>
  );
}
