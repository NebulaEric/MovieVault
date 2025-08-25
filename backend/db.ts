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

const dbPath = path.resolve(__dirname, '../data/movievault.db');
export const datab: InstanceType<typeof Database> = new Database(dbPath);

// Create table (runs once)

datab.exec(`
  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_type TEXT,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    poster TEXT
  );

  CREATE TABLE IF NOT EXISTS movie (
    tmdb_id INTEGER PRIMARY KEY,
    media_id INTEGER,
    backdrop TEXT,
    overview TEXT,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tv (
    tmdb_id INTEGER PRIMARY KEY,
    media_id INTEGER,
    backdrop TEXT,
    overview TEXT,
    num_season NUMBER,
    num_episode NUMBER,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tv_season (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tv_id INTEGER,
    air_date TEXT,
    episode_count TEXT,
    name TEXT,
    overview TEXT,
    season_number INTEGER,
    poster TEXT,
    FOREIGN KEY (tv_id) REFERENCES tv(tmdb_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS book (
    open_library_id INTEGER PRIMARY KEY,
    media_id INTEGER,
    author TEXT,
    overview TEXT,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS game (
    igdb_id INTEGER PRIMARY KEY,
    media_id INTEGER,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS character (
    actor_id INTEGER,
    media_id INTEGER,
    actor_order INTEGER,
    character TEXT,
    FOREIGN KEY (actor_id) REFERENCES actor(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
  
  );

  CREATE TABLE IF NOT EXISTS actor (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    bio TEXT,
    bithday TEXT,
    place_of_birth TEXT,
    profile_path TEXT
  );

  CREATE TABLE IF NOT EXISTS media_genre (
    genre_id INTEGER,
    media_id INTEGER,
    FOREIGN KEY (genre_id) REFERENCES genre(id),
    FOREIGN KEY (media_id) REFERENCES media(id)
  );

  CREATE TABLE IF NOT EXISTS genre (
    id INTEGER PRIMARY KEY,
    genre_name TEXT
  );

  CREATE TABLE IF NOT EXISTS review (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER,
    media_id INTEGER,
    rating INTEGER,
    comment TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE  
  );

  CREATE TABLE IF NOT EXISTS watchlist (
    profile_id INTEGER,
    media_id INTEGER,
    FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE    
  );

  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT,
    UNIQUE (username)
  );

`);

//datab.prepare('DELETE FROM media WHERE id IS 1').run();
//datab.prepare('DROP TABLE tv_season').run();
//datab.prepare('INSERT INTO media (media_type, title, year, poster) VALUES (?, ?, ?, ?)').run('Movie','Holes',2003,'/posters/8326.jpg');
const existingProfiles = datab.prepare('SELECT COUNT(*) as count FROM profile').get() as { count: number };
if (existingProfiles.count === 0) {
  datab.prepare('INSERT INTO profile (username) VALUES (?)').run('Test User');
  console.log('👤 Inserted mock profile: "Test User"');
}