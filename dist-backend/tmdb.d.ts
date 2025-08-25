interface MediaResponse {
    original_name: string;
    title: string;
    release_date: string | null;
    overview: string;
    poster?: string | null;
    id: number;
    first_air_date: string | null;
    backdrop?: string | null;
    media_type: string;
    number_of_episodes?: number | null;
    number_of_seasons?: number | null;
    actors: Actor[];
    seasons?: {
        air_date: string | null;
        episode_count: number;
        id: number;
        name: string;
        overview: string;
        poster: string | null;
        season_number: number;
        vote_average: number;
    }[];
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
export declare function downloadMediaActors(mediaId: number, mediaType: 'movie' | 'tv'): Promise<Actor[]>;
export declare function searchMedia(id: string, media_type: 'movie' | 'tv'): Promise<Partial<MediaResponse>>;
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
