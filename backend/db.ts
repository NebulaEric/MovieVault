// // db.ts
// import sqlite3 from 'sqlite3';
// import path from 'path';
// import fs from 'fs';
// // import { open } from 'sqlite';

// // Ensure 'data' directory exists
// const dataDir = path.resolve(__dirname, '../data');
// if (!fs.existsSync(dataDir)) {
//   fs.mkdirSync(dataDir);
// }

// const dbPath = path.resolve(__dirname, '../data/movies.db');
// // Create or open the database
// export const datab = new sqlite3.Database(dbPath, (err) => {
//   if (err) {
//     console.error('Error opening database', err.message);
//   } else {
//     console.log('✅ Connected to SQLite database.');

//     datab.run(`
//       CREATE TABLE IF NOT EXISTS movies (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         title TEXT NOT NULL,
//         year INTEGER NOT NULL,
//         poster TEXT,
//         overview TEXT
//       )
//       `,
//       (err) => {
//         if (err) {
//           console.error('❌ Error creating movies table', err.message);
//         } else {
//           console.log('📁 Movies table is ready.');
//         }
//       });
//       console.log('After table making');
//   }
// });

// datab.serialize(() => {
//   datab.run(`
//     CREATE TABLE IF NOT EXISTS movies (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       title TEXT NOT NULL,
//       year INTEGER NOT NULL
//     )
//   `);
// });


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
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    poster TEXT,
    overview TEXT
  )
`);