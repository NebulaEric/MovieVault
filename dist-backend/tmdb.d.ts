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
export declare function downloadMovieImages(posterPath: string, backdropPath: string, movieId: number): Promise<{
    poster: string;
    backdrop: string;
}>;
export declare function searchMovie(id: string): Promise<MovieResponse>;
export declare function searchMovieSuggestions(query: string): Promise<MovieSuggestion[]>;
export {};
