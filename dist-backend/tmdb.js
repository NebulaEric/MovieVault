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
export async function downloadMediaActors(mediaId, mediaType) {
    // Determine the correct TMDb endpoint
    const endpoint = mediaType === 'movie'
        ? `https://api.themoviedb.org/3/movie/${mediaId}/credits`
        : `https://api.themoviedb.org/3/tv/${mediaId}/credits`;
    const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }
    });
    const cast = response.data.cast;
    if (!Array.isArray(cast)) {
        throw new Error('Invalid cast data');
    }
    // Filter popular or main cast
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
            character: actor.character || actor.roles?.[0]?.character || '', // TV shows may have "roles" array
            order: actor.order ?? 0,
            profile_path: localPath
        };
    }));
    return actorResults;
}
//get information for movie from tmdb
export async function searchMedia(id, media_type) {
    const basePosterUrl = 'https://image.tmdb.org/t/p/w500';
    const baseBackdropUrl = 'https://image.tmdb.org/t/p/w1280';
    let mediaData;
    // Fetch data based on media type
    if (media_type === 'movie') {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
            headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
        });
        mediaData = response.data;
    }
    else if (media_type === 'tv') {
        const response = await axios.get(`https://api.themoviedb.org/3/tv/${id}`, {
            headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
        });
        mediaData = response.data;
    }
    else {
        throw new Error('Unsupported media type');
    }
    if (!mediaData) {
        throw new Error(`${media_type === 'movie' ? 'Movie' : 'TV show'} not found`);
    }
    // Download images (poster + backdrop)
    const [poster, backdrop] = await Promise.all([
        mediaData.poster_path
            ? downloadImage(`${basePosterUrl}${mediaData.poster_path}`, `${mediaData.id}.jpg`, 'posters')
            : null,
        mediaData.backdrop_path
            ? downloadImage(`${baseBackdropUrl}${mediaData.backdrop_path}`, `${mediaData.id}-backdrop.jpg`, 'posters')
            : null,
    ]);
    // Download actors
    const actors = await downloadMediaActors(mediaData.id, media_type); // maybe rename to downloadMediaActors if reused for TV
    return {
        id: mediaData.id,
        title: mediaData.title || mediaData.original_name,
        overview: mediaData.overview,
        poster: poster,
        backdrop: backdrop,
        release_date: mediaData.release_date || mediaData.first_air_date,
        media_type: media_type,
        actors: actors,
        ...(media_type === 'tv'
            ? {
                number_of_seasons: mediaData.number_of_seasons,
                number_of_episodes: mediaData.number_of_episodes,
                seasons: mediaData.seasons?.map((s) => ({
                    air_date: s.air_date,
                    episode_count: s.episode_count,
                    id: s.id,
                    name: s.name,
                    overview: s.overview,
                    poster: s.poster_path ?? null,
                    season_number: s.season_number,
                    vote_average: s.vote_average,
                })),
            }
            : {}),
    };
}
//getting the top 5 movies from a search query
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
export async function personCredits(query) {
    const response = await axios.get(`https://api.themoviedb.org/3/person/${query}/combined_credits`, {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        },
    });
    const results = response.data.cast;
    const selfRegex = /\bself\b/i;
    const filtered = results
        .filter((credit) => (credit.popularity > 1.0 || credit.order < 15) && credit.character && !selfRegex.test(credit.character || ''))
        .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).sort((a, b) => {
        const dateA = a.release_date || a.first_air_date || '';
        const dateB = b.release_date || b.first_air_date || '';
        return (dateB.slice(0, 4) || 0) - (dateA.slice(0, 4) || 0);
    });
    const creditResults = await Promise.all(filtered.map(async (credit) => {
        return {
            id: credit.id,
            title: credit.title || credit.name,
            character: credit.character || '',
            release_date: credit.release_date || credit.first_air_date,
            media_type: credit.media_type,
        };
    }));
    // console.log('THIS IS THAT ONE: ', creditResults)
    return creditResults;
}
export async function personBio(query) {
    const response = await axios.get(`https://api.themoviedb.org/3/person/${query}`, {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        },
    });
    // console.log(response.data);
    let localPath = null;
    const imageUrl = `https://image.tmdb.org/t/p/w500${response.data.profile_path}`;
    localPath = await downloadImage(imageUrl, `actor_${response.data.id}.jpg`, 'actors');
    return {
        name: response.data.name,
        id: response.data.id,
        bio: response.data.biography,
        birthday: response.data.birthday,
        place_of_birth: response.data.place_of_birth,
        profile_path: localPath,
    };
}
