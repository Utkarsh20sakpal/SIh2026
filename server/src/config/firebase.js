/**
 * firebase.js — Firestore client initialisation
 *
 * prd.md §FR-1: Fetch real-time sensor readings and belt photos from Firestore.
 * prd.md §NFR-1: Secure connection with appropriate access controls.
 * prd.md §NFR-4: Resilience — degrade gracefully if Firestore unreachable.
 *
 * PLACEHOLDER: Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * in .env to activate. Without them the module exports null and all Firestore
 * service calls fall back to mock/cached data.
 */
let db = null

try {
  const { initializeApp, cert } = require('firebase-admin/app')
  const { getFirestore }        = require('firebase-admin/firestore')

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    })
    db = getFirestore()
    console.log('[Firestore] Connected to project:', process.env.FIREBASE_PROJECT_ID)
  } else {
    console.warn('[Firestore] Credentials not set — running in mock/offline mode')
  }
} catch (err) {
  console.warn('[Firestore] firebase-admin not installed or init failed — mock mode:', err.message)
}

module.exports = { db }
