export type Phong = {
  id: string
  ma_phong: string
  gia_thue: number
  trang_thai: 'trong' | 'dang_thue'
}

export type NguoiThue = {
  id: string
  ho_ten: string
  so_dien_thoai: string | null
}

export type HopDong = {
  id: string
  ngay_bat_dau: string
  tien_coc: number
  nguoi_thue: NguoiThue
}

export type HoaDon = {
  id: string
  thang: number
  nam: number
  tien_phong: number
  so_dien_cu: number
  so_dien_moi: number
  so_nuoc_cu: number
  so_nuoc_moi: number
  tong_tien: number
  da_thu: boolean
}