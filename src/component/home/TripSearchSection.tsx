import { CalendarDays, MapPin, Search } from 'lucide-react'
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
}: TripSearchSectionProps) {
  return (
    <section id="lich-trinh" className="relative z-20 w-full scroll-mt-24">
      <div className="mx-auto w-full max-w-6xl rounded-[2rem] border border-slate-200/80 bg-white p-4 shadow-[0_28px_72px_rgba(15,23,42,0.16),0_10px_24px_rgba(249,115,22,0.08)] sm:p-6 lg:p-8">
        <form onSubmit={onSearch} className="mt-1">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_0.8fr_0.9fr] lg:items-end">
            <div>
              <label htmlFor="from" className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Điểm đi
              </label>
              <div className="flex items-center rounded-[1.35rem] border border-slate-200 bg-white px-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100">
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
              <div className="flex items-center rounded-[1.35rem] border border-slate-200 bg-white px-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100">
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
                  className={`w-full rounded-[1.35rem] border bg-white p-3.5 pr-12 text-sm font-medium text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)] outline-none transition focus:ring-4 focus:ring-orange-100 ${dateError ? 'border-red-300' : 'border-slate-200 focus:border-orange-300'
                    }`}
                />

                <button
                  type="button"
                  onClick={onDatePickerOpen}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500 transition hover:bg-slate-50 hover:text-orange-500"
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


      </div>
    </section>
  )
}
