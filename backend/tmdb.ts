// backend/tmdb.ts
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import debounce from 'lodash.debounce';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.TMDB_API_KEY; // Load from .env in production
const BASE_URL = 'https://api.themoviedb.org/3';

interface MovieResult {
  title: string;
  overview: string;
  poster_path: string;
  id: number;
}

interface MovieResponse {
  title: string;
  overview: string;
  poster: string;
  id: number;
}

export interface MovieSuggestion {
  id: number;
  title: string;
  year: string;
}

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
export async function downloadPoster(imagePath: string, movieId: number): Promise<string> {
  const baseUrl = 'https://image.tmdb.org/t/p/w500';
  const url = `${baseUrl}${imagePath}`;
  const posterDir = path.join(process.cwd(), 'public', 'posters');

  if (!fs.existsSync(posterDir)) {
    fs.mkdirSync(posterDir, { recursive: true });
  }

  const filePath = path.join(posterDir, `${movieId}.jpg`);
  const writer = fs.createWriteStream(filePath);

  const response = await axios({
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
export async function searchMovie(query: string): Promise<MovieResponse> {
  
  const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
    },
    params: {
      query,
    },
  });

  const movie: MovieResult = response.data.results[0];
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

  // Take top 5, and extract only id, title, and year
  return results.slice(0, 5).map(movie => ({
    id: movie.id,
    title: movie.title,
    year: movie.release_date ? movie.release_date.split('-')[0] : 'Unknown',
  }));
}