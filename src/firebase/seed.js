// Momentumly — Firestore seed script
// Run once from the browser console or a standalone Node script
// to populate the Firestore collections with initial demo data.
//
// Usage (browser console while app is running):
//   import { seedAll } from './src/firebase/seed.js'
//   seedAll()

import { db } from './config'
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'

const today = new Date().toISOString().slice(0, 10)   // YYYY-MM-DD
const month = new Date().toISOString().slice(0, 7)    // YYYY-MM

// ─── Seed today's KPI metrics ─────────────────────────────────────────────────
async function seedMetrics() {
  await setDoc(doc(db, 'metrics', today), {
    todayCompletion:    84,
    monthlyCompletion:  42,
    revenue:            245000,
    pipelineValue:      1280000,
    clientsWon:         3,
    meetingsBooked:     12,
    streak:             14,
    bestChannel:        'LinkedIn',
    bestChannelConv:    4.2,
    updatedAt:          serverTimestamp(),
  })
  console.log('✅ metrics seeded')
}

// ─── Seed monthly targets ──────────────────────────────────────────────────────
async function seedTargets() {
  await setDoc(doc(db, 'targets', month), {
    arr:          50000,
    outbound:     20000,
    meetings:     20,
    clients:      5,
    content:      25,
    partnerships: 8,
    revenue:      500000,
    updatedAt:    serverTimestamp(),
  })
  console.log('✅ targets seeded')
}

// ─── Seed scorecard ───────────────────────────────────────────────────────────
async function seedScorecard() {
  await setDoc(doc(db, 'scorecard', month), {
    arr:          { current: 42500,  target: 50000,  pct: 85, status: 'on_track' },
    outbound:     { current: 12450,  target: 20000,  pct: 62, status: 'under_pace' },
    meetings:     { current: 12,     target: 20,     pct: 60, status: 'on_track' },
    clients:      { current: 3,      target: 5,      pct: 60, status: 'on_track' },
    content:      { current: 18,     target: 25,     pct: 72, status: 'on_track' },
    partnerships: { current: 4,      target: 8,      pct: 50, status: 'under_pace' },
    updatedAt:    serverTimestamp(),
  })
  console.log('✅ scorecard seeded')
}

// ─── Seed pipeline deals ──────────────────────────────────────────────────────
async function seedPipeline() {
  const deals = [
    { name: 'TechFlow AI',        stage: 'Discovery',  value: 120000, channel: 'LinkedIn' },
    { name: 'NovaBuild Corp',     stage: 'Proposal',   value: 200000, channel: 'Cold Email' },
    { name: 'Vertex Media',       stage: 'Negotiation',value: 180000, channel: 'LinkedIn' },
    { name: 'Orion Digital',      stage: 'Closed Won', value: 150000, channel: 'Partnership' },
    { name: 'Pulse Analytics',    stage: 'Discovery',  value: 90000,  channel: 'LinkedIn' },
    { name: 'ClearPath Ventures', stage: 'Proposal',   value: 250000, channel: 'Cold Email' },
    { name: 'Radix Studios',      stage: 'Closed Won', value: 85000,  channel: 'LinkedIn' },
    { name: 'Synapse Growth',     stage: 'Discovery',  value: 205000, channel: 'Partnership' },
  ]
  for (const deal of deals) {
    await addDoc(collection(db, 'pipeline'), { ...deal, createdAt: serverTimestamp() })
  }
  console.log('✅ pipeline seeded (8 deals)')
}

// ─── Seed outreach entries ────────────────────────────────────────────────────
async function seedOutreach() {
  const entries = [
    { channel: 'LinkedIn', connections: 1200, engagements: 300,  leads: 72,  calls: 22, closed: 4 },
    { channel: 'LinkedIn', connections: 1050, engagements: 260,  leads: 62,  calls: 18, closed: 3 },
    { channel: 'LinkedIn', connections: 980,  engagements: 240,  leads: 55,  calls: 20, closed: 4 },
    { channel: 'LinkedIn', connections: 1100, engagements: 280,  leads: 68,  calls: 25, closed: 5 },
    { channel: 'Cold Email', connections: 3000, engagements: 420, leads: 85, calls: 18, closed: 2 },
    { channel: 'Cold Email', connections: 2800, engagements: 390, leads: 78, calls: 16, closed: 2 },
  ]
  for (const entry of entries) {
    await addDoc(collection(db, 'outreach'), { ...entry, month, createdAt: serverTimestamp() })
  }
  console.log('✅ outreach seeded')
}

// ─── Run all ──────────────────────────────────────────────────────────────────
export async function seedAll() {
  console.log('🌱 Seeding Firestore collections...')
  await Promise.all([
    seedMetrics(),
    seedTargets(),
    seedScorecard(),
    seedPipeline(),
    seedOutreach(),
  ])
  console.log('🎉 All collections seeded successfully!')
}
