import { useState } from 'react'
import { useApp } from '../store/appStore'
import { CustomSelect } from '../components/ui/CustomSelect'

export default function Prospects() {
  const { prospects, addProspect, updateProspect, deleteProspect, channels, statuses, currency } = useApp()
  const [search, setSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // Simple Add Prospect State
  const [showAdd, setShowAdd] = useState(false)
  const [newProspect, setNewProspect] = useState({ name: '', company: '', channel: channels[0] || '', status: statuses[0] || '', dealValue: '', notes: '' })

  // Notes State
  const [editingNotesId, setEditingNotesId] = useState(null)

  const filtered = prospects.filter(p => {
    if (channelFilter !== 'All' && p.channel !== channelFilter) return false
    if (statusFilter !== 'All' && p.status !== statusFilter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.company.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newProspect.name) return
    addProspect({ ...newProspect, dealValue: Number(newProspect.dealValue) || 0 })
    setShowAdd(false)
    setNewProspect({ name: '', company: '', channel: channels[0] || '', status: statuses[0] || '', dealValue: '', notes: '' })
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px', padding: '10px 14px', color: '#f0f4f8', fontSize: '13px',
    outline: 'none', fontFamily: 'Inter', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#f0f4f8' }}>Prospects</h1>
        <button onClick={() => setShowAdd(true)} style={{ background: 'linear-gradient(135deg, #2DD4BF, #52b788)', border: 'none', borderRadius: '12px', padding: '12px 20px', color: '#060d13', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 16px rgba(45, 212, 191, 0.3)', transition: 'all 0.2s' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> Add Prospect
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 10, background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <input 
          type="text" placeholder="Search name or company..." 
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        <CustomSelect 
          value={channelFilter} onChange={setChannelFilter} 
          style={{...inputStyle, minWidth: '160px'}}
          options={[{label: 'All Channels', value: 'All'}, ...channels.map(c => ({label: c, value: c}))]}
        />
        <CustomSelect 
          value={statusFilter} onChange={setStatusFilter} 
          style={{...inputStyle, minWidth: '160px'}}
          options={[{label: 'All Statuses', value: 'All'}, ...statuses.map(s => ({label: s, value: s}))]}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', fontSize: '12px', color: 'rgba(180, 200, 200, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Company</th>
              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Channel</th>
              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Value</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: 'rgba(180, 200, 200, 0.4)' }}>No prospects found.</td>
              </tr>
            ) : filtered.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '14px', transition: 'background 0.2s' }} className="glass-panel-hover">
                <td style={{ padding: '16px 20px', fontWeight: 500, color: '#f0f4f8' }}>{p.name}</td>
                <td style={{ padding: '16px 20px', color: 'rgba(180, 200, 200, 0.8)' }}>{p.company}</td>
                <td style={{ padding: '16px 20px' }}>
                  <CustomSelect 
                    value={p.channel} onChange={v => updateProspect(p.id, { channel: v })} 
                    style={{ ...inputStyle, padding: '6px 10px', fontSize: '13px', background: 'transparent', boxShadow: 'none' }}
                    options={channels.map(c => ({label: c, value: c}))}
                  />
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <CustomSelect 
                    value={p.status} onChange={v => updateProspect(p.id, { status: v })} 
                    style={{ ...inputStyle, padding: '6px 10px', fontSize: '13px', background: 'transparent', boxShadow: 'none', color: p.status === 'Won' ? '#52b788' : p.status === 'Lost' ? '#ffb4ab' : '#f0f4f8' }}
                    options={statuses.map(s => ({label: s, value: s}))}
                  />
                </td>
                <td style={{ padding: '16px 20px', fontVariantNumeric: 'tabular-nums' }}>
                  <input type="number" value={p.dealValue} onChange={e => updateProspect(p.id, { dealValue: e.target.value })} style={{ ...inputStyle, padding: '6px 10px', fontSize: '13px', width: '90px', background: 'transparent', boxShadow: 'none' }} />
                </td>
                <td style={{ padding: '16px 20px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => setEditingNotesId(p.id)} style={{ background: 'none', border: 'none', color: 'rgba(180, 200, 200, 0.8)', cursor: 'pointer', padding: '6px', borderRadius: '8px', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }} className="glass-panel-hover" title="Edit Notes">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit_note</span>
                  </button>
                  <button onClick={() => deleteProspect(p.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,180,171,0.6)', cursor: 'pointer', padding: '6px', borderRadius: '8px', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }} className="glass-panel-hover" title="Delete">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'rgba(6, 13, 19, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '40px', width: '440px', boxShadow: '0 24px 64px rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '20px', color: '#f0f4f8' }}>Add Prospect</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input style={inputStyle} placeholder="Name *" required value={newProspect.name} onChange={e => setNewProspect({...newProspect, name: e.target.value})} />
              <input style={inputStyle} placeholder="Company" value={newProspect.company} onChange={e => setNewProspect({...newProspect, company: e.target.value})} />
              <div style={{ display: 'flex', gap: '16px' }}>
                <CustomSelect 
                  style={{...inputStyle, flex: 1}} 
                  value={newProspect.channel} onChange={v => setNewProspect({...newProspect, channel: v})}
                  options={channels.map(c => ({label: c, value: c}))}
                />
                <CustomSelect 
                  style={{...inputStyle, flex: 1}} 
                  value={newProspect.status} onChange={v => setNewProspect({...newProspect, status: v})}
                  options={statuses.map(s => ({label: s, value: s}))}
                />
              </div>
              <input style={inputStyle} type="number" placeholder={`Deal Value (${currency})`} value={newProspect.dealValue} onChange={e => setNewProspect({...newProspect, dealValue: e.target.value})} />
              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f4f8', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, background: 'linear-gradient(135deg, #2DD4BF, #52b788)', border: 'none', color: '#060d13', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 16px rgba(45, 212, 191, 0.3)' }}>Save Prospect</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Notes Modal */}
      {editingNotesId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'rgba(6, 13, 19, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '40px', width: '500px', boxShadow: '0 24px 64px rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '20px', color: '#f0f4f8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: '#52b788', fontSize: '24px' }}>edit_note</span>
              Notes for {prospects.find(p => p.id === editingNotesId)?.name}
            </h2>
            <textarea 
              autoFocus
              defaultValue={prospects.find(p => p.id === editingNotesId)?.notes || ''}
              style={{ ...inputStyle, width: '100%', minHeight: '150px', resize: 'vertical', lineHeight: '1.5' }}
              placeholder="Add your notes here..."
              onKeyDown={e => {
                if (e.key === 'Escape') setEditingNotesId(null)
              }}
              id="notes-input"
            />
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button onClick={() => setEditingNotesId(null)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f4f8', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Close</button>
              <button 
                onClick={() => {
                  updateProspect(editingNotesId, { notes: document.getElementById('notes-input').value })
                  setEditingNotesId(null)
                }} 
                style={{ flex: 1, background: 'linear-gradient(135deg, #2DD4BF, #52b788)', border: 'none', color: '#060d13', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 16px rgba(45, 212, 191, 0.3)' }}
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
