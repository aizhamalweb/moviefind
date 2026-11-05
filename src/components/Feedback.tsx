import { AlertCircle, LoaderCircle } from "lucide-react"
import type { ReactNode } from "react"

export function LoadingState({ label = "Loading films..." }: { label?: string }) {
  return (
    <div className="feedback loading-state" role="status">
      <LoaderCircle size={25} className="spin" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className="feedback error-state" role="alert">
      <AlertCircle size={22} />
      <div>
        <strong>We couldn&apos;t load these films.</strong>
        <p>{error.message}</p>
        {onRetry && <button className="button button-outline" onClick={onRetry}>Try again</button>}
      </div>
    </div>
  )
}

export function EmptyState({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon"><AlertCircle size={24} /></div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  )
}
