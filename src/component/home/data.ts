import type { LucideIcon } from 'lucide-react'
import {
  BusFront,
  Clock3,
  CreditCard,
  Headphones,
  Mail,
  MessageCircleHeart,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import heroBusImage from '../../assets/hero.png'

export interface SupportHighlight {
  label: string
  value: string
  href: string
  icon: LucideIcon
}

export interface PopularRoute {
  from: string
  to: string
  duration: string
  price: string
  frequency: string
}

export interface ServiceReason {
  title: string
  description: string
  icon: LucideIcon
}

export interface BookingStep {
  step: string
  title: string
  description: string
  icon: LucideIcon
}

export interface GalleryImage {
  src: string
  alt: string
  caption: string
}

export interface Testimonial {
  name: string
  role: string
  quote: string
}

export interface FaqItem {
  question: string
  answer: string
}

export const homeSlides = [
  { id: 'slide-1', url: '/anh_000.webp' },
  { id: 'slide-2', url: '/anh_001.webp' },
  { id: 'slide-3', url: '/anh_002.webp' },
] as const

export const supportHighlights: SupportHighlight[] = [
  { label: 'Hotline đặt vé', value: '1900 1010', href: 'tel:19001010', icon: Phone },
  { label: 'Zalo hỗ trợ', value: '0352789648', href: 'https://zalo.me/0352789648', icon: MessageCircleHeart },
  { label: 'Email', value: 'hotro@SaigonST.vn', href: 'mailto:hotro@SaigonST.vn', icon: Mail },
  { label: 'Hỗ trợ', value: '24/24 mỗi ngày', href: '#lien-he', icon: Headphones },
]

export const popularRoutes: PopularRoute[] = [
  { from: 'TP.HCM', to: 'Cần Thơ', duration: '3 giờ 30 phút', price: 'Từ 165.000đ', frequency: '12 chuyến/ngày' },
  { from: 'TP.HCM', to: 'Long Xuyên', duration: '4 giờ', price: 'Từ 180.000đ', frequency: '10 chuyến/ngày' },
  { from: 'TP.HCM', to: 'Châu Đốc', duration: '5 giờ 30 phút', price: 'Từ 220.000đ', frequency: '8 chuyến/ngày' },
  { from: 'TP.HCM', to: 'Rạch Giá', duration: '6 giờ', price: 'Từ 240.000đ', frequency: '6 chuyến/ngày' },
]

export const serviceReasons: ServiceReason[] = [
  {
    title: 'Lịch trình rõ ràng',
    description: 'Thông tin giờ khởi hành, điểm đón trả và tình trạng vé được trình bày rõ ràng, dễ theo dõi.',
    icon: Clock3,
  },
  {
    title: 'Đặt vé an tâm',
    description: 'Quy trình tìm chuyến, chọn ghế và thanh toán được giữ ngắn gọn để hạn chế nhầm lẫn.',
    icon: ShieldCheck,
  },
  {
    title: 'Hỗ trợ nhanh',
    description: 'Hotline, Zalo và email luôn hiện diện ở vị trí dễ thấy để khách hàng liên hệ ngay khi cần.',
    icon: Headphones,
  },
  {
    title: 'Nhận diện đồng bộ',
    description: 'Màu sắc, hình ảnh và bố cục được đồng bộ để thương hiệu nổi bật và dễ ghi nhớ hơn.',
    icon: Sparkles,
  },
]

export const bookingSteps: BookingStep[] = [
  {
    step: '01',
    title: 'Tìm chuyến xe',
    description: 'Nhập điểm đi, điểm đến và ngày đi để xem các chuyến đang mở bán.',
    icon: Search,
  },
  {
    step: '02',
    title: 'Chọn ghế',
    description: 'Xem sơ đồ ghế và xác nhận vị trí mong muốn trước khi thanh toán.',
    icon: BusFront,
  },
  {
    step: '03',
    title: 'Thanh toán',
    description: 'Hoàn tất giao dịch và theo dõi đơn bằng mã đặt vé được hệ thống cấp.',
    icon: CreditCard,
  },
]

export const galleryImages: GalleryImage[] = [
  {
    src: '/anh_000.webp',
    alt: 'Hình ảnh xe khách Saigon ST',
    caption: 'Hình ảnh nhà xe được làm nổi bật để tăng nhận diện thương hiệu.',
  },
  {
    src: '/anh_001.webp',
    alt: 'Slide hình ảnh nhà xe Saigon ST',
    caption: 'Bố cục mới ưu tiên ảnh lớn toàn chiều ngang ở phần đầu trang.',
  },
  {
    src: heroBusImage,
    alt: 'Minh họa thao tác đặt vé trực tuyến',
    caption: 'Khối tìm vé được giữ gọn để người dùng thao tác nhanh hơn.',
  },
]

export const testimonials: Testimonial[] = [
  {
    name: 'Chị Mai',
    role: 'Khách hàng thường xuyên',
    quote: 'Phần đầu trang bây giờ thoáng hơn nhiều, ảnh đẹp và thông tin cần thiết xuất hiện đúng chỗ.',
  },
  {
    name: 'Anh Quốc',
    role: 'Đặt vé cho gia đình',
    quote: 'Khối tìm vé dễ nhìn hơn, ít chữ hơn nên người lớn trong nhà cũng đỡ rối khi thao tác.',
  },
  {
    name: 'Bạn Thảo',
    role: 'Người dùng mới',
    quote: 'Banner rộng và nhẹ mắt hơn, nhìn vào là thấy ngay thương hiệu và nút đặt vé.',
  },
]

export const faqs: FaqItem[] = [
  {
    question: 'Tôi có cần đăng nhập trước khi đặt vé không?',
    answer: 'Có. Hệ thống hiện tại yêu cầu đăng nhập trước khi tìm và đặt vé để quản lý booking tốt hơn.',
  },
  {
    question: 'Tôi có thể tra cứu vé ở đâu?',
    answer: 'Bạn có thể dùng mục Tra cứu vé trên header để nhập mã đặt vé và số điện thoại.',
  },
  {
    question: 'Có hỗ trợ liên hệ ngoài giờ hành chính không?',
    answer: 'Có. Saigon.ST hiện hỗ trợ 24/24 qua hotline, Zalo và email.',
  },
  {
    question: 'Nếu chưa thanh toán thì ghế được giữ trong bao lâu?',
    answer: 'Đơn chờ thanh toán cần được xử lý sớm và hệ thống sẽ tự cập nhật trạng thái khi nhận giao dịch.',
  },
]

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
