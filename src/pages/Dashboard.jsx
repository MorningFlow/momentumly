import { useState, useMemo } from 'react'
import { useApp } from '../store/appStore'
import { GlowCard } from '../components/ui/spotlight-card'

// ── helpers ──────────────────────────────────────────────────────────────────
function dateKey(d) {
  return d.toISOString().slice(0, 10)
}

function buildDayWindow(numDays = 14) {
  const days = []
  const today = new Date()
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d)
  }
  return days
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ── component ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { kpis, snapshots, revenue, clientsWonCount, activeProspectsCount, todaysCompletionPct, updateKpiValue, setKpiValueExact, currency } = useApp()

  const todayStr = dateKey(new Date())
  const [selectedDay, setSelectedDay] = useState(todayStr)

  const days = useMemo(() => buildDayWindow(14), [])

  // Snapshot lookup: { 'YYYY-MM-DD': snapshotData }
  const snapshotMap = useMemo(() => {
    const map = {}
    snapshots.forEach(s => { if (s.date) map[s.date] = s })
    return map
  }, [snapshots])

  const isToday = selectedDay === todayStr
  const snapshot = !isToday ? snapshotMap[selectedDay] : null

  // The KPI data to display — live or historical
  const displayKpis = isToday ? kpis : (snapshot ? snapshot.kpis : null)
  const displayRevenue = isToday ? revenue : (snapshot ? snapshot.revenue : null)
  const displayActiveProspects = isToday ? activeProspectsCount : (snapshot ? snapshot.activeProspects : null)

  // ── render KPI category ──────────────────────────────────────────────────
  const renderCategory = (category, metrics, readOnly) => {
    let icon = 'task'
    if (category === 'sales') icon = 'campaign'
    if (category === 'content') icon = 'edit_document'
    if (category === 'build') icon = 'construction'

    return (
      <section key={category} style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#f0f4f8', textTransform: 'capitalize', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#e0a96d' }}>{icon}</span>
          {category}
          {readOnly && (
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#e0a96d', background: 'rgba(224,169,109,0.12)', border: '1px solid rgba(224,169,109,0.25)', borderRadius: '6px', padding: '2px 8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              snapshot
            </span>
          )}
        </h2>
        <GlowCard glowColor="teal" style={{
          background: readOnly
            ? 'linear-gradient(135deg, rgba(224,169,109,0.06) 0%, rgba(255,255,255,0.01) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: readOnly ? '1px solid rgba(224,169,109,0.15)' : '1px solid rgba(255,255,255,0.04)',
          borderTop: readOnly ? '1px solid rgba(224,169,109,0.3)' : '1px solid rgba(255,255,255,0.15)',
          borderLeft: readOnly ? '1px solid rgba(224,169,109,0.2)' : '1px solid rgba(255,255,255,0.12)',
          borderRadius: '24px', overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}>
          {Object.entries(metrics)
            .sort(([, a], [, b]) => (a.order ?? 999) - (b.order ?? 999) || a.label.localeCompare(b.label))
            .map(([key, metric], index, array) => {
              const isLast = index === array.length - 1
              const progressPct = Math.min(100, Math.round((metric.value / metric.target) * 100))
              return (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 24px', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>

                  {/* Header & Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 500, color: '#f0f4f8', letterSpacing: '0.01em' }}>{metric.label}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(180, 200, 200, 0.6)', marginTop: '4px' }}>
                        Target: {metric.target} ({metric.frequency})
                      </div>
                    </div>

                    {/* Live controls or read-only value */}
                    {readOnly ? (
                      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(224,169,109,0.1)', border: '1px solid rgba(224,169,109,0.2)', borderRadius: '10px', padding: '6px 16px', minWidth: '60px', justifyContent: 'center' }}>
                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#e0a96d', fontVariantNumeric: 'tabular-nums' }}>{metric.value}</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.03)', borderTop: '1px solid rgba(0,0,0,0.5)', borderLeft: '1px solid rgba(0,0,0,0.3)', borderRadius: '10px', padding: '2px', boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.3)' }}>
                        <button onClick={() => updateKpiValue(category, key, -1)} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'rgba(180, 200, 200, 0.6)', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s' }} className="glass-panel-hover">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
                        </button>
                        <input
                          type="number"
                          value={metric.value}
                          onChange={(e) => setKpiValueExact(category, key, e.target.value)}
                          style={{ width: '40px', textAlign: 'center', background: 'transparent', border: 'none', color: '#f0f4f8', fontSize: '15px', fontWeight: 600, outline: 'none', WebkitAppearance: 'none', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                        />
                        <button onClick={() => updateKpiValue(category, key, 1)} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#52b788', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s' }} className="glass-panel-hover">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(0,0,0,0.4)', borderRadius: '999px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)' }}>
                      <div style={{
                        width: `${progressPct}%`, height: '100%',
                        background: readOnly
                          ? 'linear-gradient(90deg, #c98a2e, #e0a96d)'
                          : progressPct >= 100 ? 'linear-gradient(90deg, #2DD4BF, #52b788)' : 'linear-gradient(90deg, #6d3bd7, #8b5cf6)',
                        borderRadius: '999px', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 10px rgba(82, 183, 136, 0.3)'
                      }} />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(180, 200, 200, 0.8)', width: '32px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                      {progressPct}%
                    </div>
                  </div>
                </div>
              )
            })}
        </GlowCard>
      </section>
    )
  }

  // ── summary card values ──────────────────────────────────────────────────
  const snapshotCompletionPct = useMemo(() => {
    if (!snapshot?.kpis) return 0
    let totalTarget = 0, totalCompleted = 0
    for (const cat in snapshot.kpis) {
      for (const key in snapshot.kpis[cat]) {
        const k = snapshot.kpis[cat][key]
        if (k.frequency === 'daily') {
          totalTarget += k.target
          totalCompleted += Math.min(k.value, k.target)
        }
      }
    }
    return totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0
  }, [snapshot])

  const summaryCards = isToday
    ? [
        { label: 'Revenue', value: `${currency}${revenue.toLocaleString()}`, color: '#52b788', icon: 'payments' },
        { label: 'Clients Won', value: clientsWonCount, color: '#e0a96d', icon: 'verified' },
        { label: 'Active Prospects', value: activeProspectsCount, color: '#d0bcff', icon: 'groups' },
        { label: "Today's Completion", value: `${todaysCompletionPct}%`, color: '#f0f4f8', icon: 'task_alt' },
      ]
    : snapshot
      ? [
          { label: 'Revenue (Snapshot)', value: `${currency}${(displayRevenue ?? 0).toLocaleString()}`, color: '#e0a96d', icon: 'payments' },
          { label: 'Active Prospects', value: displayActiveProspects ?? '—', color: '#d0bcff', icon: 'groups' },
          { label: "Day's Completion", value: `${snapshotCompletionPct}%`, color: '#f0f4f8', icon: 'task_alt' },
          { label: 'Snapshot Date', value: selectedDay, color: 'rgba(180,200,200,0.6)', icon: 'event' },
        ]
      : []

  // ── date strip ────────────────────────────────────────────────────────────
  const renderDateStrip = () => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px',
      padding: '10px 16px', overflowX: 'auto', scrollbarWidth: 'none',
      marginBottom: '0'
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'rgba(180,200,200,0.5)', flexShrink: 0, marginRight: '4px' }}>calendar_today</span>
      {days.map(d => {
        const key = dateKey(d)
        const isT = key === todayStr
        const isSel = key === selectedDay
        const hasSnap = !!snapshotMap[key]
        const dayLabel = DAY_LABELS[d.getDay()]
        const dateNum = d.getDate()
        const isPast = key < todayStr

        let bg = 'transparent'
        let color = 'rgba(180,200,200,0.45)'
        let border = '1px solid transparent'
        let dotColor = 'transparent'

        if (isT) {
          bg = isSel ? 'rgba(45,212,191,0.18)' : 'rgba(45,212,191,0.08)'
          color = '#2DD4BF'
          border = `1px solid ${isSel ? 'rgba(45,212,191,0.5)' : 'rgba(45,212,191,0.2)'}`
        } else if (isSel) {
          bg = 'rgba(224,169,109,0.14)'
          color = '#e0a96d'
          border = '1px solid rgba(224,169,109,0.4)'
        } else if (hasSnap) {
          color = 'rgba(180,200,200,0.75)'
          dotColor = '#52b788'
        } else if (isPast) {
          color = 'rgba(180,200,200,0.3)'
        }

        return (
          <button
            key={key}
            onClick={() => setSelectedDay(key)}
            title={key}
            style={{
              flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              padding: '6px 10px', borderRadius: '10px', cursor: 'pointer',
              background: bg, border, color,
              transition: 'all 0.2s ease', position: 'relative',
              minWidth: '42px'
            }}
          >
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.8 }}>{isT ? 'Today' : dayLabel}</span>
            <span style={{ fontSize: '15px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{dateNum}</span>
            {/* dot indicator for days with snapshot data */}
            <span style={{
              width: '4px', height: '4px', borderRadius: '50%',
              background: hasSnap && !isT ? dotColor : 'transparent',
              transition: 'background 0.2s'
            }} />
          </button>
        )
      })}
    </div>
  )

  // ── no data state ─────────────────────────────────────────────────────────
  const renderNoData = () => (
    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', gap: '16px', opacity: 0.6 }}>
      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'rgba(180,200,200,0.4)' }}>event_busy</span>
      <div style={{ fontSize: '16px', fontWeight: 500, color: 'rgba(180,200,200,0.6)' }}>No snapshot for {selectedDay}</div>
      <div style={{ fontSize: '13px', color: 'rgba(180,200,200,0.4)' }}>Snapshots are saved automatically at end of each day</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto' }}>

      {/* ── Date Navigator Strip ── */}
      {renderDateStrip()}

      {/* ── Status badge when viewing past day ── */}
      {!isToday && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', background: 'rgba(224,169,109,0.08)', border: '1px solid rgba(224,169,109,0.2)', borderRadius: '12px', fontSize: '13px', color: '#e0a96d' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>history</span>
          Viewing snapshot for <strong>{selectedDay}</strong> — read-only. Switch back to{' '}
          <button onClick={() => setSelectedDay(todayStr)} style={{ background: 'none', border: 'none', color: '#2DD4BF', cursor: 'pointer', fontSize: '13px', fontWeight: 600, padding: 0, textDecoration: 'underline' }}>Today</button>
          {' '}to log activity.
        </div>
      )}

      {/* ── KPI Grid ── */}
      <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', alignItems: 'flex-start', position: 'relative' }}>

        {!isToday && !snapshot ? (
          renderNoData()
        ) : (
          <>
            {/* COLUMN 1: Sales */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {displayKpis?.sales && renderCategory('sales', displayKpis.sales, !isToday)}
            </div>

            {/* COLUMN 2: Content + Build */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {displayKpis?.content && renderCategory('content', displayKpis.content, !isToday)}
              {displayKpis?.build && renderCategory('build', displayKpis.build, !isToday)}
            </div>

            {/* COLUMN 3: Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <section style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#f0f4f8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#52b788' }}>monitoring</span>
                  Top Summary
                </h2>
                <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {summaryCards.map(kpi => (
                    <GlowCard key={kpi.label} glowColor="teal" style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
                      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      borderTop: '1px solid rgba(255,255,255,0.15)',
                      borderLeft: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
                      boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'rgba(180,200,200,0.6)' }}>{kpi.icon}</span>
                        <div style={{ fontSize: '13px', color: 'rgba(180,200,200,0.8)' }}>{kpi.label}</div>
                      </div>
                      <div style={{ fontSize: '26px', fontWeight: 600, color: kpi.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{kpi.value}</div>
                    </GlowCard>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
