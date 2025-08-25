import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { datab } from './db.js';
import { personBio, personCredits, searchMedia, tmdbSuggestions } from './tmdb.js';
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
  id: number;
  tmdb_id: number;
  title: string;
  year: string;
  overview: string;
  poster: string;
  backdrop: string;
}
interface Show {
  id: number;
  tmdb_id: number;
  title: string;
  year: string;
  overview: string;
  poster: string;
  backdrop: string;
  num_episode: string;
  num_season: string;
}
interface Person {
  bio: string | null;
  birthday: string;
  id: number;
  name: string;
  place_of_birth: string;
  profile_path: string;
}


//Get all media
app.get('/api/media', (req, res) => {
  const filter = req.query.filter;
  let rows: Record<string, any>[];
  console.log("this is the filter22: ",filter)
  try {
    if(filter === "all") {
      console.log("this is the filter44: ",filter)
      rows = datab.prepare(`SELECT * FROM media ORDER BY id DESC`).all() as Record<string, any>[];
    } else {
      console.log("this is the filter33: ",filter)
      rows = datab.prepare(`SELECT * FROM media WHERE media_type = ? ORDER BY id DESC`).all(filter) as Record<string, any>[];
    }
    

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

//Post Movie to local database
app.post('/api/movies', async (req: Request, res: Response): Promise<void> => {
  const { movie, actors } = req.body;
  
  if (!movie) {
    res.status(400).json({ success: false, message: 'Missing Movie Data' });
    return;
  }
  const insertMediaStmt = datab.prepare(`INSERT INTO media (media_type, title, year, poster) VALUES (?, ?, ?, ?)`);
  const insertMovieStmt = datab.prepare(`INSERT INTO movie (tmdb_id, media_id, backdrop, overview) VALUES (?, ?, ?, ?)`);

  const insertActorStmt = datab.prepare(`INSERT OR IGNORE INTO actor (id, name, profile_path) VALUES (?, ?, ?)`);
  const insertCharacterStmt = datab.prepare(`INSERT OR IGNORE INTO character (actor_id, media_id, actor_order, character) VALUES (?, ?, ?, ?)`);
  let id: any;
  try {
    const transaction = datab.transaction(() => {
    const info = insertMediaStmt.run(
      movie.media_type,
      movie.title,
      movie.year,
      movie.poster
    );
    const otherInfo = insertMovieStmt.run(
      movie.tmdb_id,
      info.lastInsertRowid,
      movie.backdrop,
      movie.overview
    );
    id = info.lastInsertRowid;
      for (const actor of actors) {
        insertActorStmt.run(actor.id, actor.name, actor.profile_path);
        insertCharacterStmt.run(actor.id, info.lastInsertRowid, actor.order, actor.character);
      }     
    });
    transaction();

    res.status(200).json({ success: true, id: id, message: 'Movie and actors added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed To Add Movie!' });
  }
});

//Delete Movie from local database
app.delete('/api/movies', async (req, res) => {
  const id = req.query.id;

  if(!id){
    return res.status(400).json({ error: 'Invalid movie ID' });
  }
  console.log("I made it here, " , id)
  try {
    const stmt = datab.prepare('DELETE FROM media WHERE id = ?');
    const result = stmt.run(id);
    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (err) {
    console.error('Failed to delete movie:', err);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

//Post TV Show to local database
app.post('/api/tv', async (req: Request, res: Response): Promise<void> => {
  const { tv, actors, seasons } = req.body;
  
  if (!tv) {
    res.status(400).json({ success: false, message: 'Missing Movie Data' });
    return;
  }
  const insertMediaStmt = datab.prepare(`INSERT INTO media (media_type, title, year, poster) VALUES (?, ?, ?, ?)`);
  const insertTVStmt = datab.prepare(`INSERT INTO tv (tmdb_id, media_id, backdrop, overview, num_season, num_episode) VALUES (?, ?, ?, ?, ?, ?)`);
  const insertSeasonStmt = datab.prepare(`INSERT INTO tv_season (tv_id, air_date, episode_count, name, overview, season_number, poster) VALUES (?, ?, ?, ?, ?, ?, ?)`)
  const insertActorStmt = datab.prepare(`INSERT OR IGNORE INTO actor (id, name, profile_path) VALUES (?, ?, ?)`);
  const insertCharacterStmt = datab.prepare(`INSERT OR IGNORE INTO character (actor_id, media_id, actor_order, character) VALUES (?, ?, ?, ?)`);
  let id: any;
  
  try {
    const transaction = datab.transaction(() => {
    const info = insertMediaStmt.run(
      tv.media_type,
      tv.title,
      tv.year,
      tv.poster
    );
    const tvInfo = insertTVStmt.run(
      tv.tmdb_id,
      info.lastInsertRowid,
      tv.backdrop,
      tv.overview,
      tv.num_season,
      tv.num_episode
    );
    for(const season of seasons){
      insertSeasonStmt.run(
      season.id,
      season.air_date,
      season.episode_count,
      season.name,
      season.overview,
      season.season_number,
      season.poster
    );
    }
    
    id = info.lastInsertRowid;
      for (const actor of actors) {
        insertActorStmt.run(actor.id, actor.name, actor.profile_path);
        insertCharacterStmt.run(actor.id, info.lastInsertRowid, actor.order, actor.character);
      }     
    });
    transaction();

    res.status(200).json({ success: true, id: id, message: 'Movie and actors added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed To Add Movie!' });
  }
});

//Delete TV Show from local database
app.delete('/api/tv', async (req, res) => {
  const id = req.query.id;

  if(!id){
    return res.status(400).json({ error: 'Invalid movie ID' });
  }

  try {
    const stmt = datab.prepare('DELETE FROM media WHERE id = ?');
    const result = stmt.run(id);
    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (err) {
    console.error('Failed to delete movie:', err);
    res.status(500).json({ error: 'Failed to delete movie' });
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

//Gets movie data for movie preview page
app.get('/api/preview-movie', async (req: Request, res: Response): Promise<void> => {
  const id = req.query.id as string;
  if (!id) {
    res.status(400).json({ error: 'Missing movie ID' });
    return;
  }

  try {
    // Try local DB
    const movie = datab.prepare(`
      SELECT 
        md.id,
        md.title,
        md.year,
        m.overview,
        md.poster,
        m.backdrop
      FROM movie m
      JOIN media md ON m.media_id = md.id
      WHERE m.media_id = ? OR m.tmdb_id = ?
    `).get(id,id) as Movie;

    if (movie) {
      const actors = datab.prepare(`
        SELECT 
          a.id, 
          a.name, 
          a.profile_path, 
          c.character, 
          c.actor_order
        FROM character c
        JOIN actor a ON c.actor_id = a.id
        WHERE c.media_id = ?
        ORDER BY c.actor_order ASC
      `).all(movie.id);

      res.json({
        source: "local",
        movie: {
          id: movie.id,
          title: movie.title,
          year: movie.year?.toString()?.substring(0, 4),
          overview: movie.overview,
          poster: movie.poster,
          backdrop: movie.backdrop,
          actors,
        },
      });
      return;
    }

    // Fallback to TMDb
    const tmdbRes = await searchMedia(id, 'movie');
    res.json({ source: "tmdb", movie: tmdbRes });

  } catch (err) {
    console.error("Preview fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch movie preview" });
  }
});

//Gets movie data for movie preview page
app.get('/api/preview-show', async (req: Request, res: Response): Promise<void> => {
  const id = req.query.id as string;
  if (!id) {
    res.status(400).json({ error: 'Missing movie ID' });
    return;
  }

  try {
    // Try local DB
    const show = datab.prepare(`
      SELECT 
        md.id,
        md.title,
        md.year,
        t.overview,
        md.poster,
        t.backdrop,
        t.num_season,
        t.num_episode,
        t.tmdb_id
      FROM tv t
      JOIN media md ON t.media_id = md.id
      WHERE t.media_id = ? OR t.tmdb_id = ?
    `).get(id,id) as Show;

    if (show) {
      const actors = datab.prepare(`
        SELECT 
          a.id, 
          a.name, 
          a.profile_path, 
          c.character, 
          c.actor_order
        FROM character c
        JOIN actor a ON c.actor_id = a.id
        WHERE c.media_id = ?
        ORDER BY c.actor_order ASC
      `).all(show.id);
      const seasons = datab.prepare(`
        SELECT * FROM tv_season WHERE tv_id = ?
      `).all(show.tmdb_id);
      console.log('did seaons do anything: ', seasons, 'ithe thing', show.id)

      res.json({
        source: "local",
        show: {
          id: show.id,
          title: show.title,
          year: show.year?.toString()?.substring(0, 4),
          overview: show.overview,
          poster: show.poster,
          backdrop: show.backdrop,
          num_season: show.num_season,
          num_episode: show.num_episode,
          actors,
          seasons,
        },
      });
      return;
    }

    // Fallback to TMDb
    const tmdbRes = await searchMedia(id, 'tv');
    res.json({ source: "tmdb", show: tmdbRes });

  } catch (err) {
    console.error("Preview fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch movie preview" });
  }
});

//Get reviews
app.get('/api/review', async (req: Request, res: Response): Promise<void> => {
  const id = req.query.media_id as string;

  if (!id) {
    res.status(400).json({ error: 'Missing movie ID' });
    return;
  }
  
  try {
    let results: any[] = [];
    const rows = datab.prepare('SELECT * FROM review WHERE media_id = ?').all(`${id}`);
    results = rows;
    res.json({ success: true, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Missing Reviews' });
  }


});

//Add review
app.post('/api/review', async (req: Request, res: Response): Promise<void> => {
  const { comment, media_id, profile_id, rating  } = req.body;
  
  if (!media_id) {
    res.status(400).json({ success: false, message: 'Missing MovieId' });
    return;
  }
  
  try {
    const stmt = datab.prepare(
      'INSERT INTO review (profile_id, media_id, rating, comment) VALUES (?, ?, ?, ?)'
    );
    
    const info = stmt.run(profile_id, media_id, rating, comment);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add review' });
  }
});

//Delete review
app.delete('/api/review/', async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ error: 'Invalid review ID' });
  }

  try {
    const stmt = datab.prepare('DELETE FROM review WHERE id = ?');
    const result = stmt.run(id);

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
  const { media_id, profile_id  } = req.body;
  if (!media_id) {
    res.status(400).json({ success: false, message: 'Missing Movie ID' });
    return;
  }
  
  try {
    const stmt = datab.prepare(
      'INSERT INTO watchlist (profile_id, media_id) VALUES (?, ?)'
    );
    const info = stmt.run(profile_id, media_id);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add to watchlist' });
  }
});

//Remove from watchlist
app.delete('/api/watchlist', async (req, res) => {
  const { media_id, profile_id  } = req.body;

  if (isNaN(media_id)) {
    return res.status(400).json({ error: 'Invalid watchlist ID' });
  }

  try {
    const stmt = datab.prepare('DELETE FROM watchlist WHERE media_id = ? AND profile_id = ?');
    const result = stmt.run(media_id, profile_id);

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
    const rows = await datab.prepare('SELECT * FROM watchlist WHERE media_id = ?').all(`${tmdb_id}`);
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

app.get('/api/preview-person', async (req, res) => {
  const person_id = req.query.id as string;
  if (!person_id) {
    return res.status(400).json({ success: false, message: 'Missing person ID' });
  }
  try {
    // console.log('Hello1 + ');
    let data: Person;
    data = await datab.prepare('SELECT * FROM actor WHERE id = ?').get(person_id) as Person;
    // const results = data
    //console.log('Hello1 + ', data);
    if(data == undefined){
      data = await personBio(person_id);
    }
    else if(!data.bio){
      const bioData = await personBio(person_id);
      data.bio = bioData.bio;
      data.birthday = bioData.birthday;
      data.place_of_birth = bioData.place_of_birth;
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch person' });
  }
  
});

app.get('/api/person-movies', async (req, res) => {
  const person_id = req.query.id as string; 
  type MovieRow = { tmdb_id: number };
  
  if (!person_id) {
    return res.status(400).json({ success: false, message: 'Missing person ID' });
  }
  
  try {
    const tmdbCredits = await personCredits(person_id);
    // const castData = await movie.json();
    // const results = data
    //console.log('This is what this is from', tmdbCredits);
    
    const localMovies = datab.prepare('SELECT m.tmdb_id, md.poster FROM movie m JOIN media md ON m.media_id = md.id;').all() as {
      tmdb_id: number;
      poster: string;
    }[];
    // console.log(localMovies)
    const localMovieMap = new Map(localMovies.map(m => [m.tmdb_id, m.poster]));
    // console.log(localMovieMap)

    const inLibrary = tmdbCredits
      .filter(credit => localMovieMap.has(credit.id))
      .map(credit => ({
        ...credit,
        poster_path: localMovieMap.get(credit.id) || null,
      }));
    //console.log(inLibrary)
    const notInLibrary = tmdbCredits.filter(credit => !localMovieMap.has(credit.id));

    return res.json({
      success: true,
      inLibrary,
      notInLibrary
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch person' });
  }
  
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
