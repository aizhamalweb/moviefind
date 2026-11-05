import { Bookmark, Clapperboard, Film } from "lucide-react"
import { Link } from "react-router-dom"
import { MovieCard } from "../components/MovieCard"
import { useFavorites } from "../hooks/useFavorites"

export function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites()

  return (
    <div className="content-page favorites-page">
      <section className="favorites-hero">
        <div className="favorites-hero-inner">
          <h1>My <span>List</span></h1>
          <p>Your favorite movies, always here.</p>
        </div>
      </section>
      <div className="favorites-content">
        <div className="favorites-toolbar">
          <div className="favorites-tab">
            <Bookmark size={17} fill="currentColor" />
            <span>Saved Movies</span>
          </div>
          <span className="favorites-count">
            {favorites.length} {favorites.length === 1 ? "movie" : "movies"}
          </span>
        </div>
        {favorites.length ? (
          <div className="movie-grid">
            {favorites.map((movie, index) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                index={index}
                isFavorite
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="favorites-empty">
            <Clapperboard size={46} strokeWidth={1.35} aria-hidden="true" />
            <h2>Your list is empty</h2>
            <p>Add your favorite movies to see them here.</p>
            <Link className="button button-primary" to="/catalog">
              <Film size={16} />
              Browse Movies
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
