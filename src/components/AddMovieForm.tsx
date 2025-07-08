import React, { useState } from 'react';

interface AddMovieFormProps {
  onClose: () => void;
}

export default function AddMovieForm({ onClose }: AddMovieFormProps) {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3000/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, year }),
    });

    if (res.ok) {
      onClose();
    } else {
      console.error('Failed to add movie');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2"
      />
      <input
        type="number"
        placeholder="Year"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className="border p-2"
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="bg-gray-300 p-2 rounded">
          Cancel
        </button>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Add Movie
        </button>
      </div>
    </form>
  );
}