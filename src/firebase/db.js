// Momentumly — Firestore data service
// Central module for all reads/writes to Firestore
//
// Collections:
//   /metrics/{YYYY-MM-DD}   — daily KPI snapshots
//   /pipeline/{dealId}      — CRM deals
//   /outreach/{entryId}     — outreach log entries
//   /targets/{YYYY-MM}      — monthly targets
//   /scorecard/{YYYY-MM}    — monthly scorecard metrics
//   /users/{uid}            — user profiles

import {
  doc, collection,
  getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, limit, where,
  serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from './config'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const todayKey  = () => new Date().toISOString().slice(0, 10)  // "YYYY-MM-DD"
export const monthKey  = () => new Date().toISOString().slice(0, 7)   // "YYYY-MM"

// ─── Metrics (daily KPIs) ─────────────────────────────────────────────────────

/** Get today's metric snapshot */
export async function getMetrics(dateKey = todayKey()) {
  const snap = await getDoc(doc(db, 'metrics', dateKey))
  return snap.exists() ? snap.data() : null
}

/** Save / merge today's metric snapshot */
export async function saveMetrics(data, dateKey = todayKey()) {
  await setDoc(doc(db, 'metrics', dateKey), { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

/** Live listener for today's metrics */
export function listenMetrics(dateKey = todayKey(), callback) {
  return onSnapshot(doc(db, 'metrics', dateKey), snap => callback(snap.exists() ? snap.data() : null))
}

// ─── Pipeline (CRM deals) ─────────────────────────────────────────────────────

/** Get all pipeline deals */
export async function getPipeline() {
  const snap = await getDocs(query(collection(db, 'pipeline'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/** Add a new deal */
export async function addDeal(deal) {
  return addDoc(collection(db, 'pipeline'), { ...deal, createdAt: serverTimestamp() })
}

/** Update a deal */
export async function updateDeal(dealId, data) {
  return updateDoc(doc(db, 'pipeline', dealId), { ...data, updatedAt: serverTimestamp() })
}

/** Delete a deal */
export async function deleteDeal(dealId) {
  return deleteDoc(doc(db, 'pipeline', dealId))
}

/** Live listener for all deals */
export function listenPipeline(callback) {
  const q = query(collection(db, 'pipeline'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

// ─── Outreach ─────────────────────────────────────────────────────────────────

/** Get all outreach entries for a month */
export async function getOutreach(monthKey_ = monthKey()) {
  const q = query(collection(db, 'outreach'), where('month', '==', monthKey_), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/** Add outreach entry */
export async function addOutreachEntry(entry) {
  return addDoc(collection(db, 'outreach'), {
    ...entry,
    month: monthKey(),
    createdAt: serverTimestamp(),
  })
}

// ─── Targets ──────────────────────────────────────────────────────────────────

/** Get monthly targets */
export async function getTargets(monthKey_ = monthKey()) {
  const snap = await getDoc(doc(db, 'targets', monthKey_))
  return snap.exists() ? snap.data() : null
}

/** Set monthly targets */
export async function saveTargets(targets, monthKey_ = monthKey()) {
  return setDoc(doc(db, 'targets', monthKey_), { ...targets, updatedAt: serverTimestamp() }, { merge: true })
}

/** Live listener for targets */
export function listenTargets(monthKey_ = monthKey(), callback) {
  return onSnapshot(doc(db, 'targets', monthKey_), snap => callback(snap.exists() ? snap.data() : null))
}

// ─── Scorecard ────────────────────────────────────────────────────────────────

/** Get this month's scorecard */
export async function getScorecard(monthKey_ = monthKey()) {
  const snap = await getDoc(doc(db, 'scorecard', monthKey_))
  return snap.exists() ? snap.data() : null
}

/** Save / merge scorecard data */
export async function saveScorecard(data, monthKey_ = monthKey()) {
  return setDoc(doc(db, 'scorecard', monthKey_), { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

/** Live listener for scorecard */
export function listenScorecard(monthKey_ = monthKey(), callback) {
  return onSnapshot(doc(db, 'scorecard', monthKey_), snap => callback(snap.exists() ? snap.data() : null))
}

// ─── User profile ─────────────────────────────────────────────────────────────

/** Get user profile */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

/** Create / update user profile */
export async function saveUserProfile(uid, data) {
  return setDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true })
}
