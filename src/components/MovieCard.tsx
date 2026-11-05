import { motion } from "motion/react"
import { BookmarkPlus, Check, Film, Star } from "lucide-react"
import { Link } from "react-router-dom"
import { getMovieImage } from "../services/tmdb"
import type { Movie } from "../types/movie"

interface MovieCardProps {
  movie: Movie
  isFavorite: boolean
  onToggleFavorite: (movie: Movie) => void
  index?: number
}

export function MovieCard({
  movie,
  isFavorite,
  onToggleFavorite,
  index = 0,
}: MovieCardProps) {
  const poster = getMovieImage(movie.poster_path, "w500")
  const year = movie.release_date?.slice(0, 4)

  return (
    <motion.article
      className="movie-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.035, 0.28) }}
      whileHover={{ y: -5 }}
    >
      <Link to={`/movie/${movie.id}`} className="movie-card-link" aria-label={`View ${movie.title}`}>
        <div className="movie-poster-wrap">
          {poster ? (
            <img className="movie-poster" src={poster} alt={`${movie.title} poster`} loading="lazy" />
          ) : (
            <div className="poster-fallback"><Film size={32} /><span>No poster</span></div>
          )}
          <div className="poster-shade" />
          <div className="movie-rating"><Star size={12} fill="currentColor" /> {movie.vote_average.toFixed(1)}</div>
          <div className="movie-card-info">
            <h3>{movie.title}</h3>
            <span>{year || "Release date TBA"}</span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        className={`favorite-toggle${isFavorite ? " selected" : ""}`}
        onClick={() => onToggleFavorite(movie)}
        aria-label={isFavorite ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
        title={isFavorite ? "Remove from My list" : "Add to My list"}
      >
        {isFavorite ? <Check size={17} /> : <BookmarkPlus size={17} />}
      </button>
    </motion.article>
  )
}