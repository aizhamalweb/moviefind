import { useRef, useState } from "react"
import type { FormEvent } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import {
  Bookmark,
  Compass,
  House,
  Menu,
  Search,
  X,
} from "lucide-react"
import favicon from "../assets/favicon.png"

const navigation = [
  { to: "/", label: "Home", icon: House, end: true },
  { to: "/catalog", label: "Discover", icon: Compass, end: false },
  { to: "/favorites", label: "My list", icon: Bookmark, end: false },
]

function HeaderSearch({ initialQuery }: { initialQuery: string }) {
  const location = useLocation()
  const navigate = useNavigate()
  const returnPath = useRef(location.pathname === "/search" ? "/catalog" : location.pathname)

  function updateSearch(value: string) {
    if (value.trim()) {
      if (location.pathname !== "/search") {
        returnPath.current = location.pathname
      }
      navigate(`/search?q=${encodeURIComponent(value)}`, { replace: true })
    } else if (location.pathname === "/search") {
      navigate(returnPath.current, { replace: true })
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <form className="nav-search" role="search" onSubmit={submitSearch}>
      <Search size={17} aria-hidden="true" />
      <input
        type="search"
        value={initialQuery}
        onChange={(event) => updateSearch(event.target.value)}
        placeholder="Search"
        aria-label="Search movies"
      />
      {initialQuery && (
        <button
          type="button"
          className="nav-search-clear"
          aria-label="Clear movie search"
          onClick={() => updateSearch("")}
        >
          <X size={15} />
        </button>
      )}
    </form>
  )
}

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const isHomePage = pathname === "/"
  const isDiscoverPage = pathname === "/catalog"

  return (
    <div className={`app-shell${isHomePage ? " home-layout" : ""}${isDiscoverPage ? " discover-layout" : ""}`}>
      <header className="topbar">
        <Link className="brand" to="/" aria-label="MOVIEFIND home">
          <img className="brand-mark" src={favicon} alt="" />
          <span>MOVIE<span className="brand-accent">FIND</span></span>
        </Link>
        <div className={`nav-center${menuOpen ? " is-open" : ""}`}>
          <nav
            id="main-navigation"
            className="main-nav"
            aria-label="Main navigation"
          >
            {navigation.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `nav-link${label === "My list" ? " favorite-link" : ""}${isActive ? " active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <HeaderSearch initialQuery={searchParams.get("q") ?? ""} />
        <button
          type="button"
          className="nav-toggle"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>
      <main className="page-content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-brand-block">
          <Link className="footer-brand" to="/" aria-label="MOVIEFIND home">
            <img className="footer-brand-mark" src={favicon} alt="" />
            <span>MOVIE<span className="brand-accent">FIND</span></span>
          </Link>
          <p>Find your next favorite movie.</p>
        </div>
        <nav className="footer-nav" aria-label="Footer navigation">
          {navigation.map(({ to, label }) => (
            <Link key={to} to={to}>{label}</Link>
          ))}
        </nav>
        <p className="footer-copyright">
          © {new Date().getFullYear()} MOVIEFIND
        </p>
      </footer>
    </div>
  )
}
