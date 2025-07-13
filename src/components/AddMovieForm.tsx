// import React, { useState } from 'react';
// import MovieSearchInput from '../components/MovieSearchInput';

// interface AddMovieFormProps {
//   onClose: () => void;
// }

// export default function AddMovieForm({ onClose }: AddMovieFormProps) {
//   const [title, setTitle] = useState('');
//   const [year, setYear] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const res = await fetch('http://localhost:3000/api/movies', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ title, year }),
//     });

//     if (res.ok) {
//       onClose();
//     } else {
//       console.error('Failed to add movie');
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      
//       <MovieSearchInput
//       source='tmdb'
//         onMovieSelect={(movie) => {
//           setTitle(movie.title || '');
//           setYear((movie.year || '').substring(0, 4));
//         }}
//       />
      
//       <input
//         type="text"
//         placeholder="Title"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//         className="border p-2"
//       />
//       <input
//         type="number"
//         placeholder="Year"
//         value={year}
//         onChange={(e) => setYear(e.target.value)}
//         className="border p-2"
//       />
//       <div className="flex justify-end gap-2">
//         <button type="button" onClick={onClose} className="bg-gray-300 p-2 rounded">
//           Cancel
//         </button>
//         <button type="submit" className="bg-blue-500 text-white p-2 rounded">
//           Add Movie
//         </button>
//       </div>
//     </form>
//   );
// }

import React, { useState } from 'react';
import MovieSearchInput from '../components/MovieSearchInput';
import { useNavigate } from 'react-router-dom';

interface AddMovieFormProps {
  onClose: () => void;
}

interface SelectedMovie {
  title: string;
  year: string;
  id: number;
}

export default function AddMovieForm({ onClose }: AddMovieFormProps) {
  const [selectedMovie, setSelectedMovie] = useState<SelectedMovie | null>(null);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-2">Search for a Movie</h2>

      <MovieSearchInput
        source="tmdb"
        onMovieSelect={(movie) => {
          navigate(`/preview/${movie.id}?title=${encodeURIComponent(movie.title)}&year=${movie.year}`);
          // setSelectedMovie({
          //   title: movie.title,
          //   year: movie.year,
          //   id: movie.id!,
          // });
        }}
      />

      {/* {selectedMovie && (
        <div className="mt-4">
          <button
            onClick={() => {
              // Placeholder: navigate to another page or do something with the movie
              console.log('Selected Movie:', selectedMovie);
              // e.g., navigate(`/movie/${selectedMovie.id}`)
            }}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            View "{selectedMovie.title}" ({selectedMovie.year})
          </button>
        </div>
      )} */}

      <button
        onClick={onClose}
        className="mt-4 bg-gray-300 text-black p-2 rounded hover:bg-gray-400"
      >
        Cancel
      </button>
    </div>
  );
}