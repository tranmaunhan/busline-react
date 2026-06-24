import { galleryImages } from './data'

export default function GallerySection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Hình ảnh xe</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Xe đời mới và tiện nghi</h2>
        </div>

      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <img src={galleryImages[0].src} alt={galleryImages[0].alt} className="h-[320px] w-full object-cover sm:h-[420px]" />
          <div className="p-5">
            <h3 className="text-xl font-black text-slate-950">Ảnh xe chiếm ưu tiên ở phần đầu trang</h3>
            <p className="mt-2 text-sm leading-7 text-slate-500">{galleryImages[0].caption}</p>
          </div>
        </article>

        <div className="grid gap-4">
          {galleryImages.slice(1).map((image) => (
            <article key={image.alt} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
              <img src={image.src} alt={image.alt} className="h-48 w-full object-cover sm:h-56" />
              <div className="p-5">
                <p className="text-sm leading-7 text-slate-500">{image.caption}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
