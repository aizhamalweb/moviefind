interface YouTubeBackgroundProps {
  videoKey: string
}

export function YouTubeBackground({ videoKey }: YouTubeBackgroundProps) {
  const encodedVideoKey = encodeURIComponent(videoKey)
  const src = `https://www.youtube-nocookie.com/embed/${encodedVideoKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1&fs=0&loop=1&playlist=${encodedVideoKey}`

  return (
    <div className="hero-video" aria-hidden="true">
      <iframe
        src={src}
        title="Featured thriller background video"
        allow="autoplay; encrypted-media"
        referrerPolicy="strict-origin-when-cross-origin"
        tabIndex={-1}
      />
    </div>
  )
}
