import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AppContext = createContext(null)

// ── helpers ──────────────────────────────────────────────────────────────────
function todayKey() {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

function getStartOfWeek(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  return new Date(d.setDate(diff)).toISOString().slice(0, 10)
}

function getStartOfMonth(date = new Date()) {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(`momentumly_v1_${key}`)
    return raw !== null ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function save(key, value) {
  localStorage.setItem(`momentumly_v1_${key}`, JSON.stringify(value))
}

// ── defaults ──────────────────────────────────────────────────────────────────
const DEFAULT_KPIS = {
  sales: {
    linkedinConnections: { label: 'LinkedIn Connections', value: 0, target: 20, frequency: 'daily' },
    linkedinConversations: { label: 'LinkedIn Conversations', value: 0, target: 10, frequency: 'daily' },
    coldEmails: { label: 'Cold Emails', value: 0, target: 50, frequency: 'daily' },
    agencyOutreach: { label: 'Agency Outreach', value: 0, target: 5, frequency: 'daily' },
    followUps: { label: 'Follow-ups', value: 0, target: 10, frequency: 'daily' },
    discoveryCalls: { label: 'Discovery Calls', value: 0, target: 3, frequency: 'weekly' },
    proposalsSent: { label: 'Proposals Sent', value: 0, target: 2, frequency: 'weekly' },
    dealsClosed: { label: 'Deals Closed', value: 0, target: 4, frequency: 'monthly' }
  },
  content: {
    linkedinPosts: { label: 'LinkedIn Posts', value: 0, target: 1, frequency: 'daily' },
    videosPublished: { label: 'Videos Published', value: 0, target: 2, frequency: 'weekly' }
  },
  build: {
    caseStudies: { label: 'Case Studies', value: 0, target: 1, frequency: 'monthly' },
    offersCompleted: { label: 'Offers Completed', value: 0, target: 1, frequency: 'monthly' },
    websiteProgress: { label: 'Website Progress (%)', value: 0, target: 100, frequency: 'monthly' }
  }
}

// ── provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [kpis, setKpisState] = useState(() => load('kpis', DEFAULT_KPIS))
  const [prospects, setProspectsState] = useState(() => load('prospects', []))
  const [snapshots, setSnapshotsState] = useState(() => load('snapshots', []))
  const [revenueTarget, setRevenueTarget] = useState(() => load('revenueTarget', 25000))
  const [currency, setCurrency] = useState(() => load('currency', '₹'))
  const [channels, setChannels] = useState(() => load('channels', ['LinkedIn', 'Cold Email', 'Referral', 'Agency', 'Website', 'Other']))
  const [statuses, setStatuses] = useState(() => load('statuses', ['New', 'Contacted', 'Replied', 'Meeting', 'Proposal Sent', 'Won', 'Lost']))
  const [lastDates, setLastDates] = useState(() => load('lastDates', {
    daily: todayKey(),
    weekly: getStartOfWeek(),
    monthly: getStartOfMonth()
  }))

  // Initialization & Rollover Logic
  useEffect(() => {
    const today = todayKey()
    const thisWeek = getStartOfWeek()
    const thisMonth = getStartOfMonth()

    if (lastDates.daily !== today) {
      // 1. Take snapshot of yesterday
      setSnapshotsState(prev => {
        const rev = prospects.filter(p => p.status === 'Won').reduce((acc, p) => acc + Number(p.dealValue || 0), 0)
        const activePros = prospects.filter(p => !['Won', 'Lost'].includes(p.status)).length
        const snapshot = {
          date: lastDates.daily, // record it under yesterday's date
          kpis,
          revenue: rev,
          activeProspects: activePros
        }
        return [...prev, snapshot]
      })

      // 2. Reset values based on frequency boundaries crossed
      setKpisState(prev => {
        const next = JSON.parse(JSON.stringify(prev)) // deep copy
        for (const cat in next) {
          for (const key in next[cat]) {
            const freq = next[cat][key].frequency
            if (freq === 'daily' || 
               (freq === 'weekly' && lastDates.weekly !== thisWeek) ||
               (freq === 'monthly' && lastDates.monthly !== thisMonth)) {
              next[cat][key].value = 0
            }
          }
        }
        return next
      })

      // 3. Update last dates
      setLastDates({ daily: today, weekly: thisWeek, monthly: thisMonth })
    }
  }, []) // run once on mount

  // Persistence
  useEffect(() => { save('kpis', kpis) }, [kpis])
  useEffect(() => { save('prospects', prospects) }, [prospects])
  useEffect(() => { save('snapshots', snapshots) }, [snapshots])
  useEffect(() => { save('revenueTarget', revenueTarget) }, [revenueTarget])
  useEffect(() => { save('currency', currency) }, [currency])
  useEffect(() => { save('channels', channels) }, [channels])
  useEffect(() => { save('statuses', statuses) }, [statuses])
  useEffect(() => { save('lastDates', lastDates) }, [lastDates])

  // ── actions ────────────────────────────────────────────────────────────────
  const updateKpiValue = useCallback((category, key, amount) => {
    setKpisState(prev => {
      const next = { ...prev, [category]: { ...prev[category] } }
      const currentVal = Number(next[category][key].value) || 0
      next[category][key] = {
        ...next[category][key],
        value: Math.max(0, currentVal + amount)
      }
      return next
    })
  }, [])

  const setKpiValueExact = useCallback((category, key, exactValue) => {
    setKpisState(prev => {
      const next = { ...prev, [category]: { ...prev[category] } }
      
      let val = 0
      if (exactValue === '') {
        val = '' // Allow backspacing the 0
      } else {
        const parsed = parseInt(exactValue, 10)
        val = isNaN(parsed) ? 0 : Math.max(0, parsed)
      }

      next[category][key] = {
        ...next[category][key],
        value: val
      }
      return next
    })
  }, [])

  const updateKpiTarget = useCallback((category, key, target, frequency) => {
    setKpisState(prev => {
      const next = { ...prev, [category]: { ...prev[category] } }
      next[category][key] = {
        ...next[category][key],
        target: Number(target) || 1,
        frequency
      }
      return next
    })
  }, [])

  const addKpi = useCallback((category, label, target, frequency) => {
    setKpisState(prev => {
      const next = { ...prev, [category]: { ...prev[category] } }
      let key = label.replace(/[^a-zA-Z0-9]/g, '')
      if (!key) key = `kpi${Date.now()}`
      key = key.charAt(0).toLowerCase() + key.slice(1)
      while (next[category][key]) {
        key += Math.floor(Math.random() * 10)
      }
      next[category][key] = { label, value: 0, target: Number(target) || 1, frequency }
      return next
    })
  }, [])

  // Prospect Actions
  const addProspect = useCallback((prospect) => {
    const newProspect = { ...prospect, id: Date.now().toString(), createdAt: todayKey() }
    setProspectsState(prev => [newProspect, ...prev])
  }, [])

  const updateProspect = useCallback((id, updates) => {
    setProspectsState(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  const deleteProspect = useCallback((id) => {
    setProspectsState(prev => prev.filter(p => p.id !== id))
  }, [])

  const clearAllData = useCallback(() => {
    if (window.confirm("Are you absolutely sure? This will wipe all data and reset the app to factory settings.")) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('momentumly_v1_')) localStorage.removeItem(key)
      })
      window.location.reload()
    }
  }, [])

  // ── derived ────────────────────────────────────────────────────────────────
  const revenue = prospects.filter(p => p.status === 'Won').reduce((acc, p) => acc + Number(p.dealValue || 0), 0)
  const activeProspectsCount = prospects.filter(p => !['Won', 'Lost'].includes(p.status)).length
  const clientsWonCount = prospects.filter(p => p.status === 'Won').length

  // Calculate today's completion %
  let totalDailyTarget = 0
  let totalDailyCompleted = 0
  for (const cat in kpis) {
    for (const key in kpis[cat]) {
      const k = kpis[cat][key]
      if (k.frequency === 'daily') {
        totalDailyTarget += k.target
        totalDailyCompleted += Math.min(k.value, k.target)
      }
    }
  }
  const todaysCompletionPct = totalDailyTarget > 0 ? Math.round((totalDailyCompleted / totalDailyTarget) * 100) : 0

  return (
    <AppContext.Provider value={{
      kpis, prospects, snapshots, revenueTarget, currency, channels, statuses,
      revenue, activeProspectsCount, clientsWonCount, todaysCompletionPct,
      setRevenueTarget, setCurrency, setChannels, setStatuses,
      updateKpiValue, setKpiValueExact, updateKpiTarget, addKpi,
      addProspect, updateProspect, deleteProspect, clearAllData
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
