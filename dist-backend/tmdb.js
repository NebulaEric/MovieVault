import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
const downloadImage = async (url, fileName, subdirectory) => {
    const imageDir = path.join(process.cwd(), 'public', subdirectory);
    if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
    }
    const filePath = path.join(imageDir, fileName);
    const writer = fs.createWriteStream(filePath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(`/${subdirectory}/${fileName}`));
        writer.on('error', reject);
    });
};
export async function downloadMovieActors(movieId) {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
        headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }
    });
    const cast = response.data.cast;
    if (!Array.isArray(cast)) {
        throw new Error('Invalid cast data');
    }
    const filtered = cast.filter((actor) => actor.popularity > 1.0 || actor.order < 6);
    const actorResults = await Promise.all(filtered.map(async (actor) => {
        let localPath = null;
        if (actor.profile_path) {
            const imageUrl = `https://image.tmdb.org/t/p/w500${actor.profile_path}`;
            try {
                localPath = await downloadImage(imageUrl, `actor_${actor.id}.jpg`, 'actors');
            }
            catch (err) {
                console.warn(`Failed to download image for actor ${actor.name}:`, err);
            }
        }
        return {
            id: actor.id,
            name: actor.name,
            character: actor.character,
            order: actor.order,
            profile_path: localPath
        };
    }));
    return actorResults;
}
//get information for movie from tmdb
//Should probably be called previewMovie
export async function searchMovie(id) {
    const basePosterUrl = 'https://image.tmdb.org/t/p/w500';
    const baseBackdropUrl = 'https://image.tmdb.org/t/p/w1280';
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
        headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }
    });
    const movie = response.data;
    if (!movie) {
        throw new Error('Movie not found');
    }
    // console.log("This is the movie information: ", movie);
    // console.log("Movie Credits: ", credits)
    //const { poster, backdrop } = await downloadMovieImages(movie.poster_path, movie.backdrop_path, movie.id);
    const [poster, backdrop] = await Promise.all([
        downloadImage(`${basePosterUrl}${movie.poster_path}`, `${movie.id}.jpg`, 'posters'),
        downloadImage(`${baseBackdropUrl}${movie.backdrop_path}`, `${movie.id}-backdrop.jpg`, 'posters'),
    ]);
    const actors = await downloadMovieActors(movie.id);
    // console.log("Movie Credits: ", actors)
    return {
        title: movie.title,
        overview: movie.overview,
        poster: poster,
        backdrop: backdrop,
        id: movie.id,
        release_date: movie.release_date,
        actors: actors,
    };
}
//getting the top 5 movies from a search query
// export async function tmdbSuggestions(query: string): Promise<MovieSuggestion[]> {
//   const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
//     headers: {
//       Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
//     },
//     params: {
//       query,
//     },
//   });
//   const results = response.data.results as any[];
//   return results.slice(0, 5).map(movie => ({
//     id: movie.id,
//     title: movie.title,
//     year: movie.release_date ? movie.release_date.split('-')[0] : 'Unknown',
//   }));
// }
export async function tmdbSuggestions(query) {
    const response = await axios.get('https://api.themoviedb.org/3/search/multi', {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        },
        params: {
            query,
        },
    });
    const results = response.data.results;
    return results
        .filter(item => ['movie', 'tv', 'person'].includes(item.media_type)) // filter out unsupported types like "collection"
        .slice(0, 5)
        .map(item => {
        const title = item.title || item.name || 'Unknown';
        const year = item.release_date?.split('-')[0] ||
            item.first_air_date?.split('-')[0] ||
            'Unknown';
        return {
            id: item.id,
            media_type: item.media_type,
            title,
            year,
        };
    });
}
