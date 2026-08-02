import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth, db } from '../firebase/config'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, collection, onSnapshot, setDoc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore'

const AppContext = createContext(null)

// ── helpers ──────────────────────────────────────────────────────────────────
function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function getStartOfWeek(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff)).toISOString().slice(0, 10)
}

function getStartOfMonth(date = new Date()) {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
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

const DEFAULT_CHANNELS = ['LinkedIn', 'Cold Email', 'Referral', 'Agency', 'Website', 'Other']
const DEFAULT_STATUSES = ['New', 'Contacted', 'Replied', 'Meeting', 'Proposal Sent', 'Won', 'Lost']
const ALLOWED_EMAIL = 'morningflow10@gmail.com'

// ── provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)

  const [kpis, setKpisState] = useState(DEFAULT_KPIS)
  const [prospects, setProspectsState] = useState([])
  const [snapshots, setSnapshotsState] = useState([])
  const [revenueTarget, setRevenueTargetState] = useState(25000)
  const [currency, setCurrencyState] = useState('₹')
  const [channels, setChannelsState] = useState(DEFAULT_CHANNELS)
  const [statuses, setStatusesState] = useState(DEFAULT_STATUSES)
  const [lastDates, setLastDatesState] = useState({ daily: todayKey(), weekly: getStartOfWeek(), monthly: getStartOfMonth() })

  // 1. Auth Listener
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (u && u.email === ALLOWED_EMAIL) {
        setUser(u)
      } else {
        if (u) await signOut(auth)
        setUser(null)
        setDataLoading(false)
      }
      setAuthLoading(false)
    })
  }, [])

  // 2. Firestore Sync Listeners
  useEffect(() => {
    if (!user) return

    const uid = user.uid
    const userDocRef = doc(db, 'users', uid)
    const prospectsRef = collection(db, 'users', uid, 'prospects')
    const snapshotsRef = collection(db, 'users', uid, 'snapshots')

    const unsubUser = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        setKpisState(data.kpis || DEFAULT_KPIS)
        setRevenueTargetState(data.revenueTarget || 25000)
        setCurrencyState(data.currency || '₹')
        setChannelsState(data.channels || DEFAULT_CHANNELS)
        setStatusesState(data.statuses || DEFAULT_STATUSES)
        setLastDatesState(data.lastDates || { daily: todayKey(), weekly: getStartOfWeek(), monthly: getStartOfMonth() })
      } else {
        setDoc(userDocRef, {
          kpis: DEFAULT_KPIS,
          revenueTarget: 25000,
          currency: '₹',
          channels: DEFAULT_CHANNELS,
          statuses: DEFAULT_STATUSES,
          lastDates: { daily: todayKey(), weekly: getStartOfWeek(), monthly: getStartOfMonth() }
        })
      }
    })

    const unsubProspects = onSnapshot(prospectsRef, (snap) => {
      setProspectsState(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    const unsubSnapshots = onSnapshot(snapshotsRef, (snap) => {
      setSnapshotsState(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setDataLoading(false) // Data is ready!
    })

    return () => {
      unsubUser()
      unsubProspects()
      unsubSnapshots()
    }
  }, [user])

  // 3. Rollover Logic
  useEffect(() => {
    if (dataLoading || !user || prospects.length === 0) return

    const today = todayKey()
    const thisWeek = getStartOfWeek()
    const thisMonth = getStartOfMonth()

    if (lastDates.daily !== today) {
      const rev = prospects.filter(p => p.status === 'Won').reduce((acc, p) => acc + Number(p.dealValue || 0), 0)
      const activePros = prospects.filter(p => !['Won', 'Lost'].includes(p.status)).length
      
      // Save snapshot
      addDoc(collection(db, 'users', user.uid, 'snapshots'), {
        date: lastDates.daily,
        kpis,
        revenue: rev,
        activeProspects: activePros
      })

      // Reset KPIs
      const nextKpis = JSON.parse(JSON.stringify(kpis))
      for (const cat in nextKpis) {
        for (const key in nextKpis[cat]) {
          const freq = nextKpis[cat][key].frequency
          if (freq === 'daily' || 
             (freq === 'weekly' && lastDates.weekly !== thisWeek) ||
             (freq === 'monthly' && lastDates.monthly !== thisMonth)) {
            nextKpis[cat][key].value = 0
          }
        }
      }

      updateDoc(doc(db, 'users', user.uid), {
        kpis: nextKpis,
        lastDates: { daily: today, weekly: thisWeek, monthly: thisMonth }
      })
    }
  }, [lastDates, prospects, dataLoading, user, kpis])


  // ── actions ────────────────────────────────────────────────────────────────
  const setRevenueTarget = useCallback((val) => {
    if (!user) return
    updateDoc(doc(db, 'users', user.uid), { revenueTarget: val })
  }, [user])

  const setCurrency = useCallback((val) => {
    if (!user) return
    updateDoc(doc(db, 'users', user.uid), { currency: val })
  }, [user])

  const setChannels = useCallback((val) => {
    if (!user) return
    updateDoc(doc(db, 'users', user.uid), { channels: val })
  }, [user])

  const setStatuses = useCallback((val) => {
    if (!user) return
    updateDoc(doc(db, 'users', user.uid), { statuses: val })
  }, [user])

  const updateKpiValue = useCallback((category, key, amount) => {
    if (!user) return
    const currentVal = Number(kpis[category][key].value) || 0
    const newVal = Math.max(0, currentVal + amount)
    
    // Optimistic
    setKpisState(prev => {
      const next = { ...prev, [category]: { ...prev[category] } }
      next[category][key].value = newVal
      return next
    })

    // Cloud sync
    updateDoc(doc(db, 'users', user.uid), {
      [`kpis.${category}.${key}.value`]: newVal
    })
  }, [user, kpis])

  const setKpiValueExact = useCallback((category, key, exactValue) => {
    if (!user) return
    let val = 0
    if (exactValue === '') {
      val = '' 
    } else {
      const parsed = parseInt(exactValue, 10)
      val = isNaN(parsed) ? 0 : Math.max(0, parsed)
    }

    setKpisState(prev => {
      const next = { ...prev, [category]: { ...prev[category] } }
      next[category][key].value = val
      return next
    })

    if (val !== '') {
      updateDoc(doc(db, 'users', user.uid), {
        [`kpis.${category}.${key}.value`]: val
      })
    }
  }, [user])

  const updateKpiTarget = useCallback((category, key, target, frequency) => {
    if (!user) return
    const numTarget = Number(target) || 1
    updateDoc(doc(db, 'users', user.uid), {
      [`kpis.${category}.${key}.target`]: numTarget,
      [`kpis.${category}.${key}.frequency`]: frequency
    })
  }, [user])

  const addKpi = useCallback((category, label, target, frequency) => {
    if (!user) return
    let key = label.replace(/[^a-zA-Z0-9]/g, '')
    if (!key) key = `kpi${Date.now()}`
    key = key.charAt(0).toLowerCase() + key.slice(1)
    while (kpis[category][key]) {
      key += Math.floor(Math.random() * 10)
    }
    updateDoc(doc(db, 'users', user.uid), {
      [`kpis.${category}.${key}`]: { label, value: 0, target: Number(target) || 1, frequency }
    })
  }, [user, kpis])

  // Prospect Actions
  const addProspect = useCallback((prospect) => {
    if (!user) return
    addDoc(collection(db, 'users', user.uid, 'prospects'), {
      ...prospect,
      createdAt: todayKey()
    })
  }, [user])

  const updateProspect = useCallback((id, updates) => {
    if (!user) return
    updateDoc(doc(db, 'users', user.uid, 'prospects', id), updates)
  }, [user])

  const deleteProspect = useCallback((id) => {
    if (!user) return
    deleteDoc(doc(db, 'users', user.uid, 'prospects', id))
  }, [user])

  const clearAllData = useCallback(async () => {
    if (!user) return
    if (window.confirm("Are you absolutely sure? This will wipe all cloud data and reset the app to factory settings.")) {
      // Very naive clear all for now: reset user doc and delete prospects
      await setDoc(doc(db, 'users', user.uid), {
        kpis: DEFAULT_KPIS,
        revenueTarget: 25000,
        currency: '₹',
        channels: DEFAULT_CHANNELS,
        statuses: DEFAULT_STATUSES,
        lastDates: { daily: todayKey(), weekly: getStartOfWeek(), monthly: getStartOfMonth() }
      })
      prospects.forEach(p => deleteDoc(doc(db, 'users', user.uid, 'prospects', p.id)))
      snapshots.forEach(s => deleteDoc(doc(db, 'users', user.uid, 'snapshots', s.id)))
    }
  }, [user, prospects, snapshots])

  // ── derived ────────────────────────────────────────────────────────────────
  const revenue = prospects.filter(p => p.status === 'Won').reduce((acc, p) => acc + Number(p.dealValue || 0), 0)
  const activeProspectsCount = prospects.filter(p => !['Won', 'Lost'].includes(p.status)).length
  const clientsWonCount = prospects.filter(p => p.status === 'Won').length

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

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  return (
    <AppContext.Provider value={{
      user, authLoading, dataLoading,
      kpis, prospects, snapshots, revenueTarget, currency, channels, statuses,
      revenue, activeProspectsCount, clientsWonCount, todaysCompletionPct,
      setRevenueTarget, setCurrency, setChannels, setStatuses,
      updateKpiValue, setKpiValueExact, updateKpiTarget, addKpi,
      addProspect, updateProspect, deleteProspect, clearAllData, logout
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
