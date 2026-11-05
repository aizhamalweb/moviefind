import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import type { Movie } from "../types/movie"
import { MovieCard } from "./MovieCard"

interface MovieShelfProps {
  title: string
  eyebrow?: string
  movies: Movie[]
  favorites: Movie[]
  onToggleFavorite: (movie: Movie) => void
  href?: string
}

export function MovieShelf({
  title,
  eyebrow,
  movies,
  favorites,
  onToggleFavorite,
  href,
}: MovieShelfProps) {
  if (movies.length === 0) return null

  return (
    <section className="movie-shelf">
      <div className="section-heading">
        <div>
          {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
        </div>
        {href && (
          <Link className="text-link" to={href}>
            View all <ChevronRight size={16} />
          </Link>
        )}
      </div>
      <div className="movie-strip">
        {movies.map((movie, index) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            index={index}
            isFavorite={favorites.some((item) => item.id === movie.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  )
}
