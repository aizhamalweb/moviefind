import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import {
  discoverMovies,
  getMovieCredits,
  getMovieDetails,
  getMovieGenres,
  getMovieVideos,
  getPopularMovies,
  getRandomThrillerFeature,
  getSimilarMovies,
  getTopRatedMovies,
  getTrendingMovies,
  getUpcomingMovies,
  searchMovies,
} from "../services/tmdb"
import type { MovieFilters } from "../types/movie"

export function useTrendingMovies() {
  return useQuery({
    queryKey: ["movies", "trending"],
    queryFn: getTrendingMovies,
  })
}

export function useRandomThrillerFeature() {
  const [selectionId] = useState(() => Math.random().toString(36).slice(2))

  return useQuery({
    queryKey: ["movies", "thriller-feature", selectionId],
    queryFn: getRandomThrillerFeature,
    staleTime: Infinity,
    retry: 1,
  })
}

export function usePopularMovies(page = 1) {
  return useQuery({
    queryKey: ["movies", "popular", page],
    queryFn: () => getPopularMovies(page),
  })
}

export function useTopRatedMovies(page = 1) {
  return useQuery({
    queryKey: ["movies", "top-rated", page],
    queryFn: () => getTopRatedMovies(page),
  })
}

export function useUpcomingMovies(page = 1) {
  return useQuery({
    queryKey: ["movies", "upcoming", page],
    queryFn: () => getUpcomingMovies(page),
  })
}

export function useDiscoverMovies(filters: MovieFilters) {
  return useQuery({
    queryKey: ["movies", "discover", filters],
    queryFn: () => discoverMovies(filters),
    placeholderData: (previousData) => previousData,
  })
}

export function useMovieGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: getMovieGenres,
    staleTime: 1000 * 60 * 60,
  })
}

export function useMovieSearch(query: string, page = 1) {
  return useQuery({
    queryKey: ["movies", "search", query, page],
    queryFn: () => searchMovies(query, page),
    enabled: query.trim().length >= 2,
  })
}

export function useMovieDetails(movieId: number) {
  return useQuery({
    queryKey: ["movie", movieId, "details"],
    queryFn: () => getMovieDetails(movieId),
    enabled: Number.isInteger(movieId) && movieId > 0,
  })
}

export function useMovieCredits(movieId: number) {
  return useQuery({
    queryKey: ["movie", movieId, "credits"],
    queryFn: () => getMovieCredits(movieId),
    enabled: Number.isInteger(movieId) && movieId > 0,
  })
}

export function useMovieVideos(movieId: number) {
  return useQuery({
    queryKey: ["movie", movieId, "videos"],
    queryFn: () => getMovieVideos(movieId),
    enabled: Number.isInteger(movieId) && movieId > 0,
  })
}

export function useSimilarMovies(movieId: number) {
  return useQuery({
    queryKey: ["movie", movieId, "similar"],
    queryFn: () => getSimilarMovies(movieId),
    enabled: Number.isInteger(movieId) && movieId > 0,
  })
}
