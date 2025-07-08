// backend/server.ts
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { datab } from './db';
import sqlite3 from 'sqlite3';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Add a movie
app.post('/api/movies', (req: Request, res: Response) => {
  const { title, year } = req.body;

  if (!title || !year) {
    res.status(400).json({ success: false, message: 'Missing title or year' });
    return;
  }

  const stmt = datab.prepare('INSERT INTO movies (title, year) VALUES (?, ?)');
  stmt.run(title, year, function (this: sqlite3.RunResult, err: Error | null) {
  if (err) {
    console.error(err.message);
    return res.status(500).json({ success: false });
    
  }
   return res.json({ success: true, id: this.lastID });
   
});
});

// Get all movies
app.get('/api/movies', (req, res) => {
  datab.all('SELECT * FROM movies', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, data: rows });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
