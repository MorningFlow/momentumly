import { useState } from 'react'
import { useApp } from '../store/appStore'
import { GlowCard } from '../components/ui/spotlight-card'

export default function Dashboard() {
  const { kpis, revenue, clientsWonCount, activeProspectsCount, todaysCompletionPct, updateKpiValue, setKpiValueExact, currency } = useApp()

  const renderCategory = (category, metrics) => {
    let icon = 'task'
    if (category === 'sales') icon = 'campaign'
    if (category === 'content') icon = 'edit_document'
    if (category === 'build') icon = 'construction'

    return (
      <section key={category} style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#f0f4f8', textTransform: 'capitalize', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#e0a96d' }}>{icon}</span>
          {category}
        </h2>
        <GlowCard glowColor="teal" style={{ 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)', 
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', 
          border: '1px solid rgba(255, 255, 255, 0.04)',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px', overflow: 'hidden', 
          boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' 
        }}>
          {Object.entries(metrics).map(([key, metric], index) => {
            const isLast = index === Object.keys(metrics).length - 1
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
                  
                  {/* Actions */}
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
                </div>

                {/* Compact Progress Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ flex: 1, height: '6px', background: 'rgba(0,0,0,0.4)', borderRadius: '999px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)' }}>
                    <div style={{ width: `${progressPct}%`, height: '100%', background: progressPct >= 100 ? 'linear-gradient(90deg, #2DD4BF, #52b788)' : 'linear-gradient(90deg, #6d3bd7, #8b5cf6)', borderRadius: '999px', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 10px rgba(82, 183, 136, 0.3)' }} />
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

  return (
    <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', maxWidth: '1400px', margin: '0 auto', alignItems: 'flex-start', position: 'relative' }}>
      
      {/* COLUMN 1 (Left): Sales */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {kpis.sales && renderCategory('sales', kpis.sales)}
      </div>

      {/* COLUMN 2 (Center): Content + Build */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {kpis.content && renderCategory('content', kpis.content)}
        {kpis.build && renderCategory('build', kpis.build)}
      </div>

      {/* COLUMN 3 (Right): Top Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Top Summary */}
        <section style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#f0f4f8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#52b788' }}>monitoring</span>
            Top Summary
          </h2>
          <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { label: 'Revenue', value: `${currency}${revenue.toLocaleString()}`, color: '#52b788', icon: 'payments' },
              { label: 'Clients Won', value: clientsWonCount, color: '#e0a96d', icon: 'verified' },
              { label: 'Active Prospects', value: activeProspectsCount, color: '#d0bcff', icon: 'groups' },
              { label: "Today's Completion", value: `${todaysCompletionPct}%`, color: '#f0f4f8', icon: 'task_alt' },
            ].map(kpi => (
              <GlowCard key={kpi.label} glowColor="teal" style={{ 
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)', 
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', 
                border: '1px solid rgba(255,255,255,0.04)', 
                borderTop: '1px solid rgba(255,255,255,0.15)',
                borderLeft: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', 
                boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'rgba(180, 200, 200, 0.6)' }}>{kpi.icon}</span>
                  <div style={{ fontSize: '13px', color: 'rgba(180, 200, 200, 0.8)' }}>{kpi.label}</div>
                </div>
                <div style={{ fontSize: '26px', fontWeight: 600, color: kpi.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{kpi.value}</div>
              </GlowCard>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
