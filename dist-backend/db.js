import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}
const dbPath = path.resolve(__dirname, '../data/movies.db');
export const datab = new Database(dbPath);
// Create table (runs once)
datab.exec(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tmdb_id INTEGER UNIQUE,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    poster TEXT,
    backdrop TEXT,
    overview TEXT,
    UNIQUE (tmdb_id)
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    avatar TEXT
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    profile_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 0 AND rating <= 10),
    comment TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tmdb_id INTEGER NOT NULL,
    media_type TEXT,
    media_id INTEGER,
    title TEXT NOT NULL,
    year INTEGER,
    poster TEXT,
    UNIQUE (media_type, media_id)
  );
  
  CREATE TABLE IF NOT EXISTS actors (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    bio TEXT,
    bithday TEXT,
    place_of_birth TEXT,
    profile_path TEXT
  );

  CREATE TABLE IF NOT EXISTS movie_actor (
    movie_id INTEGER,
    actor_id INTEGER,
    character TEXT,
    actor_order INTEGER,
    PRIMARY KEY (movie_id, actor_id),
    FOREIGN KEY (movie_id) REFERENCES movies(tmdb_id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES actors(id)
  );

`);
//datab.prepare('DELETE FROM actors WHERE profile_path IS NULL').run();
// datab.prepare('DROP TABLE movie_actor').run();
const existingProfiles = datab.prepare('SELECT COUNT(*) as count FROM profiles').get();
if (existingProfiles.count === 0) {
    datab.prepare('INSERT INTO profiles (name) VALUES (?)').run('Test User');
    console.log('👤 Inserted mock profile: "Test User"');
}
