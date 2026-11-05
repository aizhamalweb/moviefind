export interface Movie {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  genre_ids: number[]
  original_language: string
  adult: boolean
  video: boolean
}

export interface ThrillerFeature extends Movie {
  videoKey: string
}

export interface MovieGenre {
  id: number
  name: string
}

export interface MovieDetail extends Movie {
  genres: MovieGenre[]
  runtime: number | null
  status: string
  tagline: string
  budget: number
  revenue: number
}

export interface MovieResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export interface GenreResponse {
  genres: MovieGenre[]
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  popularity?: number
  order: number
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
  popularity?: number
}

export interface MovieCredits {
  id: number
  cast: CastMember[]
  crew: CrewMember[]
}

export interface MovieVideo {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
}

export interface MovieVideos {
  id: number
  results: MovieVideo[]
}

export interface MovieFilters {
  page?: number
  genreId?: number
  minRating?: number
  year?: number
  sortBy?: string
}
