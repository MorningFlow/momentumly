import { useState } from 'react'
import { useApp } from '../store/appStore'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts'

const TIME_FILTERS = ['Daily', 'Weekly', 'Monthly', 'Yearly']

export default function Analytics() {
  const { kpis, snapshots, revenueTarget, setRevenueTarget } = useApp()
  const [timeFilter, setTimeFilter] = useState('Daily')

  // Derive charts data from snapshots
  // For V1, we simply map snapshots directly for "Daily". 
  // For Weekly/Monthly we'd ideally aggregate, but let's keep it simple and just show the raw snapshot stream 
  // mapped by date. If they want true aggregations, that's a V2 feature.
  const chartData = snapshots.map(s => {
    const dataPoint = { date: s.date.slice(5), fullDate: s.date, revenue: s.revenue }
    // Flatten KPIs for the tooltip/lines
    for (const cat in s.kpis) {
      for (const key in s.kpis[cat]) {
        dataPoint[s.kpis[cat][key].label] = s.kpis[cat][key].value
      }
    }
    return dataPoint
  })

  // To show current progress, we'll build an array of all active KPIs
  const allKpis = []
  for (const cat in kpis) {
    for (const key in kpis[cat]) {
      allKpis.push({
        id: key,
        ...kpis[cat][key],
        category: cat
      })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#f0f4f8' }}>Analytics</h1>
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)', padding: '6px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {TIME_FILTERS.map(f => (
            <button key={f} onClick={() => setTimeFilter(f)} style={{
              padding: '6px 16px', borderRadius: '10px', border: 'none',
              background: timeFilter === f ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: timeFilter === f ? '#fff' : 'rgba(180, 200, 200, 0.6)',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: timeFilter === f ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Section */}
      <section style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', display: 'flex', gap: '40px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <div style={{ width: '250px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f0f4f8', marginBottom: '8px' }}>Revenue Pipeline</h2>
          <p style={{ fontSize: '13px', color: 'rgba(180, 200, 200, 0.6)', marginBottom: '32px', lineHeight: '1.5' }}>Track closed won deals against your monthly target.</p>
          
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(180, 200, 200, 0.6)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>Target</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#f0f4f8' }}>₹</span>
              <input type="number" value={revenueTarget} onChange={e => setRevenueTarget(Number(e.target.value) || 0)} style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#f0f4f8', fontSize: '20px', fontWeight: 700, outline: 'none', width: '120px', padding: '4px 0', transition: 'border-color 0.2s' }} />
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(180, 200, 200, 0.6)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>Current (Snapshot Latest)</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#52b788', letterSpacing: '-0.02em' }}>
              ₹{chartData.length ? chartData[chartData.length - 1].revenue.toLocaleString('en-IN') : 0}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: '280px' }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGradAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#52b788" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#52b788" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'rgba(180, 200, 200, 0.5)', fontSize: 11 }} axisLine={false} tickLine={false} dy={12} />
                <YAxis tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} tick={{ fill: 'rgba(180, 200, 200, 0.5)', fontSize: 11 }} axisLine={false} tickLine={false} dx={-12} />
                <Tooltip
                  contentStyle={{ background: 'rgba(10, 20, 25, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
                  itemStyle={{ color: '#f0f4f8', fontWeight: 600 }}
                  labelStyle={{ color: 'rgba(180, 200, 200, 0.6)', marginBottom: '6px' }}
                  formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#52b788" strokeWidth={3} fill="url(#revGradAnalytics)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(180, 200, 200, 0.4)', fontSize: '13px' }}>
              No snapshot data yet. Data is captured daily.
            </div>
          )}
        </div>
      </section>

      {/* KPI Current Progress (Bar Chart style view) */}
      <section style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f0f4f8', marginBottom: '24px' }}>Current KPI Completion</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {allKpis.map(kpi => {
            const pct = Math.min(100, Math.round((kpi.value / kpi.target) * 100))
            const color = kpi.category === 'sales' ? 'linear-gradient(90deg, #6d3bd7, #8b5cf6)' : kpi.category === 'content' ? 'linear-gradient(90deg, #e0a96d, #f5bd5c)' : 'linear-gradient(90deg, #44e2cd, #52b788)'
            
            return (
              <div key={kpi.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#f0f4f8' }}>{kpi.label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(180, 200, 200, 0.8)' }}>{pct}%</div>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '999px', overflow: 'hidden', marginBottom: '12px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '999px', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(180, 200, 200, 0.5)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  <span>{kpi.value} done</span>
                  <span>{kpi.target} {kpi.frequency}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

    </div>
  )
}
