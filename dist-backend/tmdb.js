"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadPoster = downloadPoster;
exports.searchMovie = searchMovie;
exports.searchMovieSuggestions = searchMovieSuggestions;
// backend/tmdb.ts
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const API_KEY = process.env.TMDB_API_KEY; // Load from .env in production
const BASE_URL = 'https://api.themoviedb.org/3';
// async function downloadPoster(posterPath: string) {
//   const baseUrl = 'https://image.tmdb.org/t/p/w500';
//   const url = `${baseUrl}${posterPath}`;
//   const fileName = posterPath.replace('/', ''); // remove leading slash
//   const filePath = path.resolve(__dirname, 'public/posters', fileName);
//   const writer = fs.createWriteStream(filePath);
//   const response = await axios({
//     url,
//     method: 'GET',
//     responseType: 'stream',
//   });
//   response.data.pipe(writer);
//   return new Promise((resolve, reject) => {
//     writer.on('finish', () => resolve(fileName));
//     writer.on('error', reject);
//   });
// }
async function downloadPoster(imagePath, movieId) {
    const baseUrl = 'https://image.tmdb.org/t/p/w500';
    const url = `${baseUrl}${imagePath}`;
    const posterDir = path_1.default.join(process.cwd(), 'public', 'posters');
    if (!fs_1.default.existsSync(posterDir)) {
        fs_1.default.mkdirSync(posterDir, { recursive: true });
    }
    const filePath = path_1.default.join(posterDir, `${movieId}.jpg`);
    const writer = fs_1.default.createWriteStream(filePath);
    const response = await (0, axios_1.default)({
        url,
        method: 'GET',
        responseType: 'stream',
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(`/posters/${movieId}.jpg`));
        writer.on('error', reject);
    });
}
// export async function searchMovie(title: string) {
//   try {
//     console.log("API KEY 2: ", API_KEY);
//     const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
//       headers: {
//         Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`
//       },
//       params: {
//         //api_key: API_KEY,
//         query: title
//       }
//     });
//     return response.data.results;
//   } catch (err) {
//     console.error('TMDb search error:', err);
//     throw err;
//   }
// }
async function searchMovie(query) {
    const response = await axios_1.default.get('https://api.themoviedb.org/3/search/movie', {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        },
        params: {
            query,
        },
    });
    const movie = response.data.results[0];
    if (!movie) {
        throw new Error('Movie not found');
    }
    const localPosterPath = await downloadPoster(movie.poster_path, movie.id);
    return {
        title: movie.title,
        overview: movie.overview,
        poster: localPosterPath,
        id: movie.id,
    };
}
async function searchMovieSuggestions(query) {
    const response = await axios_1.default.get('https://api.themoviedb.org/3/search/movie', {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        },
        params: {
            query,
        },
    });
    const results = response.data.results;
    // Take top 5, and extract only id, title, and year
    return results.slice(0, 5).map(movie => ({
        id: movie.id,
        title: movie.title,
        year: movie.release_date ? movie.release_date.split('-')[0] : 'Unknown',
    }));
}
