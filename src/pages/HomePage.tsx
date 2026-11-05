import { ArrowRight, Play, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { ErrorState, LoadingState } from "../components/Feedback"
import { MovieShelf } from "../components/MovieShelf"
import { YouTubeBackground } from "../components/YouTubeBackground"
import { useFavorites } from "../hooks/useFavorites"
import {
  usePopularMovies,
  useRandomThrillerFeature,
  useTopRatedMovies,
  useUpcomingMovies,
} from "../hooks/useMovies"

export function HomePage() {
  const thrillerFeature = useRandomThrillerFeature()
  const popular = usePopularMovies()
  const topRated = useTopRatedMovies()
  const upcoming = useUpcomingMovies()
  const { favorites, toggleFavorite } = useFavorites()
  const featured = thrillerFeature.data

  return (
    <div className="home-page">
      {thrillerFeature.isError && (
        <div className="home-hero-error">
          <ErrorState error={thrillerFeature.error} onRetry={() => void thrillerFeature.refetch()} />
        </div>
      )}
      <motion.section
        className="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.65 }}
        aria-label="Featured thriller"
      >
          {featured?.videoKey && (
            <YouTubeBackground
              key={featured.videoKey}
              videoKey={featured.videoKey}
            />
          )}
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-kicker"><span className="live-dot" /> {featured ? "THRILLER SPOTLIGHT" : "YOUR CINEMA, CURATED"}</div>
            <h1>{featured?.title ?? (thrillerFeature.isPending ? "Setting the scene..." : "Find your next story.")}</h1>
            {featured && (
              <div className="hero-meta">
                <span className="hero-rating"><Sparkles size={14} /> {featured.vote_average.toFixed(1)} <span>/ 10</span></span>
                <span>{featured.release_date?.slice(0, 4) || "New release"}</span>
                <span className="meta-divider" />
                <span>Thriller</span>
              </div>
            )}
            <p className="hero-description">
              {featured?.overview || "A story worth discovering. Explore the latest films, find a new favorite, and make tonight a movie night."}
            </p>
            <div className="hero-actions">
              {featured && (
                <Link to={`/movie/${featured.id}`} className="button button-primary">
                  <Play size={16} fill="currentColor" /> Explore film
                </Link>
              )}
              <Link to="/catalog" className="button button-glass">
                Discover more <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="hero-index"><span>01</span><i /> THRILLER FEATURE</div>
      </motion.section>

      <div className="home-collections">
        {popular.isError && <ErrorState error={popular.error} onRetry={() => void popular.refetch()} />}
        {topRated.isError && <ErrorState error={topRated.error} onRetry={() => void topRated.refetch()} />}
        {upcoming.isError && <ErrorState error={upcoming.error} onRetry={() => void upcoming.refetch()} />}

        {popular.isPending ? (
          <LoadingState label="Loading popular movies..." />
        ) : (
          <MovieShelf
            title="Popular right now"
            eyebrow="THE CROWD FAVORITES"
            movies={popular.data?.results ?? []}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            href="/catalog?sort=popularity.desc"
          />
        )}
        {topRated.isPending ? (
          <LoadingState label="Finding the highest-rated..." />
        ) : (
          <MovieShelf
            title="The highest rated"
            eyebrow="CRITICALLY LOVED"
            movies={topRated.data?.results ?? []}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            href="/catalog?sort=vote_average.desc"
          />
        )}
        {upcoming.isPending ? (
          <LoadingState label="Looking ahead..." />
        ) : (
          <MovieShelf
            title="Coming soon"
            eyebrow="ON THE HORIZON"
            movies={upcoming.data?.results ?? []}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            href="/catalog?sort=primary_release_date.desc"
          />
        )}
      </div>
    </div>
  )
}
