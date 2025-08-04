import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { datab } from './db.js';
import { searchMovie, tmdbSuggestions } from './tmdb.js';
import path from 'path';
import axios from 'axios';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/posters', express.static(path.join(process.cwd(), 'public', 'posters')));

interface Movie {
  tmdb_id: number;
  title: string;
  year: string;
  overview: string;
  poster: string;
  backdrop: string;
}

//Post Movie to local database
app.post('/api/movies', async (req: Request, res: Response): Promise<void> => {
  // const { tmdb_id, title, year, poster, overview, backdrop } = req.body;
  const { movie, actors } = req.body;
  
  if (!movie) {
    res.status(400).json({ success: false, message: 'Missing Movie Data' });
    return;
  }
  const insertMovieStmt = datab.prepare(`INSERT INTO movies (tmdb_id, title, year, poster, backdrop, overview) VALUES (?, ?, ?, ?, ?, ?)`);

  const insertActorStmt = datab.prepare(`INSERT OR IGNORE INTO actors (id, name, profile_path) VALUES (?, ?, ?)`);

  const insertMovieActorStmt = datab.prepare(`INSERT OR IGNORE INTO movie_actor (movie_id, actor_id, character, actor_order) VALUES (?, ?, ?, ?)`);
  
  try {
    // const stmt = datab.prepare('INSERT INTO movies (tmdb_id, title, year, poster, overview, backdrop) VALUES (?, ?, ?, ?, ?, ?)');
    // const info = stmt.run(tmdb_id, title, Number(year), poster, overview, backdrop);
    const transaction = datab.transaction(() => {
      insertMovieStmt.run(
        movie.tmdb_id,
        movie.title,
        movie.year,
        movie.poster,
        movie.backdrop,
        movie.overview
      );

      for (const actor of actors) {
        insertActorStmt.run(actor.id, actor.name, actor.profile_path);
        insertMovieActorStmt.run(movie.tmdb_id, actor.id, actor.character, actor.order);
      }     
    });
    transaction();
    res.status(200).json({ success: true, message: 'Movie and actors added' });
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
    const stmt = datab.prepare('DELETE FROM movies WHERE tmdb_id = ?');
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
    const rows = datab.prepare('SELECT * FROM movies ORDER BY id DESC').all() as Record<string, any>[];

    const enrichedRows = rows.map((movie) => ({
      ...movie,
      media_type: 'movie'
    }));

    res.json({ success: true, data: enrichedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

//Multi Search TMDB
app.get('/api/search-tmdb', async (req: Request, res: Response): Promise<void> => {
  const { q: query, id } = req.query as Record<string, string>;

  if (!query && !id) {
    res.status(400).json({ results: [] });
    return;
  }

  try {
    let results: any[] = [];
    results = await tmdbSuggestions(query);
    
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
    const movie = datab.prepare(`SELECT tmdb_id, title, year, overview, poster, backdrop FROM movies WHERE tmdb_id = ?`).get(id) as Movie;
    const actors = datab.prepare(`
      SELECT a.id, a.name, a.profile_path, ma.character, ma.actor_order
      FROM movie_actor ma
      JOIN actors a ON ma.actor_id = a.id
      WHERE ma.movie_id = ?
      ORDER BY ma.actor_order ASC
    `).all(req.query.id);

    res.json({
      id: id,
      title: movie.title,
      year: movie.year.toString()?.substring(0, 4),
      overview: movie.overview,
      poster: movie.poster,
      backdrop: movie.backdrop,
      actors: actors,
    });
  } catch (err) {
    console.error('Local movie fetch failed:'); // , err ++++++++ add back if have issues here
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
      actors: movie.actors,
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

//Add to watchlist
app.post('/api/watchlist', async (req: Request, res: Response): Promise<void> => {
  const { movieId, title, year, poster  } = req.body;
  if (!movieId) {
    res.status(400).json({ success: false, message: 'Missing MovieId' });
    return;
  }
  
  try {
    const stmt = datab.prepare(
      'INSERT INTO watchlist (tmdb_id, title, year, poster) VALUES (?, ?, ?, ?)'
    );
    const info = stmt.run(movieId, title, year, poster);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add to watchlist' });
  }
});

//Remove from watchlist
app.delete('/api/watchlist/:id', async (req, res) => {
  const watchlistId = parseInt(req.params.id, 10);

  if (isNaN(watchlistId)) {
    return res.status(400).json({ error: 'Invalid watchlist ID' });
  }

  try {
    const stmt = datab.prepare('DELETE FROM watchlist WHERE tmdb_id = ?');
    const result = stmt.run(watchlistId);

    if (result.changes > 0) {
      res.status(200).json({ message: 'removed from watchlist successfully' });
    } else {
      res.status(404).json({ error: 'movie not found on watchlist' });
    }
  } catch (err) {
    console.error('Failed to remove from watchlist:', err);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

//check watchlist
app.get('/api/watchlist/:tmdb_id', async (req, res) => {
  const { tmdb_id } = req.params;

  try {
    let results: any[] = [];
    const rows = await datab.prepare('SELECT * FROM watchlist WHERE tmdb_id = ?').all(`${tmdb_id}`);
    results = rows;

    if(results.length > 0){
      res.json({ exists: true});
    }
    else{
      res.json({ exists: false});
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check watchlist' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
