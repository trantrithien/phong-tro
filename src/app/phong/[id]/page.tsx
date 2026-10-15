'use client'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, Circle, Plus, Receipt, UserPlus } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase'
import { AppHeader } from '@/components/app-header'
import { RoomBadge } from '@/components/status-badge'
import { RoomActions } from '@/components/room-actions'
import type { HoaDon, HopDong, Phong } from '@/lib/types'
import { btnPrimary, btnSecondary, inputCls, labelCls, ngay, vnd } from '@/lib/ui'

const DON_GIA_DIEN = 3500
const DON_GIA_NUOC = 15000

function PhongSkeleton() {
  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="h-5 w-28 animate-pulse rounded bg-zinc-100" />
        <div className="mt-6 h-8 w-48 animate-pulse rounded bg-zinc-100" />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="h-56 animate-pulse rounded-xl bg-zinc-100" />
          <div className="h-56 animate-pulse rounded-xl bg-zinc-100 lg:col-span-2" />
        </div>
      </main>
    </div>
  )
}

function ChiTietPhongContent() {
  const { id } = useParams<{ id: string }>()
  const supabase = useMemo(() => createClient(), [])

  const [phong, setPhong] = useState<Phong | null>(null)
  const [hopDong, setHopDong] = useState<HopDong | null>(null)
  const [hoaDons, setHoaDons] = useState<HoaDon[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [showFormHD, setShowFormHD] = useState(false)
  const [showFormHoaDon, setShowFormHoaDon] = useState(false)
  const [errHD, setErrHD] = useState('')
  const [errHoaDon, setErrHoaDon] = useState('')

  const [hoTen, setHoTen] = useState('')
  const [sdt, setSdt] = useState('')
  const [ngayBD, setNgayBD] = useState('')
  const [tienCoc, setTienCoc] = useState('')

  const now = new Date()
  const [thang, setThang] = useState(String(now.getMonth() + 1))
  const [nam, setNam] = useState(String(now.getFullYear()))
  const [dienCu, setDienCu] = useState('')
  const [dienMoi, setDienMoi] = useState('')
  const [nuocCu, setNuocCu] = useState('')
  const [nuocMoi, setNuocMoi] = useState('')

  const load = useCallback(async () => {
    const { data: p } = await supabase.from('phong').select('*').eq('id', id).maybeSingle()
    if (!p) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setPhong(p as Phong)
    const { data: hd } = await supabase
      .from('hop_dong')
      .select('*, nguoi_thue(*)')
      .eq('phong_id', id)
      .eq('dang_hieu_luc', true)
      .maybeSingle()
    setHopDong((hd ?? null) as HopDong | null)
    if (hd) {
      const { data: list } = await supabase
        .from('hoa_don')
        .select('*')
        .eq('hop_dong_id', hd.id)
        .order('nam', { ascending: false })
        .order('thang', { ascending: false })
      setHoaDons((list ?? []) as HoaDon[])
    } else {
      setHoaDons([])
    }
    setLoading(false)
  }, [supabase, id])

  useEffect(() => {
    load()
  }, [load])

  async function taoHopDong(e: React.FormEvent) {
    e.preventDefault()
    setErrHD('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: nt, error: e1 } = await supabase
      .from('nguoi_thue')
      .insert({ chu_tro_id: user.id, ho_ten: hoTen.trim(), so_dien_thoai: sdt.trim() || null })
      .select()
      .single()
    if (e1 || !nt) {
      setErrHD('Không lưu được người thuê. Hãy thử lại.')
      return
    }
    const { error: e2 } = await supabase.from('hop_dong').insert({
      chu_tro_id: user.id,
      phong_id: id,
      nguoi_thue_id: nt.id,
      ngay_bat_dau: ngayBD,
      tien_coc: Number(tienCoc) || 0,
      dang_hieu_luc: true,
    })
    if (e2) {
      setErrHD('Không tạo được hợp đồng. Hãy thử lại.')
      return
    }
    await supabase.from('phong').update({ trang_thai: 'dang_thue' }).eq('id', id)
    setShowFormHD(false)
    await load()
  }

  function moFormHoaDon() {
    if (!showFormHoaDon && hoaDons[0]) {
      setDienCu(String(hoaDons[0].so_dien_moi))
      setNuocCu(String(hoaDons[0].so_nuoc_moi))
    }
    setErrHoaDon('')
    setShowFormHoaDon(!showFormHoaDon)
  }

  const tienDien = Math.max(0, Number(dienMoi) - Number(dienCu)) * DON_GIA_DIEN
  const tienNuoc = Math.max(0, Number(nuocMoi) - Number(nuocCu)) * DON_GIA_NUOC
  const tamTinh = (phong?.gia_thue ?? 0) + tienDien + tienNuoc

  async function taoHoaDon(e: React.FormEvent) {
    e.preventDefault()
    setErrHoaDon('')
    if (!phong || !hopDong) return
    if (Number(dienMoi) < Number(dienCu) || Number(nuocMoi) < Number(nuocCu)) {
      setErrHoaDon('Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ.')
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('hoa_don').insert({
      chu_tro_id: user.id,
      hop_dong_id: hopDong.id,
      thang: Number(thang),
      nam: Number(nam),
      tien_phong: phong.gia_thue,
      so_dien_cu: Number(dienCu),
      so_dien_moi: Number(dienMoi),
      don_gia_dien: DON_GIA_DIEN,
      so_nuoc_cu: Number(nuocCu),
      so_nuoc_moi: Number(nuocMoi),
      don_gia_nuoc: DON_GIA_NUOC,
      tong_tien: tamTinh,
      da_thu: false,
    })
    if (error) {
      setErrHoaDon(
        error.code === '23505'
          ? `Tháng ${thang}/${nam} đã có hóa đơn.`
          : 'Không lưu được hóa đơn. Hãy thử lại.'
      )
      return
    }
    setShowFormHoaDon(false)
    setDienMoi('')
    setNuocMoi('')
    await load()
  }

  async function daThu(hdId: string) {
    await supabase
      .from('hoa_don')
      .update({ da_thu: true, ngay_thu: new Date().toISOString().split('T')[0] })
      .eq('id', hdId)
    await load()
  }

  const back = (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-900"
    >
      <ArrowLeft size={16} />
      Tất cả phòng
    </Link>
  )

  if (loading) return <PhongSkeleton />

  if (notFound || !phong) {
    return (
      <div className="min-h-dvh">
        <AppHeader />
        <main className="mx-auto max-w-5xl px-6 py-10">
          {back}
          <p className="mt-6 font-medium">Không tìm thấy phòng này.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-10">
        {back}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Phòng {phong.ma_phong}</h1>
          <RoomBadge status={phong.trang_thai} />
        </div>
        <p className="mt-1 tabular-nums text-zinc-600">{vnd(phong.gia_thue)} / tháng</p>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-3">
          {/* Người thuê */}
          <section className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="font-semibold tracking-tight">Người thuê</h2>
            {hopDong ? (
              <dl className="mt-4 divide-y divide-zinc-200 text-sm">
                {[
                  ['Họ tên', hopDong.nguoi_thue.ho_ten],
                  ['Điện thoại', hopDong.nguoi_thue.so_dien_thoai || '—'],
                  ['Ngày vào', ngay(hopDong.ngay_bat_dau)],
                  ['Tiền cọc', vnd(hopDong.tien_coc)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5">
                    <dt className="text-zinc-600">{k}</dt>
                    <dd className="text-right font-medium tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-zinc-600">Phòng chưa có người thuê.</p>
                {!showFormHD && (
                  <button onClick={() => setShowFormHD(true)} className={`${btnPrimary} mt-4`}>
                    <UserPlus size={18} />
                    Tạo hợp đồng
                  </button>
                )}
                {showFormHD && (
                  <form onSubmit={taoHopDong} className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="hoten" className={labelCls}>Họ tên</label>
                      <input id="hoten" required className={inputCls} value={hoTen} onChange={(e) => setHoTen(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor="sdt" className={labelCls}>Số điện thoại</label>
                      <input id="sdt" inputMode="tel" className={inputCls} value={sdt} onChange={(e) => setSdt(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor="ngaybd" className={labelCls}>Ngày bắt đầu</label>
                      <input id="ngaybd" type="date" required className={inputCls} value={ngayBD} onChange={(e) => setNgayBD(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor="coc" className={labelCls}>Tiền cọc (đ)</label>
                      <input id="coc" type="number" min={0} className={inputCls} value={tienCoc} onChange={(e) => setTienCoc(e.target.value)} />
                    </div>
                    {errHD && <p role="alert" className="text-sm text-red-700">{errHD}</p>}
                    <div className="flex gap-2">
                      <button type="submit" className={btnPrimary}>Lưu</button>
                      <button type="button" onClick={() => setShowFormHD(false)} className={btnSecondary}>Hủy</button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </section>

          {/* Hóa đơn */}
          <section className="rounded-xl border border-zinc-200 bg-white lg:col-span-2">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="font-semibold tracking-tight">Hóa đơn</h2>
              {hopDong && (
                <button onClick={moFormHoaDon} className={btnPrimary}>
                  <Plus size={18} />
                  Tạo hóa đơn
                </button>
              )}
            </div>

            {showFormHoaDon && hopDong && (
              <form onSubmit={taoHoaDon} className="border-t border-zinc-200 bg-zinc-50 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="thang" className={labelCls}>Tháng</label>
                    <input id="thang" type="number" min={1} max={12} required className={inputCls} value={thang} onChange={(e) => setThang(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="nam" className={labelCls}>Năm</label>
                    <input id="nam" type="number" min={2000} required className={inputCls} value={nam} onChange={(e) => setNam(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="dcu" className={labelCls}>Điện cũ (kWh)</label>
                    <input id="dcu" type="number" min={0} required className={inputCls} value={dienCu} onChange={(e) => setDienCu(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="dmoi" className={labelCls}>Điện mới (kWh)</label>
                    <input id="dmoi" type="number" min={0} required className={inputCls} value={dienMoi} onChange={(e) => setDienMoi(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="ncu" className={labelCls}>Nước cũ (m³)</label>
                    <input id="ncu" type="number" min={0} required className={inputCls} value={nuocCu} onChange={(e) => setNuocCu(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="nmoi" className={labelCls}>Nước mới (m³)</label>
                    <input id="nmoi" type="number" min={0} required className={inputCls} value={nuocMoi} onChange={(e) => setNuocMoi(e.target.value)} />
                  </div>
                </div>
                <p className="mt-4 text-sm text-zinc-600">
                  Tạm tính:{' '}
                  <span className="font-semibold tabular-nums text-zinc-900">{vnd(tamTinh)}</span>
                </p>
                {errHoaDon && <p role="alert" className="mt-2 text-sm text-red-700">{errHoaDon}</p>}
                <div className="mt-4 flex gap-2">
                  <button type="submit" className={btnPrimary}>Lưu</button>
                  <button type="button" onClick={() => setShowFormHoaDon(false)} className={btnSecondary}>Hủy</button>
                </div>
              </form>
            )}

            {!hopDong ? (
              <p className="border-t border-zinc-200 px-5 py-8 text-sm text-zinc-600">
                Tạo hợp đồng cho phòng này để bắt đầu lập hóa đơn.
              </p>
            ) : hoaDons.length === 0 ? (
              <div className="flex flex-col items-center border-t border-zinc-200 px-6 py-12 text-center">
                <span className="grid size-12 place-items-center rounded-xl bg-zinc-100 text-zinc-600">
                  <Receipt size={24} />
                </span>
                <p className="mt-4 font-medium">Chưa có hóa đơn nào</p>
                <p className="mt-1 text-sm text-zinc-600">Nhập chỉ số điện nước để tạo hóa đơn đầu tiên.</p>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-200 border-t border-zinc-200">
                {hoaDons.map((hd) => (
                  <li key={hd.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div>
                      <p className="font-medium">Tháng {hd.thang}/{hd.nam}</p>
                      <p className="mt-0.5 text-sm tabular-nums text-zinc-600">
                        Điện {hd.so_dien_moi - hd.so_dien_cu} kWh · Nước {hd.so_nuoc_moi - hd.so_nuoc_cu} m³
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold tabular-nums">{vnd(hd.tong_tien)}</p>
                      {hd.da_thu ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200">
                          <CheckCircle size={14} weight="fill" />
                          Đã thu
                        </span>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200">
                            <Circle size={14} />
                            Chưa thu
                          </span>
                          <button onClick={() => daThu(hd.id)} className={`${btnSecondary} !px-3 !py-1.5`}>
                            Đánh dấu đã thu
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="mt-6">
          <RoomActions
            phongId={phong.id}
            dangThue={phong.trang_thai === 'dang_thue'}
            hopDongId={hopDong?.id ?? null}
            onChanged={load}
          />
        </div>
      </main>
    </div>
  )
}

export default function ChiTietPhong() {
  return (
    <Suspense fallback={<PhongSkeleton />}>
      <ChiTietPhongContent />
    </Suspense>
  )
}