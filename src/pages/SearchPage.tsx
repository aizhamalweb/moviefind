import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback"
import { MovieCard } from "../components/MovieCard"
import { useFavorites } from "../hooks/useFavorites"
import { useMovieSearch } from "../hooks/useMovies"

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") ?? ""

  return <SearchContent key={query} query={query} />
}

function SearchContent({ query }: { query: string }) {
  const [page, setPage] = useState(1)
  const { favorites, toggleFavorite } = useFavorites()
  const results = useMovieSearch(query, page)

  const totalPages = Math.min(results.data?.total_pages ?? 1, 500)

  return (
    <div className="content-page search-page">
      {query.trim().length < 2 ? (
        <EmptyState title="Search for a movie">Use the search field in the navigation bar.</EmptyState>
      ) : (
        <>
          <div className="results-heading">
            <h2>Results for <span>&ldquo;{query}&rdquo;</span></h2>
            {results.data && <span>{results.data.total_results.toLocaleString()} matches</span>}
          </div>
          {results.isError && <ErrorState error={results.error} onRetry={() => void results.refetch()} />}
          {results.isPending ? (
            <LoadingState label="Searching the collection..." />
          ) : results.data?.results.length ? (
            <>
              <div className="movie-grid">
                {results.data.results.map((movie, index) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    index={index}
                    isFavorite={favorites.some((item) => item.id === movie.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button className="button button-outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
                  <span>Page <strong>{page}</strong> of {totalPages}</span>
                  <button className="button button-outline" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
                </div>
              )}
            </>
          ) : (
            !results.isError && <EmptyState title="No movies found">Try another title or check the spelling.</EmptyState>
          )}
        </>
      )}
    </div>
  )
}
