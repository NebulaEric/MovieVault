// backend/server.ts
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { datab } from './db';
import sqlite3 from 'sqlite3';
import { searchMovie, searchMovieSuggestions, downloadPoster } from './tmdb';
import path from 'path';
import axios from 'axios';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/posters', express.static(path.join(process.cwd(), 'public', 'posters')));
// Add a movie
// app.post('/api/movies', (req: Request, res: Response) => {
//   const { title, year } = req.body;

//   if (!title || !year) {
//     res.status(400).json({ success: false, message: 'Missing title or year' });
//     return;
//   }

//   const stmt = datab.prepare('INSERT INTO movies (title, year) VALUES (?, ?)');
//   stmt.run(title, year, function (this: sqlite3.RunResult, err: Error | null) {
//   if (err) {
//     console.error(err.message);
//     return res.status(500).json({ success: false });
    
//   }
//    return res.json({ success: true, id: this.lastID });
   
// });
// });


app.post('/api/movies', async (req: Request, res: Response): Promise<void> => {
  const { title, year } = req.body;

  if (!title || !year) {
    res.status(400).json({ success: false, message: 'Missing title or year' });
    return;
  }

  try {
    // Search TMDb
    // const results = await searchMovie(title);
    // const movie = results[0]; // First match
    const movie = await searchMovie(title);

    // const posterPath = movie?.poster_path || '';
    // const overview = movie?.overview || '';

    const stmt = datab.prepare(
      'INSERT INTO movies (title, year, poster, overview) VALUES (?, ?, ?, ?)'
    );

    stmt.run(movie.title, year, movie.poster, movie.overview, function (this: sqlite3.RunResult, err: Error | null) {
      if (err) {
        console.error(err.message);
        res.status(500).json({ success: false });
      } else {
        res.json({ success: true, id: this.lastID });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'TMDb lookup failed' });
  }
});


// Get all movies
// app.get('/api/movies', (req, res) => {
//   datab.all('SELECT * FROM movies', [], (err, rows) => {
//     if (err) {
//       console.error(err.message);
//       return res.status(500).json({ success: false });
//     }
//     res.json({ success: true, data: rows });
//   });
// });
app.get('/api/movies', (req, res) => {
  try {
    const rows = datab.prepare('SELECT * FROM movies').all();
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});



app.get('/api/tmdb/search', async (req: Request, res: Response): Promise<void> => {
  const title = req.query.title;

  if (!title || typeof title !== 'string') {
    res.status(400).json({ error: 'Missing or invalid title' });
    return;
  }

  try {
    const results = await searchMovie(title);
    res.json({ success: true, results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'TMDb API failed' });
  }
});



// app.get('/api/search-movies', async (req: Request, res: Response): Promise<void> => {
//   const query = req.query.q as string;
//   const source = req.query.source as 'tmdb' | 'local';

//   if (!query) {
//     res.status(400).json({ results: [] });
//     return;
//   }

//   try {
//     let results: any[] = [];

//     if (source === 'tmdb') {
//       const response = await searchMovie(query);
//       const data = response.results;
//       results = data.slice(0, 5);
//     } else {
//       const rows = datab.prepare('SELECT * FROM movies WHERE title LIKE ?').all(`%${query}%`);
//       results = rows;
//     }

//     res.json({ results });
//   } catch (err) {
//     console.error('API search failed:', err);
//     res.status(500).json({ results: [] }); // ✅ Always respond with valid JSON
//   }
// });



app.get('/api/search-movies', async (req: Request, res: Response): Promise<void> => {
  const query = req.query.q as string;
  const source = req.query.source as 'tmdb' | 'local';

  if (!query) {
    res.status(400).json({ results: [] });
    return;
  }

  try {
    let results: any[] = [];

    if (source === 'tmdb') {
      results = await searchMovieSuggestions(query); // ✅ new function here
    } else {
      const rows = datab.prepare('SELECT * FROM movies WHERE title LIKE ?').all(`%${query}%`);
      results = rows;
    }

    res.json({ results });
  } catch (err) {
    console.error('API search failed:', err);
    res.status(500).json({ results: [] });
  }
});

app.get('/api/preview-movie', async (req: Request, res: Response): Promise<void> => {
  const id = req.query.id as string;

  if (!id) {
    res.status(400).json({ error: 'Missing movie ID' });
    return;
  }

  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
      headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }
    });

    const movie = response.data;
    console.log(movie);
    const localPosterPath = await downloadPoster(movie.poster_path, movie.id);

    res.json({
      id: movie.id,
      title: movie.title,
      year: movie.release_date?.substring(0, 4),
      overview: movie.overview,
      poster: localPosterPath,
    });
  } catch (err) {
    console.error('TMDb movie fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch movie preview' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
