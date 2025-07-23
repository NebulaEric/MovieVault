import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
//download both backdrop and poster
export async function downloadMovieImages(posterPath, backdropPath, movieId) {
    const basePosterUrl = 'https://image.tmdb.org/t/p/w500';
    const baseBackdropUrl = 'https://image.tmdb.org/t/p/w1280';
    const posterDir = path.join(process.cwd(), 'public', 'posters');
    if (!fs.existsSync(posterDir)) {
        fs.mkdirSync(posterDir, { recursive: true });
    }
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
    const [poster, backdrop] = await Promise.all([
        downloadImage(`${basePosterUrl}${posterPath}`, `${movieId}.jpg`),
        downloadImage(`${baseBackdropUrl}${backdropPath}`, `${movieId}-backdrop.jpg`),
    ]);
    return { poster, backdrop };
}
//get information for movie from tmdb
export async function searchMovie(id) {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
        headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }
    });
    const movie = response.data;
    if (!movie) {
        throw new Error('Movie not found');
    }
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
//getting the top 5 movies from a search query
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
    return results.slice(0, 5).map(movie => ({
        id: movie.id,
        title: movie.title,
        year: movie.release_date ? movie.release_date.split('-')[0] : 'Unknown',
    }));
}
