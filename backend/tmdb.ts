import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

interface MovieResult {
  title: string;
  overview: string;
  poster_path: string;
  id: number;
  release_date: string;
  backdrop_path: string;
}

interface MovieResponse {
  title: string;
  overview: string;
  poster: string;
  id: number;
  release_date: string;
  backdrop: string;
}

export interface MovieSuggestion {
  id: number;
  title: string;
  year: string;
}

//download both backdrop and poster
export async function downloadMovieImages(posterPath: string, backdropPath: string, movieId: number): Promise<{ poster: string; backdrop: string }> {
  const basePosterUrl = 'https://image.tmdb.org/t/p/w500';
  const baseBackdropUrl = 'https://image.tmdb.org/t/p/w1280';
  const posterDir = path.join(process.cwd(), 'public', 'posters');

  if (!fs.existsSync(posterDir)) {
    fs.mkdirSync(posterDir, { recursive: true });
  }

  const downloadImage = async (url: string, fileName: string): Promise<string> => {
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
export async function searchMovie(id: string): Promise<MovieResponse> {
  
  const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }
  });

  const movie: MovieResult = response.data;
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
export async function searchMovieSuggestions(query: string): Promise<MovieSuggestion[]> {
  const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
    },
    params: {
      query,
    },
  });

  const results = response.data.results as any[];
  return results.slice(0, 5).map(movie => ({
    id: movie.id,
    title: movie.title,
    year: movie.release_date ? movie.release_date.split('-')[0] : 'Unknown',
  }));
}