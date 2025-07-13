"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const tmdb_1 = require("./tmdb");
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/posters', express_1.default.static(path_1.default.join(process.cwd(), 'public', 'posters')));
// Add a movie
// app.post('/api/movies', (req: Request, res: Response) => {
//   const { title, year } = req.body;
//   if (!title || !year) {
//     res.status(400).json({ success: false, message: 'Missing title or year' });
//     return;
//   }
//   const stmt = datab.prepare('INSERT INTO movies (title, year) VALUES (?, ?)');
//   stmt.run(title, year, function (this: sqlite3.RunResult, err: Error | null) {
//   if (err) {
//     console.error(err.message);
//     return res.status(500).json({ success: false });
//   }
//    return res.json({ success: true, id: this.lastID });
// });
// });
app.post('/api/movies', async (req, res) => {
    const { title, year } = req.body;
    if (!title || !year) {
        res.status(400).json({ success: false, message: 'Missing title or year' });
        return;
    }
    try {
        // Search TMDb
        // const results = await searchMovie(title);
        // const movie = results[0]; // First match
        const movie = await (0, tmdb_1.searchMovie)(title);
        // const posterPath = movie?.poster_path || '';
        // const overview = movie?.overview || '';
        const stmt = db_1.datab.prepare('INSERT INTO movies (title, year, poster, overview) VALUES (?, ?, ?, ?)');
        stmt.run(movie.title, year, movie.poster, movie.overview, function (err) {
            if (err) {
                console.error(err.message);
                res.status(500).json({ success: false });
            }
            else {
                res.json({ success: true, id: this.lastID });
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'TMDb lookup failed' });
    }
});
// Get all movies
// app.get('/api/movies', (req, res) => {
//   datab.all('SELECT * FROM movies', [], (err, rows) => {
//     if (err) {
//       console.error(err.message);
//       return res.status(500).json({ success: false });
//     }
//     res.json({ success: true, data: rows });
//   });
// });
app.get('/api/movies', (req, res) => {
    try {
        const rows = db_1.datab.prepare('SELECT * FROM movies').all();
        res.json({ success: true, data: rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
app.get('/api/tmdb/search', async (req, res) => {
    const title = req.query.title;
    if (!title || typeof title !== 'string') {
        res.status(400).json({ error: 'Missing or invalid title' });
        return;
    }
    try {
        const results = await (0, tmdb_1.searchMovie)(title);
        res.json({ success: true, results });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'TMDb API failed' });
    }
});
// app.get('/api/search-movies', async (req: Request, res: Response): Promise<void> => {
//   const query = req.query.q as string;
//   const source = req.query.source as 'tmdb' | 'local';
//   if (!query) {
//     res.status(400).json({ results: [] });
//     return;
//   }
//   try {
//     let results: any[] = [];
//     if (source === 'tmdb') {
//       const response = await searchMovie(query);
//       const data = response.results;
//       results = data.slice(0, 5);
//     } else {
//       const rows = datab.prepare('SELECT * FROM movies WHERE title LIKE ?').all(`%${query}%`);
//       results = rows;
//     }
//     res.json({ results });
//   } catch (err) {
//     console.error('API search failed:', err);
//     res.status(500).json({ results: [] }); // ✅ Always respond with valid JSON
//   }
// });
app.get('/api/search-movies', async (req, res) => {
    const query = req.query.q;
    const source = req.query.source;
    if (!query) {
        res.status(400).json({ results: [] });
        return;
    }
    try {
        let results = [];
        if (source === 'tmdb') {
            results = await (0, tmdb_1.searchMovieSuggestions)(query); // ✅ new function here
        }
        else {
            const rows = db_1.datab.prepare('SELECT * FROM movies WHERE title LIKE ?').all(`%${query}%`);
            results = rows;
        }
        res.json({ results });
    }
    catch (err) {
        console.error('API search failed:', err);
        res.status(500).json({ results: [] });
    }
});
app.get('/api/preview-movie', async (req, res) => {
    const id = req.query.id;
    if (!id) {
        res.status(400).json({ error: 'Missing movie ID' });
        return;
    }
    try {
        const response = await axios_1.default.get(`https://api.themoviedb.org/3/movie/${id}`, {
            headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }
        });
        const movie = response.data;
        console.log(movie);
        const localPosterPath = await (0, tmdb_1.downloadPoster)(movie.poster_path, movie.id);
        res.json({
            id: movie.id,
            title: movie.title,
            year: movie.release_date?.substring(0, 4),
            overview: movie.overview,
            poster: localPosterPath,
        });
    }
    catch (err) {
        console.error('TMDb movie fetch failed:', err);
        res.status(500).json({ error: 'Failed to fetch movie preview' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
