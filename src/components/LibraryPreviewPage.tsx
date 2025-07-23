import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import profileLogo from '/src/assets/EW.png'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
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
  const [isAdding, setIsAdding] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);
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


  useEffect(() => {
    async function fetchMovieDetails() {
      try {
        // console.log("This is what my movie id is: ", id);
        if (source == 'local'){
          const localRes = await fetch(`/api/preview-movie/local?id=${id}`);
          const localData = await localRes.json();
          setMovie(localData.results[0]);
          setIsInLibrary(true);
        }
        else{
          const previewRes = await fetch(`/api/preview-movie/tmdb?id=${id}`);
          const previewData = await previewRes.json();
          console.log("This is my preview data",previewData);
          setMovie(previewData);
          setIsInLibrary(false);
        }
        
        

      } catch (err) {
        console.error('Failed to load movie preview:', err);
      }
    }

    async function fetchReviews() {
      
      const res = await fetch(`/api/reviews?movieId=${id}`);
      const data = await res.json();
      console.log("and this is what the data being returned is: ", data);
      setReviews(data.results || []);
    }
    if(id){
        fetchMovieDetails();
        fetchReviews();
    }
    
  }, [id]);

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
      const updatedRes = await fetch(`/api/reviews?movieId=${id}`);
      const updatedData = await updatedRes.json();
      setReviews(updatedData.results || []);
    } else {
      console.error('Failed to submit review');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
  if (!window.confirm('Are you sure you want to delete this review?')) return;

  try {
    const res = await fetch(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      // Refresh reviews after deletion
      const updatedRes = await fetch(`/api/reviews?movieId=${id}`);
      const updatedData = await updatedRes.json();
      setReviews(updatedData.results || []);
    } else {
      console.error('Failed to delete review');
    }
  } catch (err) {
    console.error('Error deleting review:', err);
  }
};

  const handleDeleteMovie = async (movieId: number) => {
  if (!window.confirm('Are you sure you want to delete this movie, this will also remove all reviews?')) return;

  try {
    const res = await fetch(`/api/movies`, {
      method: 'DELETE',
      body: JSON.stringify({
        movieId: Number(id),
      }),
    });

    if (res.ok) {
      // Refresh reviews after deletion
      navigate('/');
    } else {
      console.error('Failed to delete movie');
    }
  } catch (err) {
    console.error('Error deleting movie:', err);
  }
};

  if (!movie) return (
    <>
  <header>
          <nav className="bg-[#09090b] border-b border-gray-700 shadow-md sticky top-0 z-50">
            <div className="mx-3 px-4 py-3 pr-12 flex items-center w-screen">
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
    
    </>
  );
  
  return (
    <>
    <header>
          <nav className="bg-[#09090b] border-b border-gray-700 shadow-md sticky top-0 z-50">
            <div className="mx-3 px-4 py-3 pr-12 flex items-center w-screen">
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
      <div className="relative min-h-screen text-white bg-gray-900">
  {/* Hero Section with Backdrop */}
  <div
    className="absolute inset-0 bg-cover bg-center brightness-50"
    style={{ backgroundImage: `url(${movie.backdrop || movie.poster})` }}
  ></div>

  {/* Content Overlay */}
  <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
    {/* Movie Info Section */}
    <div className="flex flex-col md:flex-row gap-8 bg-black/50 backdrop-blur-md p-6 rounded-xl shadow-lg">
      {/* Poster */}
      <img
        src={movie.poster}
        alt={movie.title}
        className="w-64 h-auto rounded-lg shadow-xl"
      />

      {/* Movie Details */}
      <div className="flex flex-col justify-center">
        <h2 className="text-4xl font-extrabold mb-2">
          {movie.title} <span className="text-gray-300">({movie.year})</span>
        </h2>
        <p className="text-gray-300 text-lg leading-relaxed mb-6">{movie.overview}</p>
        
        {/* Action Buttons */}
        <div className="flex gap-4">
          {/* <button
            disabled={isInLibrary || isAdding} 
            className={`px-5 py-2 rounded-lg font-semibold transition ${isInLibrary ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            onClick={async () => {
                  if (!movie || isInLibrary) return;
                  setIsAdding(true);
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
                      notify();
                      setTimeout(() => {
                        navigate('/');
                      }, 1500);
                    } else {
                      alert('❌ Failed to add movie.');
                    }
                  } catch (err) {
                      console.error('Failed to add movie:', err);
                      alert('⚠️ Error adding movie');
                    }
                }}
          
          >
            {isInLibrary ? 'Remove from Library' : 'Add to Library'}
          </button> */}
          <button
  className={`px-5 py-2 rounded-lg font-semibold transition ${
    isInLibrary
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-green-600 hover:bg-green-700 text-white'
  }`}
  onClick={async () => {
    if (!movie) return;

    setIsAdding(true);
    try {
      if (isInLibrary) {
        // REMOVE MOVIE FROM LIBRARY
        const res = await fetch(`/api/movies/${movie.id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          notifyDelete();
          setIsInLibrary(false); // Update state
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
            tmdb_id: movie.id,
            title: movie.title,
            year: movie.year,
            poster: movie.poster,
            overview: movie.overview,
          }),
        });

        if (res.ok) {
          notifyAdd(); // Toast for adding movie
          setIsInLibrary(true);
        } else {
          alert('❌ Failed to add movie.');
        }
      }
    } catch (err) {
      console.error('Failed to modify movie:', err);
      alert('⚠️ Error modifying movie');
    } finally {
      setIsAdding(false);
    }
  }}
>
  {isInLibrary ? 'Remove from Library' : 'Add to Library'}
</button>
          <ToastContainer />
          <button className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg font-semibold transition">
            Watch Trailer
          </button>
        </div>
      </div>
    </div>

    {/* Reviews Section */}
    <div className="mt-10 bg-black/40 backdrop-blur-md p-6 rounded-xl shadow-lg">
      <h3 className="text-2xl font-bold mb-4">Reviews</h3>

      {reviews.length === 0 ? (
        <p className="text-gray-400 italic">No reviews yet. Be the first to add one!</p>
      ) : (
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
        Add Review
      </button>
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
    </>
    
    
  );
}
