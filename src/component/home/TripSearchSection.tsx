import { CalendarCheck2, CalendarDays, MapPin, Search } from 'lucide-react'
import { supportHighlights } from './data'
import type { HomePageProps } from './types'

type TripSearchSectionProps = Pick<
  HomePageProps,
  | 'from'
  | 'to'
  | 'date'
  | 'displayDate'
  | 'dateError'
  | 'todayIso'
  | 'loadingLocations'
  | 'loadingTrips'
  | 'originGroups'
  | 'destinationGroups'
  | 'locationTypeLabels'
  | 'hiddenDateRef'
  | 'onSearch'
  | 'onFromChange'
  | 'onToChange'
  | 'onDisplayDateChange'
  | 'onDateBlur'
  | 'onDatePickerOpen'
  | 'onDateSelect'
  | 'onNavigateHome'
>

export default function TripSearchSection({
  from,
  to,
  date,
  displayDate,
  dateError,
  todayIso,
  loadingLocations,
  loadingTrips,
  originGroups,
  destinationGroups,
  locationTypeLabels,
  hiddenDateRef,
  onSearch,
  onFromChange,
  onToChange,
  onDisplayDateChange,
  onDateBlur,
  onDatePickerOpen,
  onDateSelect,
  onNavigateHome,
}: TripSearchSectionProps) {
  return (
    <section id="lich-trinh" className="relative z-20 mx-auto -mt-8 w-full max-w-6xl px-4 sm:-mt-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-sky-100 bg-white/95 p-4 shadow-[0_30px_80px_rgba(148,163,184,0.18)] backdrop-blur sm:p-6 lg:p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">Điểm đi - Điểm đến - Ngày đi</h2>

          </div>

          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            <CalendarCheck2 className="h-4 w-4 text-orange-500" />
            Lịch trình hôm nay
          </button>
        </div>

        <form onSubmit={onSearch} className="mt-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_0.8fr_0.9fr] lg:items-end">
            <div>
              <label htmlFor="from" className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Điểm đi
              </label>
              <div className="flex items-center rounded-[1.35rem] border border-sky-100 bg-sky-50/70 px-4 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100">
                <MapPin className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
                <select
                  id="from"
                  value={from}
                  onChange={(event) => onFromChange(event.target.value)}
                  className="w-full bg-transparent py-3.5 text-sm font-medium text-slate-700 outline-none disabled:cursor-not-allowed"
                  disabled={loadingLocations}
                >
                  <option value="">{loadingLocations ? 'Đang tải...' : 'Chọn điểm đi...'}</option>
                  {originGroups.map(([type, items]) => (
                    <optgroup key={type} label={locationTypeLabels[type] || type}>
                      {items.map((location) => (
                        <option key={location.id} value={String(location.id)}>
                          {location.name} - {location.address}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="to" className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Điểm đến
              </label>
              <div className="flex items-center rounded-[1.35rem] border border-sky-100 bg-sky-50/70 px-4 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100">
                <MapPin className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
                <select
                  id="to"
                  value={to}
                  onChange={(event) => onToChange(event.target.value)}
                  className="w-full bg-transparent py-3.5 text-sm font-medium text-slate-700 outline-none disabled:cursor-not-allowed"
                  disabled={loadingLocations}
                >
                  <option value="">
                    {loadingLocations ? 'Đang tải...' : from ? 'Chọn điểm đến...' : 'Chọn điểm đi trước'}
                  </option>
                  {destinationGroups.map(([type, items]) => (
                    <optgroup key={type} label={locationTypeLabels[type] || type}>
                      {items.map((location) => (
                        <option key={location.id} value={String(location.id)}>
                          {location.name} - {location.address}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="date" className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Ngày đi
              </label>
              <div className="relative">
                <input
                  id="date"
                  type="text"
                  inputMode="numeric"
                  placeholder="dd/mm/yyyy"
                  value={displayDate}
                  onChange={(event) => onDisplayDateChange(event.target.value)}
                  onBlur={onDateBlur}
                  className={`w-full rounded-[1.35rem] border bg-sky-50/70 p-3.5 pr-12 text-sm font-medium text-slate-700 outline-none transition focus:bg-white focus:ring-4 focus:ring-orange-100 ${dateError ? 'border-red-300' : 'border-sky-100 focus:border-orange-300'
                    }`}
                />

                <button
                  type="button"
                  onClick={onDatePickerOpen}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500 transition hover:bg-white hover:text-orange-500"
                  aria-label="Mở lịch chọn ngày"
                >
                  <CalendarDays className="h-5 w-5" />
                </button>

                <input
                  ref={hiddenDateRef}
                  type="date"
                  value={date}
                  min={todayIso}
                  onChange={(event) => onDateSelect(event.target.value)}
                  className="sr-only"
                  aria-hidden
                />
                {dateError ? <div className="mt-1 text-xs text-red-500">{dateError}</div> : null}
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingTrips}
              className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-[1.35rem] bg-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Search className="h-4 w-4" />
              {loadingTrips ? 'Đang tìm chuyến...' : 'Tìm chuyến'}
            </button>
          </div>
        </form>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {supportHighlights.map((item) => {
            const Icon = item.icon

            return (
              <a
                key={item.label}
                href={item.href}
                className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-orange-500 ring-1 ring-slate-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.14em] text-slate-400">{item.label}</div>
                    <div className="text-sm font-bold text-slate-900">{item.value}</div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
