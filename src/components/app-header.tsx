'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Buildings, SignOut } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase'

export function AppHeader() {
  const router = useRouter()

  async function dangXuat() {
    await createClient().auth.signOut()
    router.push('/login')
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-emerald-700 text-white">
            <Buildings size={18} />
          </span>
          Quản lý phòng trọ
        </Link>
        <button
          onClick={dangXuat}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          <SignOut size={18} />
          Đăng xuất
        </button>
      </div>
    </header>
  )
}