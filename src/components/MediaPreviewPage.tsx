// components/MediaPreview.tsx
import { Link } from "react-router-dom";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import Navbar from "./NavBar";
import  Modal  from './Modal';
import MovieSearchInput from '../components/MovieSearchInput';
import { useNavigate } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";

interface Actor {
  id: number;
  name: string;
  character: string;
  profile_path: string;
  order: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
}

interface Seasons {
  air_date: string | null;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster?: string | null;
  season_number: number;
  vote_average: number;
}

export interface Media {
  id: number;
  tmdb_id: number;
  title: string;
  year: string;
  overview: string;
  poster: string;
  release_date?: string;
  backdrop: string;
  media_type: string;
  number_of_seasons: string,
  number_of_episodes: string,
  actors: Actor[];
  seasons: Seasons[];
}

interface Props {
  media: Media;
  reviews: Review[];
  isInLibrary: boolean;
  isInWatchlist: boolean;
  isTogglingWatchlist: boolean;
  onToggleLibrary: () => void;
  onToggleWatchlist: () => void;
  onAddReview: (rating: number, comment: string) => void;
  onDeleteReview: (id: number) => void;
  children?: React.ReactNode;
}

export default function MediaPreview({
  media,
  reviews,
  isInLibrary,
  isInWatchlist,
  isTogglingWatchlist,
  onToggleLibrary,
  onToggleWatchlist,
  onAddReview,
  onDeleteReview,
  children,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  return (<>
    <header className="fixed top-0 w-full z-[1000] flex">
      {/* Navbar */}
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

    <div className="relative min-h-screen text-white bg-gray-900 overflow-x-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center brightness-50"
        style={{ backgroundImage: `url(${media.backdrop || media.poster})` }}
      ></div>

      {/* Content Overlay */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-18">
        {/* Info Section */}
        <div className="flex flex-col md:flex-row gap-8 bg-black/50 backdrop-blur-md p-6 rounded-xl shadow-lg">
          {/* Poster */}
          <img
            src={media.poster || "/posters/NoPoster.png"}
            alt={media.title}
            className="w-64 h-auto rounded-lg shadow-xl"
          />

          {/* Details */}
          <div className="flex flex-col justify-center items-center">
            <h2 className="text-4xl font-extrabold mb-10">
              {media.title}{" "}
              <span className="text-gray-300">
                ({media.release_date || media.year})
              </span>
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              {media.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4 mr-[3.75rem]">
              <button
                className={`px-5 py-2 rounded-lg font-semibold transition ${
                  isInLibrary
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                onClick={onToggleLibrary}
              >
                {isInLibrary ? "Remove from Library" : "Add to Library"}
              </button>

              <button
                className={`px-5 py-2 rounded-lg font-semibold transition ${
                  isInWatchlist
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                    : "bg-gray-700 hover:bg-yellow-500 text-white"
                }`}
                disabled={isTogglingWatchlist}
                onClick={onToggleWatchlist}
              >
                {isInWatchlist
                  ? "Remove from Watchlist"
                  : "Add to Watchlist"}
              </button>

              <ToastContainer />
            </div>
          </div>
        </div>

        {/* Movie/TV-specific content slot */}
        {children}

        {/* Actors Section */}
        {media.actors?.length > 0 && (
          <div className="mt-10 bg-black/40 backdrop-blur-md p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Actors</h3>
            <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
              {media.actors.map((actor) => (
                <Link
                  to={`/preview/person/${actor.id}/local`}
                  key={actor.id}
                  className="min-w-[120px] flex-shrink-0 flex flex-col items-center bg-gray-800/70 p-4 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-shadow duration-300"
                >
                  <img
                    src={actor.profile_path || "/placeholder.png"}
                    alt={actor.name}
                    className="w-24 h-24 object-cover rounded-full mb-2"
                  />
                  <p className="text-white text-sm font-medium text-center">
                    {actor.name}
                  </p>
                  <p className="text-gray-300 text-xs text-center">
                    {actor.character}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-10 bg-black/40 backdrop-blur-md p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold mb-4">Reviews</h3>
          {reviews.length === 0 ? (
            <p className="text-gray-400 italic">
              No reviews yet. Be the first to add one!
            </p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="p-4 bg-gray-800/70 rounded-lg border border-gray-700 shadow-md hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 text-sm">
                      {review.created_at}
                    </span>
                    <button
                      onClick={() => onDeleteReview(review.id)}
                      className="bg-red-600 hover:bg-red-900 text-white text-sm px-3 py-1 rounded"
                    >
                      Delete
                    </button>
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
                  className="w-full p-2 mt-1 rounded bg-gray-800 text-white border border-gray-700"
                />
              </label>
              <label className="block mb-4">
                <span className="text-gray-300">Comment</span>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-2 mt-1 rounded bg-gray-800 text-white border border-gray-700"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onAddReview(newRating, newComment);
                    setShowModal(false);
                    setNewComment("");
                    setNewRating(5);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
</>
  );
}
