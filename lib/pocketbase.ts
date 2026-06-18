import PocketBase from 'pocketbase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DpGenerationRecord {
  id: string
  name: string
  photo: string         // filename stored in PocketBase
  generated_dp: string  // filename stored in PocketBase
  created: string
  collectionId: string
  collectionName: string
}

// ─── Client (browser-safe, public URL only) ───────────────────────────────────

let _pb: PocketBase | null = null

export function getPocketBase(): PocketBase {
  if (!_pb) {
    _pb = new PocketBase(
      process.env.NEXT_PUBLIC_POCKETBASE_URL ||
        'https://unilag-energy-club-backend.up.railway.app'
    )
  }
  return _pb
}

// ─── Server-side admin client (API routes only) ───────────────────────────────

export async function getAdminPocketBase(): Promise<PocketBase> {
  const pb = new PocketBase(
    process.env.NEXT_PUBLIC_POCKETBASE_URL ||
      'https://unilag-energy-club-backend.up.railway.app'
  )

  await pb.admins.authWithPassword(
    process.env.POCKETBASE_ADMIN_EMAIL!,
    process.env.POCKETBASE_ADMIN_PASSWORD!
  )

  return pb
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Get the full URL of a file stored in PocketBase.
 * Works both server-side and client-side.
 */
export function getFileUrl(
  record: DpGenerationRecord,
  filename: string
): string {
  const base =
    process.env.NEXT_PUBLIC_POCKETBASE_URL ||
    'https://unilag-energy-club-backend.up.railway.app'
  return `${base}/api/files/${record.collectionName}/${record.id}/${filename}`
}
