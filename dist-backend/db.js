"use strict";
// // db.ts
// import sqlite3 from 'sqlite3';
// import path from 'path';
// import fs from 'fs';
// // import { open } from 'sqlite';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.datab = void 0;
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
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dataDir = path_1.default.resolve(__dirname, '../data');
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir);
}
const dbPath = path_1.default.resolve(__dirname, '../data/movies.db');
// const databInstance = new Database(dbPath);
exports.datab = new better_sqlite3_1.default(dbPath);
// Create table (runs once)
exports.datab.exec(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    poster TEXT,
    overview TEXT
  )
`);
