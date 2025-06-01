// db.ts
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
// import { open } from 'sqlite';

// Ensure 'data' directory exists
const dbPath = path.resolve(__dirname, '../data');
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath);
}

// Create or open the database
const db = new sqlite3.Database(path.join(dbPath, 'movies.db'), (err) => {
  if (err) console.error('Error opening database:', err.message);
  else console.log('✅ Connected to SQLite database.');
});

export const datab = new sqlite3.Database('./movies.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      year INTEGER NOT NULL
    )
  `);
});
