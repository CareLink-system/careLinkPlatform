import React from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/context/AuthContext'
import { getRoleLabel, normalizeRole } from '../../features/auth/utils/roleRouting'

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
      {children}
    </span>
  )
}

function StatCard({ stat }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{stat.label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">{stat.value}</h3>
          <p className="mt-1 text-sm text-slate-500">{stat.description}</p>
        </div>
        <div className="rounded-full bg-[#4B9AA8]/10 px-3 py-1 text-xs font-bold text-[#4B9AA8]">{stat.delta}</div>
      </div>
    </div>
  )
}

function SectionCard({ title, subtitle, children, action }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {action ? <span className="text-sm font-semibold text-[#4B9AA8]">{action}</span> : null}
      </div>
      {children}
    </section>
  )
}

export default function RoleDashboardContent({ config }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const role = normalizeRole(user?.role)
  const displayName = user?.firstName || 'There'
  const roleLabel = getRoleLabel(role)

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-[100vw] overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p className="text-xs md:text-sm font-medium text-slate-500 mb-1">Hi, {displayName}</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{config.title}</h1>
          <p className="mt-2 max-w-2xl text-sm md:text-base text-slate-500">{config.subtitle}</p>
        </div>
        <Badge>{roleLabel} Portal</Badge>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-4xl bg-linear-to-r from-[#7DA1A9] to-[#9CB8C0] p-5 md:p-8 shadow-sm"
      >
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div className="max-w-2xl">
            <Badge>{config.heroBadge}</Badge>
            <h2 className="mt-4 text-[1.3rem] sm:text-2xl md:text-3xl font-bold leading-snug text-white">
              {config.heroTitle}
            </h2>
            <p className="mt-3 text-sm md:text-base text-white/80">{config.heroCopy}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {config.heroTags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Today</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {config.heroStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/12 p-3 text-white">
                  <div className="text-2xl font-extrabold tracking-tight">{stat.value}</div>
                  <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        <div className="xl:col-span-8 flex flex-col gap-6 md:gap-8 min-w-0">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {config.stats.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
            </div>
          </motion.div>

          <SectionCard title={config.focusTitle} subtitle={config.focusSubtitle} action={config.focusAction}>
            <div className="grid gap-3 sm:grid-cols-2">
              {config.focusItems.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                    </div>
                    <span className="rounded-full bg-[#4B9AA8]/10 px-2.5 py-1 text-[11px] font-bold text-[#4B9AA8]">{item.meta}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={config.actionsTitle} subtitle={config.actionsSubtitle}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {config.actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => action.to && navigate(action.to)}
                  className="rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="text-lg">{action.icon}</div>
                  <h4 className="mt-3 text-sm font-bold text-slate-900">{action.label}</h4>
                  <p className="mt-1 text-xs text-slate-500">{action.description}</p>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-6 min-w-0">
          <SectionCard title={config.activityTitle} subtitle={config.activitySubtitle}>
            <div className="space-y-3">
              {config.activity.map((item) => (
                <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#4B9AA8]/10 text-[#4B9AA8]">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={config.summaryTitle} subtitle={config.summarySubtitle}>
            <div className="grid gap-3">
              {config.summaryItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{item.value}</p>
                  </div>
                  <div className="text-xs font-semibold text-[#4B9AA8]">{item.note}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}