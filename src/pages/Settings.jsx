import { useState } from 'react'
import { useApp } from '../store/appStore'
import { CustomSelect } from '../components/ui/CustomSelect'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

export default function Settings() {
  const { currency, setCurrency, revenueTarget, setRevenueTarget, channels, setChannels, statuses, setStatuses, clearAllData, kpis, updateKpiTarget, prospects, addKpi, reorderKpis } = useApp()

  const [newChannel, setNewChannel] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [showAddKpi, setShowAddKpi] = useState(false)
  const [newKpi, setNewKpi] = useState({ category: 'sales', label: '', target: 1, frequency: 'daily' })
  const [isDragging, setIsDragging] = useState(false)

  const CATEGORY_ORDER = ['sales', 'content', 'build']

  const inputStyle = {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px', padding: '10px 14px', color: '#f0f4f8', fontSize: '13px',
    outline: 'none', fontFamily: 'Inter', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
  }
  const sectionStyle = {
    background: 'rgba(255, 255, 255, 0.03)', 
    backdropFilter: isDragging ? 'none' : 'blur(16px)', 
    WebkitBackdropFilter: isDragging ? 'none' : 'blur(16px)', 
    padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    display: 'flex', flexDirection: 'column', gap: '20px',
    transition: 'backdrop-filter 0.2s'
  }

  const exportCSV = () => {
    if (!prospects.length) return alert("No data to export.")
    const headers = ['Date Added', 'Name', 'Company', 'Channel', 'Status', 'Deal Value', 'Notes']
    const rows = prospects.map(p => [p.createdAt, `"${p.name}"`, `"${p.company}"`, `"${p.channel}"`, `"${p.status}"`, p.dealValue, `"${(p.notes||'').replace(/"/g, '""')}"`])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `momentumly_prospects_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDragEnd = (result, category, metrics) => {
    setIsDragging(false)
    if (!result.destination) return
    const items = Object.entries(metrics).sort(([, a], [, b]) => (a.order ?? 999) - (b.order ?? 999) || a.label.localeCompare(b.label))
    const reorderedKeys = items.map(([k]) => k)
    
    const [moved] = reorderedKeys.splice(result.source.index, 1)
    reorderedKeys.splice(result.destination.index, 0, moved)

    reorderKpis(category, reorderedKeys)
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#f0f4f8' }}>Settings</h1>
      </div>

      {/* General */}
      <section style={sectionStyle}>
        <h2 style={{ fontSize: '16px', margin: 0, color: '#f0f4f8', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ color: '#e0a96d' }}>tune</span> General Options
        </h2>
        <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'rgba(180, 200, 200, 0.6)' }}>Currency Symbol</label>
            <input style={inputStyle} value={currency} onChange={e => setCurrency(e.target.value)} placeholder="$" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'rgba(180, 200, 200, 0.6)' }}>Monthly Revenue Target</label>
            <input style={inputStyle} type="number" value={revenueTarget} onChange={e => setRevenueTarget(Number(e.target.value))} />
          </div>
        </div>
      </section>

      {/* KPI Target Editing */}
      <section style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '16px', margin: 0, color: '#f0f4f8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: '#52b788' }}>track_changes</span> KPI Targets
          </h2>
          <button onClick={() => setShowAddKpi(true)} style={{ background: 'rgba(82, 183, 136, 0.1)', border: '1px solid rgba(82, 183, 136, 0.2)', color: '#52b788', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }} className="glass-panel-hover">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span> Add KPI
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(kpis)
            .sort(([a], [b]) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b))
            .map(([category, metrics]) => (
            <div key={category}>
              <h3 style={{ fontSize: '14px', color: 'rgba(180, 200, 200, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>{category}</h3>
              <DragDropContext onDragStart={handleDragStart} onDragEnd={(result) => handleDragEnd(result, category, metrics)}>
                <Droppable droppableId={`droppable-${category}`}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {Object.entries(metrics)
                        .sort(([, a], [, b]) => (a.order ?? 999) - (b.order ?? 999) || a.label.localeCompare(b.label))
                        .map(([key, metric], index) => (
                        <Draggable key={key} draggableId={key} index={index}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef} 
                              {...provided.draggableProps} 
                              style={{ 
                                ...provided.draggableProps.style,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', 
                                background: snapshot.isDragging ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.2)', 
                                borderRadius: '12px',
                                boxShadow: snapshot.isDragging ? '0 8px 32px rgba(0,0,0,0.3)' : 'none'
                              }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span {...provided.dragHandleProps} className="material-symbols-outlined" style={{ color: 'rgba(255,255,255,0.2)', cursor: 'grab', fontSize: '20px' }}>drag_indicator</span>
                                <div style={{ fontSize: '14px', color: '#f0f4f8' }}>{metric.label}</div>
                              </div>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <input 
                                  type="number" 
                                  style={{ ...inputStyle, width: '80px', padding: '8px' }} 
                                  value={metric.target} 
                                  onChange={e => updateKpiTarget(category, key, e.target.value, metric.frequency)} 
                                />
                                <CustomSelect 
                                  style={{ ...inputStyle, padding: '8px 12px', width: '120px' }} 
                                  value={metric.frequency} 
                                  onChange={v => updateKpiTarget(category, key, metric.target, v)}
                                  options={[
                                    { label: 'Daily', value: 'daily' },
                                    { label: 'Weekly', value: 'weekly' },
                                    { label: 'Monthly', value: 'monthly' }
                                  ]}
                                />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          ))}
        </div>
      </section>

      {/* CRM Config */}
      <section style={sectionStyle}>
        <h2 style={{ fontSize: '16px', margin: 0, color: '#f0f4f8', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ color: '#d0bcff' }}>list_alt</span> Pipeline Customization
        </h2>
        
        <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Channels */}
          <div>
            <h3 style={{ fontSize: '14px', color: 'rgba(180, 200, 200, 0.8)', marginBottom: '12px' }}>Lead Channels</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {channels.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '13px' }}>
                  {c}
                  <span className="material-symbols-outlined glass-panel-hover" style={{ fontSize: '16px', cursor: 'pointer', color: '#ffb4ab' }} onClick={() => setChannels(channels.filter(ch => ch !== c))}>close</span>
                </div>
              ))}
            </div>
            <form onSubmit={e => { e.preventDefault(); if (newChannel && !channels.includes(newChannel)) { setChannels([...channels, newChannel]); setNewChannel('') } }} style={{ display: 'flex', gap: '8px' }}>
              <input style={{...inputStyle, flex: 1}} placeholder="New Channel..." value={newChannel} onChange={e => setNewChannel(e.target.value)} />
              <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0 16px', borderRadius: '10px', cursor: 'pointer' }}>Add</button>
            </form>
          </div>

          {/* Statuses */}
          <div>
            <h3 style={{ fontSize: '14px', color: 'rgba(180, 200, 200, 0.8)', marginBottom: '12px' }}>Pipeline Statuses</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {statuses.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '13px' }}>
                  {s}
                  <span className="material-symbols-outlined glass-panel-hover" style={{ fontSize: '16px', cursor: 'pointer', color: '#ffb4ab' }} onClick={() => setStatuses(statuses.filter(st => st !== s))}>close</span>
                </div>
              ))}
            </div>
            <form onSubmit={e => { e.preventDefault(); if (newStatus && !statuses.includes(newStatus)) { setStatuses([...statuses, newStatus]); setNewStatus('') } }} style={{ display: 'flex', gap: '8px' }}>
              <input style={{...inputStyle, flex: 1}} placeholder="New Status..." value={newStatus} onChange={e => setNewStatus(e.target.value)} />
              <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0 16px', borderRadius: '10px', cursor: 'pointer' }}>Add</button>
            </form>
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section style={{ ...sectionStyle, border: '1px solid rgba(255,180,171,0.2)' }}>
        <h2 style={{ fontSize: '16px', margin: 0, color: '#ffb4ab', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined">warning</span> Data Management
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(180, 200, 200, 0.6)', margin: 0 }}>
          Export your data for backup, or permanently delete everything on this device.
        </p>
        <div className="mobile-col" style={{ display: 'flex', gap: '16px' }}>
          <button onClick={exportCSV} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f4f8', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span> Export CSV
          </button>
          <button onClick={clearAllData} style={{ flex: 1, background: 'rgba(255,180,171,0.1)', border: '1px solid rgba(255,180,171,0.2)', color: '#ffb4ab', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete_forever</span> Factory Reset
          </button>
        </div>
      </section>

      {/* Add KPI Modal */}
      {showAddKpi && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="mobile-modal-content" style={{ background: 'rgba(6, 13, 19, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '40px', width: '440px', boxShadow: '0 24px 64px rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '20px', color: '#f0f4f8' }}>Add New KPI</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              if (!newKpi.label) return
              addKpi(newKpi.category, newKpi.label, newKpi.target, newKpi.frequency)
              setShowAddKpi(false)
              setNewKpi({ category: 'sales', label: '', target: 1, frequency: 'daily' })
            }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'rgba(180, 200, 200, 0.6)' }}>KPI Name</label>
                <input style={inputStyle} placeholder="e.g. DMs Sent" required value={newKpi.label} onChange={e => setNewKpi({...newKpi, label: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'rgba(180, 200, 200, 0.6)' }}>Category</label>
                <CustomSelect 
                  style={{ ...inputStyle, width: '100%' }} 
                  value={newKpi.category} 
                  onChange={v => setNewKpi({...newKpi, category: v})}
                  options={[
                    { label: 'Sales', value: 'sales' },
                    { label: 'Content', value: 'content' },
                    { label: 'Build', value: 'build' }
                  ]}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <label style={{ fontSize: '13px', color: 'rgba(180, 200, 200, 0.6)' }}>Target</label>
                  <input style={inputStyle} type="number" required value={newKpi.target} onChange={e => setNewKpi({...newKpi, target: e.target.value})} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <label style={{ fontSize: '13px', color: 'rgba(180, 200, 200, 0.6)' }}>Frequency</label>
                  <CustomSelect 
                    style={{ ...inputStyle, width: '100%' }} 
                    value={newKpi.frequency} 
                    onChange={v => setNewKpi({...newKpi, frequency: v})}
                    options={[
                      { label: 'Daily', value: 'daily' },
                      { label: 'Weekly', value: 'weekly' },
                      { label: 'Monthly', value: 'monthly' }
                    ]}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowAddKpi(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f4f8', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, background: 'linear-gradient(135deg, #2DD4BF, #52b788)', border: 'none', color: '#060d13', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 16px rgba(45, 212, 191, 0.3)' }}>Add KPI</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
