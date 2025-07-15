// db.ts
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbPath = path.resolve(__dirname, '../data/movies.db');
// const databInstance = new Database(dbPath);
export const datab: InstanceType<typeof Database> = new Database(dbPath);

// Create table (runs once)
datab.exec(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tmdb_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    poster TEXT,
    overview TEXT
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
`);

const existingProfiles = datab.prepare('SELECT COUNT(*) as count FROM profiles').get() as { count: number };
if (existingProfiles.count === 0) {
  datab.prepare('INSERT INTO profiles (name) VALUES (?)').run('Test User');
  console.log('👤 Inserted mock profile: "Test User"');
}