#!/usr/bin/env node
// One-off setup for a fresh Firebase project.
//
//   node scripts/bootstrap.mjs                       create the starting teams
//   node scripts/bootstrap.mjs --admin you@gmail.com  …and make that account an admin
//
// An admin must have signed in to the app once (Google or email) first,
// so their Firebase Auth account exists. Safe to run more than once.

import { readFileSync } from 'node:fs'
import { cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const STARTING_TEAMS = [
  { id: 'design', name: 'Design', description: 'Posters, social media and the KKB visual identity.' },
  { id: 'donations', name: 'Donations', description: 'Fundraising drives, donor coordination and records.' },
  { id: 'events', name: 'Events', description: 'Planning and running KKB events and drives on the ground.' },
  { id: 'tech', name: 'Tech', description: 'The KKB app, website and digital tools.' },
]

function readEnv() {
  const env = {}
  const text = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!match) continue
    let value = match[2]
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    env[match[1]] = value
  }
  return env
}

const env = readEnv()
const projectId = env.FIREBASE_ADMIN_PROJECT_ID || env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL
const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing FIREBASE_ADMIN_* values in .env.local. See .env.example.')
  process.exit(1)
}

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
const db = getFirestore()
const auth = getAuth()
const now = new Date().toISOString()

// 1. Starting teams (never overwrites existing ones)
for (const [order, team] of STARTING_TEAMS.entries()) {
  const ref = db.collection('teams').doc(team.id)
  if ((await ref.get()).exists) {
    console.log(`  team "${team.name}" already exists`)
    continue
  }
  await ref.create({
    name: team.name,
    description: team.description,
    active: true,
    leadUid: null,
    coLeadUid: null,
    order,
    createdAt: now,
  })
  console.log(`✓ created team "${team.name}"`)
}

// 2. Admins
const adminEmails = process.argv
  .slice(2)
  .flatMap((arg, i, all) => (all[i - 1] === '--admin' ? [arg] : []))

for (const email of adminEmails) {
  let user
  try {
    user = await auth.getUserByEmail(email)
  } catch {
    console.error(`✗ ${email}: no account yet. Sign in to the app once with this email, then re-run.`)
    continue
  }

  const ref = db.collection('users').doc(user.uid)
  const existing = (await ref.get()).data()
  await ref.set(
    {
      email,
      fullName: existing?.fullName || user.displayName || email.split('@')[0],
      phone: existing?.phone ?? '',
      department: existing?.department ?? '',
      batch: existing?.batch ?? '',
      skills: existing?.skills ?? [],
      requestedTeams: existing?.requestedTeams ?? [],
      orgRole: 'admin',
      status: 'active',
      teams: existing?.teams ?? {},
      ndaVersionSigned: existing?.ndaVersionSigned ?? null,
      ndaSignedAt: existing?.ndaSignedAt ?? null,
      statusReason: null,
      pendingLeaveRequestId: null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      approvedAt: existing?.approvedAt ?? now,
    },
    { merge: true }
  )
  await auth.setCustomUserClaims(user.uid, { ...(user.customClaims ?? {}), admin: true })
  console.log(`✓ ${email} is now an admin`)
}

console.log('Done.')
