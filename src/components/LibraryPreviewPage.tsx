import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import profileLogo from '/src/assets/EW.png'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import '@/styles/LibraryPreviewPage.module.css'

interface Movie {
  id: number;
  tmdb_id: number;
  title: string;
  year: string;
  overview: string;
  poster: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  profileName: string;
  created_at: string;
}

export default function LibraryPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState('');


  useEffect(() => {
    async function fetchMovieDetails() {
      try {
        const res = await fetch(`/api/search-movies?id=${id}&source=local`);
        const data = await res.json();
        setMovie(data.results[0]);
      } catch (err) {
        console.error('Failed to load movie preview:', err);
      }
    }

    async function fetchReviews() {
      console.log("This is what my movie id is: ", id);
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
      const updated = await fetch(`/api/reviews?movieId=${id}`);
      const data = await updated.json();
      setReviews(data.reviews || []);
    } else {
      console.error('Failed to submit review');
    }
  };

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
      </div>

      <div className="reviews p-4">
        <h3 className="text-xl font-semibold mb-2">Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <ul className="space-y-2">
            {reviews.map((review) => (
              <li key={review.id} className="border rounded p-3 bg-gray-100">
                <div className="flex justify-between">
                  <span className="font-bold">{review.profileName}</span>
                  <span>{review.created_at}</span>
                </div>
                <p className="text-yellow-600 font-semibold">Rating: {review.rating}/10</p>
                <p>{review.comment}</p>
              </li>
            ))}
          </ul>
        )}

        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setShowModal(true)}
        >
          Add Review
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            <label className="block mb-2">
              Rating (0–10)
              <input
                type="number"
                min="0"
                max="10"
                value={newRating}
                onChange={(e) => setNewRating(parseInt(e.target.value))}
                className="w-full p-2 border rounded mt-1"
              />
            </label>
            <label className="block mb-4">
              Comment
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-2 border rounded mt-1"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded">
                Cancel
              </button>
              <button onClick={handleReviewSubmit} className="px-4 py-2 bg-green-600 text-white rounded">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
    </>
    
    
  );
}
