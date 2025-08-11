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
export declare function downloadMovieActors(movieId: number): Promise<Actor[]>;
export declare function searchMovie(id: string): Promise<MovieResponse>;
export declare function tmdbSuggestions(query: string): Promise<MediaSuggestion[]>;
export declare function personCredits(query: string): Promise<Credit[]>;
export declare function personBio(query: string): Promise<{
    name: any;
    id: any;
    bio: any;
    birthday: any;
    place_of_birth: any;
    profile_path: string;
}>;
export {};
