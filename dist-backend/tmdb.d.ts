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
export declare function downloadPoster(imagePath: string, movieId: number): Promise<string>;
export declare function searchMovie(query: string): Promise<MovieResponse>;
export declare function searchMovieSuggestions(query: string): Promise<MovieSuggestion[]>;
export {};
