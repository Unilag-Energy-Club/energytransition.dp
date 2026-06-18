import { NextRequest, NextResponse } from 'next/server'
import { composeDP } from '@/lib/compose'
import { getAdminPocketBase } from '@/lib/pocketbase'

export const runtime = 'nodejs'   // sharp requires Node.js runtime (not Edge)
export const maxDuration = 30     // give enough time for image processing

export async function POST(req: NextRequest) {
  try {
    // ── 1. Parse multipart form data ─────────────────────────────────────────
    const formData = await req.formData()

    const name = formData.get('name')
    const photoFile = formData.get('photo')

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required.' },
        { status: 400 }
      )
    }

    if (!photoFile || !(photoFile instanceof File)) {
      return NextResponse.json(
        { error: 'A photo file is required.' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!photoFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Uploaded file must be an image.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB before compression)
    const MAX_BYTES = 10 * 1024 * 1024
    if (photoFile.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'Photo must be smaller than 10 MB.' },
        { status: 400 }
      )
    }

    // ── 2. Convert File → Buffer ──────────────────────────────────────────────
    const photoArrayBuffer = await photoFile.arrayBuffer()
    const photoBuffer = Buffer.from(photoArrayBuffer)

    // ── 3. Compose the DP ────────────────────────────────────────────────────
    const composedBuffer = await composeDP(photoBuffer, name.trim())

    // ── 4. Upload to PocketBase ───────────────────────────────────────────────
    const pb = await getAdminPocketBase()

    // Build a FormData payload for PocketBase SDK
    const pbFormData = new FormData()
    pbFormData.append('name', name.trim())
    pbFormData.append(
      'photo',
      new File([new Uint8Array(photoBuffer)], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' })
    )
    pbFormData.append(
      'generated_dp',
      new File([new Uint8Array(composedBuffer)], `dp_${Date.now()}.jpg`, { type: 'image/jpeg' })
    )

    const record = await pb.collection('dp_generations').create(pbFormData)

    // ── 5. Return the record ID so the client can redirect ────────────────────
    return NextResponse.json({ id: record.id }, { status: 201 })

  } catch (err: unknown) {
    console.error('[/api/generate] Error:', err)

    const message =
      err instanceof Error ? err.message : 'Something went wrong.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
