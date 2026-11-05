import { Link } from "react-router-dom"
import { Film } from "lucide-react"

export function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-mark"><Film size={28} /></div>
      <span className="section-eyebrow">SCENE NOT FOUND</span>
      <h1>Well, that&apos;s a plot twist.</h1>
      <p>The page you&apos;re looking for isn&apos;t in this reel.</p>
      <Link to="/" className="button button-primary">Back to home</Link>
    </div>
  )
}
