import { useEffect, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Film,
  Flame,
  RotateCcw,
  Star,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback"
import { MovieCard } from "../components/MovieCard"
import { useFavorites } from "../hooks/useFavorites"
import { useDiscoverMovies, useMovieGenres } from "../hooks/useMovies"
import type { MovieFilters } from "../types/movie"

const ratingOptions = [
  { value: 0, label: "Any rating" },
  { value: 6, label: "6.0+ rating" },
  { value: 7, label: "7.0+ rating" },
  { value: 8, label: "8.0+ rating" },
]

const sortOptions = [
  { value: "popularity.desc", label: "Most popular", icon: Flame },
  { value: "vote_average.desc", label: "Highest rated", icon: Star },
  { value: "primary_release_date.desc", label: "Newest first", icon: Clock3 },
  { value: "primary_release_date.asc", label: "Oldest first", icon: CalendarDays },
]

interface FilterSelectProps {
  id: string
  label: string
  icon: LucideIcon
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}

function FilterSelect({ id, label, icon: Icon, value, options, onChange }: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, options.findIndex((option) => option.value === value)))
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const selectedOption = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    if (!isOpen) return

    function closeOnOutsideClick(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    document.addEventListener("pointerdown", closeOnOutsideClick)
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const activeOption = containerRef.current?.querySelector<HTMLButtonElement>(`[data-option-index="${activeIndex}"]`)
    activeOption?.focus({ preventScroll: true })
  }, [activeIndex, isOpen])

  function openMenu() {
    setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)))
    setIsOpen(true)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault()
        openMenu()
      }
      return
    }

    if (event.key === "Escape") {
      event.preventDefault()
      setIsOpen(false)
      triggerRef.current?.focus()
    } else if (event.key === "Tab") {
      setIsOpen(false)
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      const direction = event.key === "ArrowDown" ? 1 : -1
      setActiveIndex((index) => (index + direction + options.length) % options.length)
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault()
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1)
    }
  }

  return (
    <div className={`filter-select${isOpen ? " is-open" : ""}`} ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="filter-select-trigger"
        role="combobox"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-controls={`${id}-options`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
      >
        <Icon className="filter-select-icon" size={20} aria-hidden="true" />
        <span className="filter-select-copy">
          <span className="filter-select-label" id={`${id}-label`}>{label}</span>
          <span className="filter-select-value" id={`${id}-value`}>
            {selectedOption?.label ?? "Select an option"}
          </span>
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="filter-select-options" id={`${id}-options`} role="listbox" aria-labelledby={`${id}-label`}>
          {options.map((option, index) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                data-option-index={index}
                className={`filter-select-option${isSelected ? " is-selected" : ""}${activeIndex === index ? " is-active" : ""}`}
                onFocus={() => setActiveIndex(index)}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                  triggerRef.current?.focus()
                }}
              >
                <span>{option.label}</span>
                {isSelected && <span className="filter-select-check" aria-hidden="true">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const genreId = searchParams.get("genre") ?? ""
  const [minRating, setMinRating] = useState(0)
  const [year, setYear] = useState(0)
  const sortBy = searchParams.get("sort") ?? "popularity.desc"
  const [page, setPage] = useState(1)
  const genres = useMovieGenres()
  const filters: MovieFilters = {
    page,
    genreId: genreId ? Number(genreId) : undefined,
    minRating: minRating || undefined,
    year: year || undefined,
    sortBy,
  }
  const movies = useDiscoverMovies(filters)
  const { favorites, toggleFavorite } = useFavorites()

  function updateGenre(value: string) {
    setPage(1)
    const next = new URLSearchParams(searchParams)
    if (value) next.set("genre", value)
    else next.delete("genre")
    setSearchParams(next, { replace: true })
  }

  function updateSort(value: string) {
    setPage(1)
    const next = new URLSearchParams(searchParams)
    next.set("sort", value)
    setSearchParams(next, { replace: true })
  }

  function resetFilters() {
    setPage(1)
    setMinRating(0)
    setYear(0)
    const next = new URLSearchParams(searchParams)
    next.delete("genre")
    next.delete("sort")
    setSearchParams(next, { replace: true })
  }

  const totalPages = Math.min(movies.data?.total_pages ?? 1, 500)

  return (
    <div className="content-page catalog-page">
      <div className="page-intro">
        <h1>Discover <span>Movies</span></h1>
        <p>Find your next favorite movie from thousands of titles.</p>
      </div>

      <section className="filter-panel" aria-label="Filter films">
        <div className="filter-controls">
          <div className="filter-field">
            <FilterSelect
              id="genre-filter"
              label="Genre"
              icon={Film}
              value={genreId}
              options={[
                { value: "", label: "All genres" },
                ...(genres.data?.map((genre) => ({ value: String(genre.id), label: genre.name })) ?? []),
              ]}
              onChange={updateGenre}
            />
          </div>
          <div className="filter-field">
            <FilterSelect
              id="year-filter"
              label="Year"
              icon={CalendarDays}
              value={String(year)}
              options={[
                { value: "0", label: "Any year" },
                ...Array.from({ length: 76 }, (_, index) => new Date().getFullYear() - index)
                  .map((value) => ({ value: String(value), label: String(value) })),
              ]}
              onChange={(value) => { setYear(Number(value)); setPage(1) }}
            />
          </div>
          <div className="filter-field">
            <FilterSelect
              id="rating-filter"
              label="Rating"
              icon={Star}
              value={String(minRating)}
              options={ratingOptions.map((option) => ({ value: String(option.value), label: option.label }))}
              onChange={(value) => { setMinRating(Number(value)); setPage(1) }}
            />
          </div>
          <button type="button" className="filter-reset" onClick={resetFilters}>
            <RotateCcw size={16} /> Reset filters
          </button>
        </div>
      </section>

      <section className="filter-panel sort-panel" aria-label="Sort films">
        <div className="sort-options">
          {sortOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={`button ${sortBy === value ? "button-primary" : "button-outline"}`}
              aria-pressed={sortBy === value}
              onClick={() => updateSort(value)}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </section>

      {genres.isError && <ErrorState error={genres.error} onRetry={() => void genres.refetch()} />}
      {movies.isError && <ErrorState error={movies.error} onRetry={() => void movies.refetch()} />}
      {movies.isPending ? (
        <LoadingState label="Loading the catalog..." />
      ) : movies.data?.results.length ? (
        <>
          <div className="movie-grid">
            {movies.data.results.map((movie, index) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                index={index}
                isFavorite={favorites.some((item) => item.id === movie.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
          <div className="pagination">
            <button type="button" className="button button-outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
              <ChevronLeft size={16} /> Previous
            </button>
            <span>Page <strong>{page}</strong> of {totalPages}</span>
            <button type="button" className="button button-outline" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </>
      ) : (
        !movies.isError && <EmptyState title="No films match these filters">Try changing the genre, year, or rating.</EmptyState>
      )}
    </div>
  )
}
