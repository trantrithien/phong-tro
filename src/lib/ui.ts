export const btnPrimary =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50'

export const btnSecondary =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 active:translate-y-px'

export const inputCls =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 transition-colors focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20'

export const labelCls = 'mb-1.5 block text-sm font-medium text-zinc-800'

export const vnd = (n: number | string) => `${Number(n).toLocaleString('vi-VN')} đ`

export const ngay = (s: string) => s.split('-').reverse().join('/')