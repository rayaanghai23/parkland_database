export function StatCard({
  label,
  value,
  accent = 'text-stone-900',
}: {
  label: string
  value: string | number
  accent?: string
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent}`}>{value}</p>
    </div>
  )
}
