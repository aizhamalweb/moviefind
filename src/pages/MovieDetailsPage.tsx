import { useState } from "react"
import {
  BookmarkPlus,
  CalendarDays,
  Check,
  Clapperboard,
  Clock3,
  Globe2,
  Play,
  Star,
} from "lucide-react"
import { useParams } from "react-router-dom"
import { motion } from "motion/react"
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback"
import { MovieShelf } from "../components/MovieShelf"
import { useFavorites } from "../hooks/useFavorites"
import {
  useMovieCredits,
  useMovieDetails,
  useMovieVideos,
  useSimilarMovies,
} from "../hooks/useMovies"
import { getMovieImage } from "../services/tmdb"

export function MovieDetailsPage() {
  const [peopleView, setPeopleView] = useState<"cast" | "crew">("cast")
  const { movieId: rawId } = useParams()
  const movieId = Number(rawId)
  const validId = Number.isInteger(movieId) && movieId > 0
  const details = useMovieDetails(validId ? movieId : 0)
  const credits = useMovieCredits(validId ? movieId : 0)
  const videos = useMovieVideos(validId ? movieId : 0)
  const similar = useSimilarMovies(validId ? movieId : 0)
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const movie = details.data

  if (!validId) return <EmptyState title="That movie link is invalid">Choose a film from the catalog to see its details.</EmptyState>
  if (details.isPending) return <LoadingState label="Loading movie details..." />
  if (details.isError) return <ErrorState error={details.error} onRetry={() => void details.refetch()} />
  if (!movie) return <EmptyState title="Movie not found">This movie may no longer be available.</EmptyState>

  const backdrop = getMovieImage(movie.backdrop_path, "original")
  const trailer = videos.data?.results.find(
    (video) => video.site === "YouTube" && video.type === "Trailer" && video.official,
  ) ?? videos.data?.results.find(
    (video) => video.site === "YouTube" && video.type === "Trailer",
  )
  const director = credits.data?.crew.find((member) => member.job === "Director")
  const cast = credits.data?.cast ?? []
  const crew = credits.data?.crew ?? []
  const crewByPerson = Array.from(
    crew.reduce((people, member) => {
      const person = people.get(member.id)
      if (person) {
        if (!person.jobs.includes(member.job)) person.jobs.push(member.job)
        if (!person.profile_path && member.profile_path) person.profile_path = member.profile_path
      } else {
        people.set(member.id, { ...member, jobs: [member.job] })
      }
      return people
    }, new Map<number, (typeof crew)[number] & { jobs: string[] }>()).values(),
  )
  const saved = isFavorite(movie.id)

  return (
    <div className="details-page">
      <section
        className="detail-hero"
        style={backdrop ? { backgroundImage: `url("${backdrop}")` } : undefined}
      >
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <motion.div
            className="detail-heading"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <span className="section-eyebrow">THE FEATURE PRESENTATION</span>
            <h1>{movie.title}</h1>
            {movie.tagline && <p className="detail-tagline">&ldquo;{movie.tagline}&rdquo;</p>}
            <div className="detail-meta">
              <span className="detail-rating"><Star size={15} fill="currentColor" /> {movie.vote_average.toFixed(1)} <small>({movie.vote_count.toLocaleString()} votes)</small></span>
              {movie.runtime ? <span><Clock3 size={14} /> {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span> : null}
              <span>{movie.release_date?.slice(0, 4) || "Release date TBA"}</span>
            </div>
            <div className="detail-genres">
              {movie.genres.map((genre) => <span key={genre.id}>{genre.name}</span>)}
            </div>
            <div className="hero-actions">
              {trailer ? (
                <a className="button button-primary" href="#trailer">
                  <Play size={16} fill="currentColor" /> Watch trailer
                </a>
              ) : (
                <a className="button button-primary" href="#movie-story">
                  <Play size={16} fill="currentColor" /> Explore story
                </a>
              )}
              <button className={`button button-glass${saved ? " is-saved" : ""}`} onClick={() => toggleFavorite(movie)}>
                {saved ? <Check size={16} /> : <BookmarkPlus size={16} />}
                {saved ? "In my list" : "Add to my list"}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="detail-body">
        <section id="movie-story" className="story-grid">
          <div className="story-copy">
            <h2>About the film</h2>
            <p>{movie.overview || "No synopsis is available for this film yet."}</p>
          </div>
          <aside className="film-facts">
            <div><CalendarDays size={20} /><span>Release date<strong>{movie.release_date || "Not announced"}</strong></span></div>
            <div><Clapperboard size={20} /><span>Director<strong>{director?.name ?? "Not listed"}</strong></span></div>
            <div><Play size={20} /><span>Status<strong>{movie.status || "Unknown"}</strong></span></div>
            <div><Globe2 size={20} /><span>Original language<strong>{movie.original_language.toUpperCase()}</strong></span></div>
          </aside>
        </section>

        {videos.isError && <ErrorState error={videos.error} onRetry={() => void videos.refetch()} />}
        {trailer && (
          <section id="trailer" className="trailer-section">
            <div className="section-heading">
              <div><span className="section-eyebrow">A FIRST LOOK</span><h2>Official trailer</h2></div>
            </div>
            <div className="trailer-frame">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailer.key)}`}
                title={`${movie.title} official trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {credits.isError && <ErrorState error={credits.error} onRetry={() => void credits.refetch()} />}
        {credits.isPending ? (
          <LoadingState label="Loading cast and crew..." />
        ) : credits.data && (
          <section className="cast-section">
            <div className="section-heading people-tabs" role="group" aria-label="Choose cast or crew">
              <button
                type="button"
                className={peopleView === "cast" ? "active" : ""}
                aria-pressed={peopleView === "cast"}
                onClick={() => setPeopleView("cast")}
              >
                Cast <span>{cast.length}</span>
              </button>
              <button
                type="button"
                className={peopleView === "crew" ? "active" : ""}
                aria-pressed={peopleView === "crew"}
                onClick={() => setPeopleView("crew")}
              >
                Crew <span>{crewByPerson.length}</span>
              </button>
            </div>
            {peopleView === "cast" ? (
              cast.length ? (
                <div className="cast-strip">
                  {cast.map((person) => {
                    const photo = getMovieImage(person.profile_path, "w185")
                    return (
                      <article className="cast-card" key={`${person.id}-${person.order}`}>
                        <div className="person-photo">
                          {photo ? <img src={photo} alt={person.name} loading="lazy" /> : <div className="cast-placeholder">{person.name.charAt(0)}</div>}
                        </div>
                        <strong>{person.name}</strong>
                        <span>{person.character || "Cast"}</span>
                        {typeof person.popularity === "number" && (
                          <span className="person-popularity">
                            <Star size={12} fill="currentColor" /> {person.popularity.toFixed(1)}
                          </span>
                        )}
                      </article>
                    )
                  })}
                </div>
              ) : (
                <EmptyState title="Cast details unavailable" />
              )
            ) : crewByPerson.length ? (
              <div className="crew-grid">
                {crewByPerson.map((member) => (
                  <article className="crew-card" key={member.id}>
                    <div className="crew-photo">
                      {member.profile_path ? (
                        <img
                          className="crew-avatar"
                          src={getMovieImage(member.profile_path, "w185")}
                          alt={member.name}
                          loading="lazy"
                        />
                      ) : (
                        <span className="crew-avatar" aria-hidden="true">{member.name.charAt(0)}</span>
                      )}
                    </div>
                    <strong>{member.name}</strong>
                    <span className="crew-job">{member.jobs.join(", ")}</span>
                    {typeof member.popularity === "number" && (
                      <span className="person-popularity">
                        <Star size={12} fill="currentColor" /> {member.popularity.toFixed(1)}
                      </span>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="Crew details unavailable" />
            )}
          </section>
        )}

        {similar.isError && <ErrorState error={similar.error} onRetry={() => void similar.refetch()} />}
        {similar.isPending ? (
          <LoadingState label="Finding similar movies..." />
        ) : (
          <MovieShelf
            title="If you liked this"
            eyebrow="MORE TO EXPLORE"
            movies={similar.data ?? []}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            href="/catalog"
          />
        )}
      </div>
    </div>
  )
}
