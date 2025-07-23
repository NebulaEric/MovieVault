// backend/tmdb.ts
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.TMDB_API_KEY; // Load from .env in production
const BASE_URL = 'https://api.themoviedb.org/3';
// export async function downloadPoster(imagePath: string, movieId: number, isPoster: boolean): Promise<string> {
//   const baseUrl = 'https://image.tmdb.org/t/p/w500';
//   const url = `${baseUrl}${imagePath}`;
//   const posterDir = path.join(process.cwd(), 'public', 'posters');
//   let filePath: string;
//   if (!fs.existsSync(posterDir)) {
//     fs.mkdirSync(posterDir, { recursive: true });
//   }
//   console.log("below the issue?2")
//   if(isPoster){
//     filePath = path.join(posterDir, `${movieId}.jpg`);
//   }
//   else{
//     filePath = path.join(posterDir, `${movieId}1.jpg`);
//   }
//   //const filePath = path.join(posterDir, `${movieId}.jpg`);
//   console.log("below the issue?3")
//   const writer = fs.createWriteStream(filePath);
//   console.log("below the issue?4")
//   const response = await axios({
//     url,
//     method: 'GET',
//     responseType: 'stream',
//   });
//   response.data.pipe(writer);
//   return new Promise((resolve, reject) => {
//     if(isPoster){
//       writer.on('finish', () => resolve(`/posters/${movieId}.jpg`));
//     }
//     else{
//       writer.on('finish', () => resolve(`/posters/${movieId}1.jpg`));
//     }
//     // writer.on('finish', () => resolve(`/posters/${movieId}.jpg`));
//     writer.on('error', reject);
//   });
// }
export async function downloadMovieImages(posterPath, backdropPath, movieId) {
    const basePosterUrl = 'https://image.tmdb.org/t/p/w500';
    const baseBackdropUrl = 'https://image.tmdb.org/t/p/w1280'; // Higher quality for backdrops
    const posterDir = path.join(process.cwd(), 'public', 'posters');
    if (!fs.existsSync(posterDir)) {
        fs.mkdirSync(posterDir, { recursive: true });
    }
    // Helper function to download a single image
    const downloadImage = async (url, fileName) => {
        const filePath = path.join(posterDir, fileName);
        const writer = fs.createWriteStream(filePath);
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
        });
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(`/posters/${fileName}`));
            writer.on('error', reject);
        });
    };
    // Download poster and backdrop in parallel
    const [poster, backdrop] = await Promise.all([
        downloadImage(`${basePosterUrl}${posterPath}`, `${movieId}.jpg`),
        downloadImage(`${baseBackdropUrl}${backdropPath}`, `${movieId}-backdrop.jpg`),
    ]);
    return { poster, backdrop };
}
export async function searchMovie(id) {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
        headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }
    });
    console.log(response);
    const movie = response.data; //.results[0]
    if (!movie) {
        throw new Error('Movie not found');
    }
    // const yesPoster = true;
    // console.log("below the issue?")
    // const localPosterPath = await downloadPoster(movie.poster_path, movie.id, yesPoster);
    // console.log("i make it past the issue?")
    // const localBackdropPath = await downloadPoster(movie.backdrop_path, movie.id, !yesPoster);
    const { poster, backdrop } = await downloadMovieImages(movie.poster_path, movie.backdrop_path, movie.id);
    return {
        title: movie.title,
        overview: movie.overview,
        poster: poster,
        backdrop: backdrop,
        id: movie.id,
        release_date: movie.release_date,
    };
}
export async function searchMovieSuggestions(query) {
    const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
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
