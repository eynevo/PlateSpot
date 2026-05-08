export default function ProgressBar({ label, flag, current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">
          {flag} {label}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {current}/{total} ({pct}%)
        </span>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
