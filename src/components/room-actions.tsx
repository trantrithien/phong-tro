'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignOut, Trash } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase'
import { btnPrimary, btnSecondary } from '@/lib/ui'

const btnDanger =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50'

type Props = {
  phongId: string
  dangThue: boolean
  hopDongId: string | null
  onChanged: () => void
}

export function RoomActions({ phongId, dangThue, hopDongId, onChanged }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [mode, setMode] = useState<'none' | 'tra' | 'xoa'>('none')
  const [unpaid, setUnpaid] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function openTraPhong() {
    setError('')
    if (hopDongId) {
      const { count } = await supabase
        .from('hoa_don')
        .select('id', { count: 'exact', head: true })
        .eq('hop_dong_id', hopDongId)
        .eq('da_thu', false)
      setUnpaid(count ?? 0)
    }
    setMode('tra')
  }

  async function traPhong() {
    if (!hopDongId) return
    setBusy(true)
    setError('')
    const today = new Date().toISOString().split('T')[0]
    const { error: e1 } = await supabase
      .from('hop_dong')
      .update({ dang_hieu_luc: false, ngay_ket_thuc: today })
      .eq('id', hopDongId)
    const { error: e2 } = await supabase
      .from('phong')
      .update({ trang_thai: 'trong' })
      .eq('id', phongId)
    setBusy(false)
    if (e1 || e2) {
      setError('Không trả phòng được. Hãy thử lại.')
      return
    }
    setMode('none')
    onChanged()
  }

  async function xoaPhong() {
    setBusy(true)
    setError('')
    const { error } = await supabase.from('phong').delete().eq('id', phongId)
    setBusy(false)
    if (error) {
      setError('Không xóa được phòng. Hãy thử lại.')
      return
    }
    router.push('/')
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="font-semibold tracking-tight">Quản lý phòng</h2>

      {mode === 'none' && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {dangThue && (
              <button onClick={openTraPhong} className={btnSecondary}>
                <SignOut size={18} />
                Trả phòng
              </button>
            )}
            <button
              onClick={() => setMode('xoa')}
              disabled={dangThue}
              className={btnDanger}
            >
              <Trash size={18} />
              Xóa phòng
            </button>
          </div>
          {dangThue && (
            <p className="mt-3 text-sm text-zinc-600">Cần trả phòng trước khi có thể xóa.</p>
          )}
        </>
      )}

      {mode === 'tra' && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-zinc-700">
            Hợp đồng sẽ kết thúc hôm nay và phòng chuyển về trạng thái trống.
            {unpaid > 0 && (
              <>
                {' '}Còn <span className="font-semibold">{unpaid}</span> hóa đơn chưa thu.
                Các hóa đơn này vẫn được giữ lại trong lịch sử.
              </>
            )}
          </p>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex gap-2">
            <button onClick={traPhong} disabled={busy} className={btnPrimary}>
              {busy ? 'Đang xử lý...' : 'Xác nhận trả phòng'}
            </button>
            <button onClick={() => setMode('none')} className={btnSecondary}>Hủy</button>
          </div>
        </div>
      )}

      {mode === 'xoa' && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-zinc-700">
            Xóa phòng sẽ xóa luôn toàn bộ lịch sử hợp đồng và hóa đơn của phòng này.
            <span className="font-semibold"> Không thể hoàn tác.</span>
          </p>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex gap-2">
            <button onClick={xoaPhong} disabled={busy} className={btnDanger}>
              {busy ? 'Đang xóa...' : 'Xác nhận xóa'}
            </button>
            <button onClick={() => setMode('none')} className={btnSecondary}>Hủy</button>
          </div>
        </div>
      )}
    </section>
  )
}