import React, { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

// ================= FULL SRI LANKA HOLIDAYS 2026 =================
const holidays = [
  { date: '2026-01-01', name: "New Year's Day" },
  { date: '2026-01-03', name: 'Duruthu Full Moon Poya Day' },
  { date: '2026-01-15', name: 'Tamil Thai Pongal Day' },
  { date: '2026-02-01', name: 'Navam Full Moon Poya Day' },
  { date: '2026-02-04', name: 'Sri Lanka Independence Day / National Day' },
  { date: '2026-02-15', name: 'Mahasivarathri Day' },
  { date: '2026-03-02', name: 'Madin / Medin Full Moon Poya Day' },
  { date: '2026-03-21', name: 'Eid-ul-Fitr (Ramazan Festival Day)' },
  { date: '2026-04-01', name: 'Bak Full Moon Poya Day' },
  { date: '2026-04-03', name: 'Good Friday' },
  { date: '2026-04-13', name: 'Sinhala & Tamil New Year Eve' },
  { date: '2026-04-14', name: 'Sinhala & Tamil New Year' },
  { date: '2026-05-01', name: 'May Day / Labour Day / Vesak Full Moon Poya Day' },
  { date: '2026-05-02', name: 'Day after Vesak Full Moon Poya Day' },
  { date: '2026-05-28', name: 'Eid al-Adha (Bakrid)' },
  { date: '2026-05-30', name: 'Adhi Poson Full Moon Poya Day' },
  { date: '2026-06-29', name: 'Poson Full Moon Poya Day' },
  { date: '2026-07-29', name: 'Esala Full Moon Poya Day' },
  { date: '2026-08-26', name: "Milad-Un-Nabi (Prophet's Birthday)" },
  { date: '2026-08-27', name: 'Nikini Full Moon Poya Day' },
  { date: '2026-09-26', name: 'Binara Full Moon Poya Day' },
  { date: '2026-10-25', name: 'Vap Full Moon Poya Day' },
  { date: '2026-11-08', name: 'Deepavali' },
  { date: '2026-11-24', name: 'Il Full Moon Poya Day' },
  { date: '2026-12-23', name: 'Unduvap Full Moon Poya Day' },
  { date: '2026-12-25', name: 'Christmas Day' },
  { date: '2026-04-22', name: 'Earth Day' },
  { date: '2026-12-31', name: "New Year's Eve" },
]

export default function PatientCalendar() {
  const [date, setDate] = useState(new Date())
  const [holidayData, setHolidayData] = useState(holidays)
  const [loading, setLoading] = useState(false)

  const formatDate = (d) => d.toISOString().split('T')[0]

  // ================= SIMULATED LOADING (or API ready) =================
  useEffect(() => {
    setLoading(true)

    // simulate API delay OR replace with real fetch
    const timer = setTimeout(() => {
      setHolidayData(holidays)
      setLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  const selectedHolidays = holidayData.filter(
    (h) => h.date === formatDate(date)
  )

  const hasHolidayOnTile = (tileDate) => {
    const d = formatDate(tileDate)
    return holidayData.some((h) => h.date === d)
  }

  // ================= LOADING UI (FROM YOUR PATTERN) =================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">

          {/* Spinner */}
          <div className="w-12 h-12 border-1 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

          {/* Text */}
          <p className="text-gray-500 text-sm">
            Loading Sri Lanka holidays...
          </p>

        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 font-sans">

      {/* ================= HEADER (IMPROVED) ================= */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold">Patient Calendar</h1>

        <p className="text-sm opacity-90 mt-1">
          Holidays • 2026 Calendar
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* ================= CALENDAR ================= */}
        <div className="bg-white p-6 rounded-2xl shadow border">

          <Calendar
            onChange={setDate}
            value={date}
            className="w-full border-none mx-auto"
            tileContent={({ date: tileDate, view }) => {
              if (view === 'month' && hasHolidayOnTile(tileDate)) {
                return (
                  <div className="flex justify-center mt-1">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow"></span>
                  </div>
                )
              }
              return null
            }}
          />

          <div className="text-center text-xs text-gray-500 mt-4">
            Red dot = Holiday 
          </div>
        </div>

        {/* ================= DETAILS ================= */}
        <div className="bg-white p-6 rounded-2xl shadow border space-y-5">

          <h2 className="text-xl font-semibold text-gray-800">
            {date.toDateString()}
          </h2>

          <p className="text-sm text-gray-500">
            {selectedHolidays.length > 0
              ? `${selectedHolidays.length} holiday(s)`
              : 'No public holiday on this day'}
          </p>

          {selectedHolidays.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-4">📅</div>
              <p>No holidays today</p>
              <p className="text-xs mt-2">Select a red marked date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedHolidays.map((h, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3"
                >
                  <span className="text-2xl mt-0.5">🎉</span>
                  <div>
                    <p className="font-medium text-gray-800">
                      {h.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {h.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t text-xs text-gray-500">
            System supports holidays, Poya days, and observances.
          </div>
        </div>
      </div>
    </div>
  )
}