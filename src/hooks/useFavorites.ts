import { useCallback, useEffect, useState } from "react"
import type { Movie } from "../types/movie"

const STORAGE_KEY = "movieon:favorites"

function readFavorites(): Movie[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const value: unknown = JSON.parse(stored)
    if (
      Array.isArray(value) &&
      value.every(
        (movie): movie is Movie =>
          typeof movie === "object" &&
          movie !== null &&
          "id" in movie &&
          typeof movie.id === "number" &&
          "title" in movie &&
          typeof movie.title === "string",
      )
    ) {
      return value
    }

    throw new Error("Saved favorites have an invalid format.")
  } catch (error) {
    console.error("Could not read saved favorites.", error)
    return []
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Movie[]>(readFavorites)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch (error) {
      console.error("Could not save favorites to local storage.", error)
    }
  }, [favorites])

  const toggleFavorite = useCallback((movie: Movie) => {
    setFavorites((current) =>
      current.some((favorite) => favorite.id === movie.id)
        ? current.filter((favorite) => favorite.id !== movie.id)
        : [movie, ...current],
    )
  }, [])

  const isFavorite = useCallback(
    (movieId: number) => favorites.some((movie) => movie.id === movieId),
    [favorites],
  )

  return { favorites, toggleFavorite, isFavorite }
}
