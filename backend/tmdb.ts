import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { profile } from 'console';
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
  poster: string | null;
  id: number;
  release_date: string;
  backdrop: string | null;
  actors: any[];
}

export interface MediaSuggestion {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title: string;
  year: string;
}

interface Actor {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface Credit {
  id: number;
  title: string;
  character: string;
  media_type: string;
  release_date: string;
}

  const downloadImage = async (url: string, fileName: string, subdirectory: 'posters' | 'actors'): Promise<string> => {
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


export async function downloadMovieActors(movieId: number): Promise<Actor[]> {
  const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }
  });

  const cast = response.data.cast;

  if (!Array.isArray(cast)) {
    throw new Error('Invalid cast data');
  }

  const filtered = cast.filter((actor: any) => actor.popularity > 1.0 || actor.order < 6);

  const actorResults: Actor[] = await Promise.all(
    filtered.map(async (actor: any) => {
      let localPath: string | null = null;

      if (actor.profile_path) {
        const imageUrl = `https://image.tmdb.org/t/p/w500${actor.profile_path}`;
        try {
          localPath = await downloadImage(imageUrl, `actor_${actor.id}.jpg`, 'actors');
        } catch (err) {
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
    })
  );

  return actorResults;
}

//get information for movie from tmdb
//Should probably be called previewMovie
export async function searchMovie(id: string): Promise<MovieResponse> {
  const basePosterUrl = 'https://image.tmdb.org/t/p/w500';
  const baseBackdropUrl = 'https://image.tmdb.org/t/p/w1280';

  const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }
  });
  const movie: MovieResult = response.data;
  

  if (!movie) {
    throw new Error('Movie not found');
  }

  // console.log("This is the movie information: ", movie);
  // console.log("Movie Credits: ", credits)
  //const { poster, backdrop } = await downloadMovieImages(movie.poster_path, movie.backdrop_path, movie.id);
  if(movie.poster_path && movie.backdrop_path){

  }
  // const [poster, backdrop] = await Promise.all([
  //   downloadImage(`${basePosterUrl}${movie.poster_path}`, `${movie.id}.jpg`, 'posters'),
  //   downloadImage(`${baseBackdropUrl}${movie.backdrop_path}`, `${movie.id}-backdrop.jpg`, 'posters'),
  // ]);
  const [poster, backdrop] = await Promise.all([
  movie.poster_path
    ? downloadImage(`${basePosterUrl}${movie.poster_path}`, `${movie.id}.jpg`, 'posters')
    : null,
  movie.backdrop_path
    ? downloadImage(`${baseBackdropUrl}${movie.backdrop_path}`, `${movie.id}-backdrop.jpg`, 'posters')
    : null,
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
export async function tmdbSuggestions(query: string): Promise<MediaSuggestion[]> {
  const response = await axios.get('https://api.themoviedb.org/3/search/multi', {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
    },
    params: {
      query,
    },
  });

  const results = response.data.results as any[];

  return results
    .filter(item => ['movie', 'tv', 'person'].includes(item.media_type)) // filter out unsupported types like "collection"
    .slice(0, 5)
    .map(item => {
      const title = item.title || item.name || 'Unknown';
      const year =
        item.release_date?.split('-')[0] ||
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

export async function personCredits(query: string) {
  const response = await axios.get(`https://api.themoviedb.org/3/person/${query}/combined_credits`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
    },
    // params: {
    //   query,
    // },
  });

  const results = response.data.cast as any[];
  const selfRegex = /\bself\b/i;
  const filtered = results
      .filter((credit: any) => (credit.popularity > 1.0 || credit.order < 15) && credit.character && !selfRegex.test(credit.character || ''))
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).sort((a, b) => {
    const dateA = a.release_date || a.first_air_date || '';
    const dateB = b.release_date || b.first_air_date || '';
    return (dateB.slice(0, 4) || 0) - (dateA.slice(0, 4) || 0);
  });
  const creditResults: Credit[] = await Promise.all(
    filtered.map(async (credit: any) => {
      return {
        id: credit.id,
        title: credit.title || credit.name,
        character: credit.character || '',
        release_date: credit.release_date || credit.first_air_date,
        media_type: credit.media_type,
      };
    })
  );
  // console.log('THIS IS THAT ONE: ', creditResults)
  return creditResults;
}

export async function personBio(query: string){
  const response = await axios.get(`https://api.themoviedb.org/3/person/${query}`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
    },
  });
  // console.log(response.data);
  let localPath: string | null = null;
  const imageUrl = `https://image.tmdb.org/t/p/w500${response.data.profile_path}`;
  localPath = await downloadImage(imageUrl, `actor_${response.data.id}.jpg`, 'actors');
  return{
    name: response.data.name,
    id: response.data.id,
    bio: response.data.biography,
    birthday: response.data.birthday,
    place_of_birth: response.data.place_of_birth,
    profile_path: localPath,
  }
}

  // const filtered = cast.filter((actor: any) => actor.popularity > 1.0 || actor.order < 6);

  // const actorResults: Actor[] = await Promise.all(
  //   filtered.map(async (actor: any) => {
  //     let localPath: string | null = null;

  //     if (actor.profile_path) {
  //       const imageUrl = `https://image.tmdb.org/t/p/w500${actor.profile_path}`;
  //       try {
  //         localPath = await downloadImage(imageUrl, `actor_${actor.id}.jpg`, 'actors');
  //       } catch (err) {
  //         console.warn(`Failed to download image for actor ${actor.name}:`, err);
  //       }
  //     }

  //     return {
  //       id: actor.id,
  //       name: actor.name,
  //       character: actor.character,
  //       order: actor.order,
  //       profile_path: localPath
  //     };
  //   })
  // );

//   interface Credit {
//   id: number;
//   title: string;
//   character: string;
//   media_type: string;
//   release_date: string;
// }