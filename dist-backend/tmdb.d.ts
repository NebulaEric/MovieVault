interface MovieResponse {
    title: string;
    overview: string;
    poster: string;
    id: number;
    release_date: string;
    backdrop: string;
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
export declare function downloadMovieActors(movieId: number): Promise<Actor[]>;
export declare function searchMovie(id: string): Promise<MovieResponse>;
export declare function tmdbSuggestions(query: string): Promise<MediaSuggestion[]>;
export {};
