export default function SupabaseBanner({ status }) {
  if (status !== 'paused' && status !== 'restoring') return null

  return (
    <div className="bg-amber-100 dark:bg-amber-900/50 border-b border-amber-300 dark:border-amber-700 px-4 py-2 flex items-center gap-2">
      <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="text-sm text-amber-800 dark:text-amber-200">
        Restoring database... this may take a moment
      </span>
    </div>
  )
}
