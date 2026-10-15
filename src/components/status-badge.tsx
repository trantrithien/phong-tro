import type { Phong } from '@/lib/types'

export function RoomBadge({ status }: { status: Phong['trang_thai'] }) {
  const rented = status === 'dang_thue'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
        rented
          ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
          : 'bg-zinc-100 text-zinc-700 ring-zinc-200'
      }`}
    >
      <span className={`size-1.5 rounded-full ${rented ? 'bg-emerald-600' : 'bg-zinc-400'}`} />
      {rented ? 'Đang thuê' : 'Trống'}
    </span>
  )
}