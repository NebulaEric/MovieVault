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
export const datab = new sqlite3.Database('./movies.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('✅ Connected to SQLite database.');

    datab.run(`
      CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        year INTEGER NOT NULL
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating movies table', err.message);
      } else {
        console.log('📁 Movies table is ready.');
      }
    });
  }
});

// datab.serialize(() => {
//   datab.run(`
//     CREATE TABLE IF NOT EXISTS movies (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       title TEXT NOT NULL,
//       year INTEGER NOT NULL
//     )
//   `);
// });
