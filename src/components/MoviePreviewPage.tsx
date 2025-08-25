// pages/MoviePreviewPage.tsx
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

export default function MoviePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Media | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isTogglingWatchlist, setIsTogglingWatchlist] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
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
    async function fetchMovieDetails() {
        try {
            const res = await fetch(`/api/preview-movie?id=${id}`);

            if (!res.ok) throw new Error("Movie fetch failed");

            const data = await res.json();
            setMovie(data.movie);
            setIsInLibrary(data.source === "local");

        } catch (err) {
            console.error("Failed to load movie preview:", err);
        }
    }
    useEffect(() => {
        if(id){
            fetchMovieDetails();
            fetchReviews();
        }
    }, [id]);

    //Check watchlist
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
        if (movie) {
            checkWatchlistStatus(movie.id);
        }
    }, [movie]);

if (!movie) {
    return (<>
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

        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-gray-600 text-lg font-medium">Loading Movie...</p>
            </div>
        </div>
    </>);
}

  return (
    <MediaPreview
        media={movie}
        reviews={reviews}
        isInLibrary={isInLibrary}
        isInWatchlist={isInWatchlist}
        isTogglingWatchlist={isTogglingWatchlist}
        
        //Add/Remove from library button
        onToggleLibrary={async () => {
            if (!movie) return;
            try {
                if (isInLibrary) {
                    // REMOVE MOVIE FROM LIBRARY
                    const res = await fetch(`/api/movies?id=${movie.id}`, {
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
                    const res = await fetch('/api/movies', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            movie: {
                                tmdb_id: movie.id,
                                title: movie.title,
                                year: movie.release_date,
                                poster: movie.poster,
                                backdrop: movie.backdrop,
                                overview: movie.overview,
                                media_type: 'movie',
                            },
                            actors: movie.actors.map(actor => ({
                                id: actor.id,
                                name: actor.name,
                                character: actor.character,
                                order: actor.order,
                                profile_path: actor.profile_path
                            }))
                        }),
                    });

                    if (res.ok) {
                        notifyAdd();
                        const data = await res.json();
                        setIsInLibrary(true);
                        navigate(`/preview/movie/${data.id}/local`);
                    } else {
                        alert('❌ Failed to add movie.');
                    }
                }
            } catch (err) {
                console.error('Failed to modify movie:', err);
                alert('⚠️ Error modifying movie');
            }
        }}

        //Add/Remove from watchlist button
        onToggleWatchlist={async () => {
            if (!movie) return;
            setIsTogglingWatchlist(true);
            try {
                if (isInWatchlist) {
                    // REMOVE from watchlist
                    const res = await fetch(`/api/watchlist`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            media_id: movie.id,
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
                            media_id: movie.id,
                            profile_id: 1, //MAKE SURE TO UPDATE++++++++++++++++++++
                        }),
                    });

                    if (res.ok) {
                        setIsInWatchlist(true);
                    } else {
                        alert('❌ Failed to add to watchlist.');
                    }
                }
            } catch (err) {
                console.error('Error toggling watchlist:', err);
                alert('⚠️ Something went wrong');
            } finally {
                setIsTogglingWatchlist(false);
            }
        }}

        //Add review button
        onAddReview={async (rating, comment) => {
            const res = await fetch('/api/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    media_id: Number(id),
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

        //Delete Review Button
        onDeleteReview={async (rid) => {
            if (!window.confirm('Are you sure you want to delete this review?')) return;

            try {
                const res = await fetch(`/api/review?id=${rid}`, {
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
    />
  );
}
