import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import profileLogo from '/src/assets/EW.png'
import { useNavigate } from 'react-router-dom';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Movie {
  id: number;
  tmdb_id: number;
  title: string;
  year: string;
  overview: string;
  poster: string;
  backdrop: string;
  actors: any[];
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  profileName: string;
  created_at: string;
}

export default function LibraryPreviewPage() {
  const { id, source } = useParams<{ id: string, source: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState('');
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isTogglingWatchlist, setIsTogglingWatchlist] = useState(false);
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
      const res = await fetch(`/api/reviews?movieId=${id}`);
      const data = await res.json();
      setReviews(data.results || []);
  }
  
  //Fetch Movie Details Function
  async function fetchMovieDetails() {
      try {
        const localRes = await fetch(`/api/preview-movie/local?id=${id}`); 
        
        if (source == 'local' || localRes.ok){
          // const localRes = await fetch(`/api/preview-movie/local?id=${id}`);
          const localData = await localRes.json();
          
          setMovie(localData);
          setIsInLibrary(true);
        }
        else{
          const previewRes = await fetch(`/api/preview-movie/tmdb?id=${id}`);
          const previewData = await previewRes.json();
          console.log(previewData);
          setMovie(previewData);
          setIsInLibrary(false);
        }
      } catch (err) {
        console.error('Failed to load movie preview:', err);
      }
    }

  async function checkWatchlistStatus(tmdb_id: number) {
  try {
    const res = await fetch(`/api/watchlist/${tmdb_id}`);
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
  //Fetch Movie Details and Reviews
  useEffect(() => {
    if(id){
        fetchMovieDetails();
        fetchReviews();
    }
  }, [id]);

  useEffect(() => {
  if (movie) {
    checkWatchlistStatus(movie.id);
  }
}, [movie]);
  //Add Review Handler
  const handleReviewSubmit = async () => {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        movieId: Number(id),
        profileId: 1, // replace with profile logic
        rating: newRating,
        comment: newComment,
      }),
    });

    if (res.ok) {
      setShowModal(false);
      setNewComment('');
      setNewRating(5);
      fetchReviews();
    } else {
      console.error('Failed to submit review');
    }
  };

  //Delete Review Handler
  const handleDeleteReview = async (reviewId: number) => {
  if (!window.confirm('Are you sure you want to delete this review?')) return;

  try {
    const res = await fetch(`/api/reviews/${reviewId}`, {
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
};

  if (!movie) return (
  <>
    <header>
      <nav className="bg-[#09090b] border-b border-gray-600 shadow-md sticky top-0 z-50">
        <div className="mx-3 px-4 py-3 pr-12 flex items-center w-full">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 text-xl font-semibold text-white hover:text-blue-600">
              <img src={profileLogo} alt="logo" className="w-8 h-8 rounded-full" />
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
        </div>
      </nav>
    </header>
    
    <main>
      <p>Loading movie...</p>
    </main>
  </>);
  
  return (
  <>
    <header className="fixed top-0 left-0 w-full z-[1000] bg-[#09090b] border-b border-gray-600 shadow-md">
      <nav className="max-w-screen-xl mr-auto px-0 py-2 flex items-center justify-between">
        <div className="mx-3 px-4 py-2 pr-12 flex items-center w-full">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 text-xl font-semibold text-white hover:text-blue-600">
              <img src={profileLogo} alt="logo" className="w-8 h-8 rounded-full" />
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
        </div>
      </nav>
    </header>
    
    <main>
      <div className="relative min-h-screen text-white bg-gray-900 overflow-x-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center brightness-50"
          style={{ backgroundImage: `url(${movie.backdrop || movie.poster})` }}
        ></div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-18">
          {/* Movie Info Section */}
          <div className="flex flex-col md:flex-row gap-8 bg-black/50 backdrop-blur-md p-6 rounded-xl shadow-lg">
            {/* Poster */}
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-64 h-auto rounded-lg shadow-xl"
            />

            {/* Movie Details */}
            <div className="flex flex-col justify-center items-center">
              <h2 className="text-4xl font-extrabold mb-10">
                {movie.title} <span className="text-gray-300">({movie.year})</span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">{movie.overview}</p>
        
              {/* Action Buttons */}
              <div className="flex gap-4 mr-[3.75rem]">
                <button
                  className={`px-5 py-2 rounded-lg font-semibold transition ${
                    isInLibrary
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                  onClick={async () => {
                    if (!movie) return;
                    try {
                      if (isInLibrary) {
                        // REMOVE MOVIE FROM LIBRARY
                        const res = await fetch(`/api/movies/${movie.id}`, {
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
                                year: movie.year,
                                poster: movie.poster,
                                backdrop: movie.backdrop,
                                overview: movie.overview,
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
                            navigate(`/preview/${movie.id}/local`);
                          } else {
                            alert('❌ Failed to add movie.');
                          }
                        }
                    } catch (err) {
                      console.error('Failed to modify movie:', err);
                      alert('⚠️ Error modifying movie');
                    }
                  }}
                >
                {isInLibrary ? 'Remove from Library' : 'Add to Library'}
                </button>
                
                <button
                  className={`px-5 py-2 rounded-lg font-semibold transition ${
                    isInWatchlist
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-gray-700 hover:bg-yellow-500 text-white'
                  }`}
                  disabled={isTogglingWatchlist}
                  onClick={async () => {
                    if (!movie) return;
                    setIsTogglingWatchlist(true);
                    try {
                      if (isInWatchlist) {
                        // REMOVE from watchlist
                        const res = await fetch(`/api/watchlist/${movie.id}`, {
                          method: 'DELETE',
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
                            movieId: movie.id,
                            title: movie.title,
                            year: movie.year,
                            poster: movie.poster,
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
                >
                  {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </button>
                <ToastContainer />
                {/* <button className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg font-semibold transition">
                  Watch Trailer
                </button> */}
              </div>
            </div>
          </div>
          
          {/* Actors Section */}
          {movie.actors?.length > 0 && (
            <div className="mt-10 bg-black/40 backdrop-blur-md p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold mb-4">Actors</h3>
              <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
                {movie.actors.map((actor) => (
                  <Link
                    to={`/preview/person/${actor.id}/local`}
                    key={actor.id}
                    className="min-w-[120px] flex-shrink-0 flex flex-col items-center bg-gray-800/70 p-4 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-shadow duration-300"
                  >
                    <img
                      src={actor.profile_path || '/placeholder.png'}
                      alt={actor.name}
                      className="w-24 h-24 object-cover rounded-full mb-2"
                    />
                    <p className="text-white text-sm font-medium text-center">{actor.name}</p>
                    <p className="text-gray-300 text-xs text-center">{actor.character}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Review Section */}
          <div className="mt-10 bg-black/40 backdrop-blur-md p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Reviews</h3>
            {reviews.length === 0 ? (<p className="text-gray-400 italic">No reviews yet. Be the first to add one!</p>) : (
              <ul className="space-y-4">
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="p-4 bg-gray-800/70 rounded-lg border border-gray-700 shadow-md hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-center mb-1">
                      {/* <span className="font-bold text-lg">{review.profileName}</span> */}
                      <span className="text-gray-400 text-sm">{review.created_at}</span>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="bg-red-600 hover:bg-red-900 text-white text-sm px-3 py-1 rounded"
                      >
                      Delete</button>
                    </div>
                    <p className="text-yellow-400 font-semibold mb-1">
                      Rating: {review.rating}/10
                    </p>
                    <p className="text-gray-300">{review.comment}</p>
                  </li>
                ))}
              </ul>
            )}
            <button
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition"
              onClick={() => setShowModal(true)}
            >
            Add Review</button>
          </div>
        </div>

        {/* Review Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-xl shadow-2xl w-96">
              <h3 className="text-xl font-bold mb-4">Write a Review</h3>
              <label className="block mb-3">
                <span className="text-gray-300">Rating (0–10)</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={newRating}
                  onChange={(e) => setNewRating(parseInt(e.target.value))}
                  className="w-full p-2 mt-1 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </label>
              <label className="block mb-4">
                <span className="text-gray-300">Comment</span>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-2 mt-1 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  </>);
}
