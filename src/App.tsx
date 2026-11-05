import { lazy, Suspense, useEffect } from "react"
import { Route, Routes, useLocation } from "react-router-dom"
import { AppLayout } from "./components/AppLayout"

const CatalogPage = lazy(() => import("./pages/CatalogPage").then((module) => ({ default: module.CatalogPage })))
const FavoritesPage = lazy(() => import("./pages/FavoritesPage").then((module) => ({ default: module.FavoritesPage })))
const HomePage = lazy(() => import("./pages/HomePage").then((module) => ({ default: module.HomePage })))
const MovieDetailsPage = lazy(() => import("./pages/MovieDetailsPage").then((module) => ({ default: module.MovieDetailsPage })))
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })))
const SearchPage = lazy(() => import("./pages/SearchPage").then((module) => ({ default: module.SearchPage })))

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [pathname])

  return null
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div className="route-loading" role="status">Preparing your cinema...</div>}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="movie/:movieId" element={<MovieDetailsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}

export default App
