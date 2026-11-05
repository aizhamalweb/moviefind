import axios, { AxiosError, type AxiosRequestConfig } from "axios"
import type {
  GenreResponse,
  Movie,
  MovieCredits,
  MovieDetail,
  MovieFilters,
  MovieGenre,
  MovieResponse,
  MovieVideos,
  ThrillerFeature,
} from "../types/movie"

const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL
const LAST_THRILLER_TRAILER_KEY = "movieon:last-thriller-trailer"

function assertApiConfiguration(): void {
  const missing = [
    !BASE_URL && "VITE_TMDB_BASE_URL",
    !API_KEY && "VITE_TMDB_API_KEY",
  ].filter(Boolean)

  if (missing.length > 0) {
    throw new Error(`Missing TMDB environment variable(s): ${missing.join(", ")}`)
  }
}

export async function tmdbFetch<T>(
  endpoint: string,
  params: AxiosRequestConfig["params"] = {},
): Promise<T> {
  assertApiConfiguration()

  try {
    const response = await axios.get<T>(endpoint, {
      baseURL: BASE_URL,
      params: { api_key: API_KEY, ...params },
    })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      const message =
        error.response?.data?.status_message ??
        error.response?.statusText ??
        error.message
      throw new Error(
        `TMDB request failed${error.response ? ` (${error.response.status})` : ""}: ${message}`,
        { cause: error },
      )
    }

    throw error
  }
}

export async function getPopularMovies(page = 1): Promise<MovieResponse> {
  return tmdbFetch<MovieResponse>("/movie/popular", { language: "en-US", page })
}

export async function getTrendingMovies(): Promise<Movie[]> {
  const data = await tmdbFetch<MovieResponse>("/trending/movie/week", {
    language: "en-US",
  })
  return data.results
}

export async function getTopRatedMovies(page = 1): Promise<MovieResponse> {
  return tmdbFetch<MovieResponse>("/movie/top_rated", { language: "en-US", page })
}

export async function getUpcomingMovies(page = 1): Promise<MovieResponse> {
  return tmdbFetch<MovieResponse>("/movie/upcoming", { language: "en-US", page })
}

export async function searchMovies(query: string, page = 1): Promise<MovieResponse> {
  if (!query.trim()) {
    return { page, results: [], total_pages: 0, total_results: 0 }
  }

  return tmdbFetch<MovieResponse>("/search/movie", {
    query: query.trim(),
    language: "en-US",
    page,
    include_adult: false,
  })
}

export async function getMovieGenres(): Promise<MovieGenre[]> {
  const data = await tmdbFetch<GenreResponse>("/genre/movie/list", {
    language: "en-US",
  })
  return data.genres
}

export async function discoverMovies(filters: MovieFilters = {}): Promise<MovieResponse> {
  const { page = 1, genreId, minRating, year, sortBy = "popularity.desc" } = filters

  return tmdbFetch<MovieResponse>("/discover/movie", {
    language: "en-US",
    page,
    sort_by: sortBy,
    ...(genreId ? { with_genres: genreId } : {}),
    ...(minRating ? { "vote_average.gte": minRating } : {}),
    ...(year ? { primary_release_year: year } : {}),
    "vote_count.gte": 30,
    include_adult: false,
  })
}

export async function getMovieDetails(movieId: number): Promise<MovieDetail> {
  return tmdbFetch<MovieDetail>(`/movie/${movieId}`, { language: "en-US" })
}

export async function getMovieCredits(movieId: number): Promise<MovieCredits> {
  return tmdbFetch<MovieCredits>(`/movie/${movieId}/credits`, { language: "en-US" })
}

export async function getMovieVideos(movieId: number): Promise<MovieVideos> {
  return tmdbFetch<MovieVideos>(`/movie/${movieId}/videos`, { language: "en-US" })
}

export async function getSimilarMovies(movieId: number): Promise<Movie[]> {
  const data = await tmdbFetch<MovieResponse>(`/movie/${movieId}/similar`, {
    language: "en-US",
    page: 1,
  })
  return data.results
}

export async function getRandomThrillerFeature(): Promise<ThrillerFeature> {
  const movies = await discoverMovies({ genreId: 53, sortBy: "popularity.desc" })
  const candidates = [...movies.results]

  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]]
  }

  const selectedMovies = candidates.slice(0, 6)
  if (selectedMovies.length === 0) {
    throw new Error("TMDB did not return any thriller movies.")
  }

  const previousMovieId = readLastThrillerTrailerMovieId()
  const differentMovies = selectedMovies.filter((movie) => movie.id !== previousMovieId)
  const choices = differentMovies.length > 0 ? differentMovies : selectedMovies

  for (const movie of choices) {
    const videos = await getMovieVideos(movie.id)
    const trailer = videos.results.find(
      (video) => video.site === "YouTube" && video.type === "Trailer" && video.official,
    ) ?? videos.results.find(
      (video) => video.site === "YouTube" && video.type === "Trailer",
    )

    if (trailer) {
      rememberThrillerTrailerMovie(movie.id)
      return { ...movie, videoKey: trailer.key }
    }
  }

  throw new Error("TMDB did not return a YouTube trailer for the selected thriller movies.")
}

export function getMovieImage(path: string | null, size = "w500"): string {
  if (!path || !IMAGE_BASE_URL) {
    return ""
  }

  return `${IMAGE_BASE_URL.replace(/\/$/, "")}/${size}${path}`
}

function readLastThrillerTrailerMovieId(): number | null {
  try {
    const storedId = window.sessionStorage.getItem(LAST_THRILLER_TRAILER_KEY)
    return storedId ? Number(storedId) : null
  } catch (error) {
    console.error("Could not read the previous thriller selection.", error)
    return null
  }
}

function rememberThrillerTrailerMovie(movieId: number): void {
  try {
    window.sessionStorage.setItem(LAST_THRILLER_TRAILER_KEY, String(movieId))
  } catch (error) {
    console.error("Could not save the thriller selection.", error)
  }
}
