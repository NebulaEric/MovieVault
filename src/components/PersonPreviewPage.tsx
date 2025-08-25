import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from "./NavBar";
import  Modal  from './Modal';
import MovieSearchInput from '../components/MovieSearchInput';
import { useNavigate } from 'react-router-dom';

interface Person {
  name: string;
  bio: string;
  birthday: string;
  place_of_birth: string;
  profile_path: string;
}

interface Movie {
  id: number;
  title: string;
  release_date: string;
  media_type: string;
  character: string;
  poster_path: string;
}

interface MovieRole {
  id: number;
  title: string;
  release_date: string;
  media_type: string;
  character: string;
}


export default function PersonPreviewPage() {
    const { id, source } = useParams();
    const [person, setPerson] = useState<Person | null>(null);
    const [inLibraryMovies, setInLibraryMovies] = useState<Movie[]>([]);
    const [notInLibraryMovies, setNotInLibraryMovies] = useState<MovieRole[]>([]);
    const [showFullBio, setShowFullBio] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState("all");
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchPersonDetails() {
            try {
                const res = await fetch(`/api/preview-person?id=${id}`);
                const data = await res.json();
                setPerson(data);
            } catch (err) {
                console.error('Failed to fetch person details:', err);
            }
        }
        async function fetchPersonMovies() {
            try {
                const res = await fetch(`/api/person-movies?id=${id}`);
                const data = await res.json();
                setInLibraryMovies(data.inLibrary || []);
                setNotInLibraryMovies(data.notInLibrary || []);
            } catch (err) {
                console.error('Failed to fetch person movies:', err);
            }
        }        

        fetchPersonDetails();
        fetchPersonMovies();
    }, [id, source]);

  if (!person) {
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
          <p className="text-gray-600 text-lg font-medium">Loading Actor...</p>
        </div>
      </div>
    </>);
  }
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

    <main>
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 pt-25">
        {/* Actor Info */}
        <div className="max-w-4xl w-full bg-gray-800/40 backdrop-blur-md rounded-xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <img
              src={person.profile_path}
              alt={person.name}
              className="w-48 h-auto rounded-lg shadow-md"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{person.name}</h1>
              <p className="text-sm text-gray-400 mb-1">
                <strong>Birthday:</strong> {person.birthday || 'N/A'}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                <strong>Place of Birth:</strong> {person.place_of_birth || 'N/A'}
              </p>

              <div className="relative">
                <p
                  className={`text-base transition-all duration-300 ease-in-out ${
                  showFullBio ? '' : 'max-h-40 overflow-hidden'
                  }`}
                >
                {person.bio || 'No biography available.'}
                </p>

                {/* Fade effect */}
                {!showFullBio && (
                  <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-gray-800/0 to-transparent pointer-events-none" />
                )}

                {/* Read more / Show less */}
                {person.bio && person.bio.length > 300 && (
                  <div className="relative z-10 ">
                    <button
                      className="mt-3 text-blue-400 hover:underline focus:outline-none"
                      onClick={() => setShowFullBio(!showFullBio)}
                    >
                    {showFullBio ? 'Show less' : 'Read more'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* In Library Movies */}
        <div className="max-w-4xl w-full mb-12">
          <h2 className="text-2xl font-semibold mb-4">In Your Library</h2>
          {inLibraryMovies.length === 0 ? (
            <p className="text-gray-400">No movies in your library with this person.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {inLibraryMovies.map((movie) => (
                <Link
                  to={`/preview/movie/${movie.id}/local`}
                  key={movie.id}
                  className="bg-gray-800/40 rounded-lg pb-3 border border-gray-200 shadow-sm shadow-gray-600 hover:shadow-xl"
                >
                  <img
                    src={movie.poster_path}
                    alt={movie.title}
                    className="w-full h-auto rounded-md mb-2"
                  />
                  <div className="text-sm font-medium">{movie.title}</div>
                  <div className="text-xs text-gray-400">
                    {movie.release_date?.slice(0, 4)} · {movie.character}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Not in Library Movies */}
        <div className="max-w-4xl w-full mb-12">
          <h2 className="text-2xl font-semibold mb-4">Other Roles</h2>
          {notInLibraryMovies.length === 0 ? (
          <p className="text-gray-400">No additional movies found.</p>
          ) : (
          <ul className="space-y-3">
            {notInLibraryMovies.map((movie) => (
              <li key={movie.id}>
                <Link
                  to={`/preview/movie/${movie.id}/tmdb`}
                  className="block bg-gray-800/40 rounded-md p-4 border border-gray-200 hover:bg-gray-700 transition"
                >
                  <div className="font-medium">{movie.title}</div>
                  <div className="text-sm text-gray-400">
                    {movie.release_date?.slice(0, 4) || 'N/A'} · {movie.media_type} · {movie.character}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          )}
        </div>
      </div>
    </main>
  </>);

}