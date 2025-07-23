import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { datab } from './db.js';
import { searchMovie, searchMovieSuggestions } from './tmdb.js';
import path from 'path';
import axios from 'axios';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/posters', express.static(path.join(process.cwd(), 'public', 'posters')));

//Post Movie to local database
app.post('/api/movies', async (req: Request, res: Response): Promise<void> => {
  const { tmdb_id, title, year, poster, overview, backdrop } = req.body;
  
  if (!title) {
    res.status(400).json({ success: false, message: 'Missing Movie Data' });
    return;
  }

  try {
    const stmt = datab.prepare('INSERT INTO movies (tmdb_id, title, year, poster, overview, backdrop) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(tmdb_id, title, Number(year), poster, overview, backdrop);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed To Add Movie!' });
  }
});

//Delete Movie from local database
app.delete('/api/movies/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if(!id){
    return res.status(400).json({ error: 'Invalid movie ID' });
  }

  try {
    const stmt = datab.prepare('DELETE FROM movies WHERE id = ?');
    const result = stmt.run(id);
    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (err) {
    console.error('Failed to delete movie:', err);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

//Get all movies
app.get('/api/movies', (req, res) => {
  try {
    const rows = datab.prepare('SELECT * FROM movies').all();
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

//Used for search bars
app.get('/api/search-movies', async (req: Request, res: Response): Promise<void> => {
  const { q: query, source, id } = req.query as Record<string, string>;

  if (!query && !id) {
    res.status(400).json({ results: [] });
    return;
  }

  try {
    let results: any[] = [];

    if (source === 'tmdb') {
      results = await searchMovieSuggestions(query);
    } else {
      const rows = datab.prepare('SELECT * FROM movies WHERE id = ?').all(`${id}`);
      results = rows;
      // console.log(results);
    }

    res.json({ results });
  } catch (err) {
    console.error('API search failed:', err);
    res.status(500).json({ results: [] });
  }
});

//Gets local data for movie preview page
app.get('/api/preview-movie/local', async (req: Request, res: Response): Promise<void> => {
  const id = req.query.id as string;

  if (!id) {
    res.status(400).json({ error: 'Missing movie ID' });
    return;
  }

  try {
    let results: any[] = [];
    const rows = datab.prepare('SELECT * FROM movies WHERE id = ?').all(`${id}`);
    results = rows;
    res.json({ results });

  } catch (err) {
    console.error('Local movie fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch movie preview from local' });
  }
});

//Gets data from tmdb for movie preview page
app.get('/api/preview-movie/tmdb', async (req: Request, res: Response): Promise<void> => {
  const id = req.query.id as string;

  try {
    const movie = await searchMovie(id);
    res.json({
      id: movie.id,
      title: movie.title,
      year: movie.release_date?.substring(0, 4),
      overview: movie.overview,
      poster: movie.poster,
      backdrop: movie.backdrop,
    });
  } catch (err) {
    console.error('TMDb movie fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch movie preview from tmdb' });
  }
});


//Get reviews
app.get('/api/reviews', async (req: Request, res: Response): Promise<void> => {
  const id = req.query.movieId as string;

  if (!id) {
    res.status(400).json({ error: 'Missing movie ID' });
    return;
  }
  
  try {
    let results: any[] = [];
    const rows = datab.prepare('SELECT * FROM reviews WHERE movie_id = ?').all(`${id}`);
    results = rows;
    res.json({ success: true, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Missing Reviews' });
  }


});

//Add review
app.post('/api/reviews', async (req: Request, res: Response): Promise<void> => {
  console.log("WE IN HERE");
  const { comment, movieId, profileId, rating  } = req.body;
  if (!movieId) {
    res.status(400).json({ success: false, message: 'Missing MovieId' });
    return;
  }
  
  try {
    const stmt = datab.prepare(
      'INSERT INTO reviews (movie_id, profile_id, rating, comment) VALUES (?, ?, ?, ?)'
    );
    const info = stmt.run(movieId, profileId, rating, comment);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add review' });
  }
});

//Delete review
app.delete('/api/reviews/:id', async (req, res) => {
  const reviewId = parseInt(req.params.id, 10);

  if (isNaN(reviewId)) {
    return res.status(400).json({ error: 'Invalid review ID' });
  }

  try {
    const stmt = datab.prepare('DELETE FROM reviews WHERE id = ?');
    const result = stmt.run(reviewId);

    if (result.changes > 0) {
      res.status(200).json({ message: 'Review deleted successfully' });
    } else {
      res.status(404).json({ error: 'Review not found' });
    }
  } catch (err) {
    console.error('Failed to delete review:', err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
