# PocketBase Setup Guide

## 1. Open your admin panel

Go to: https://unilag-energy-club-backend.up.railway.app/_/

Log in with your admin credentials.

---

## 2. Create the `dp_generations` collection

In the admin panel → **Collections** → **New collection**

| Field        | Type   | Options                        |
|--------------|--------|--------------------------------|
| `name`       | Text   | Required, Min: 1, Max: 40      |
| `photo`      | File   | Required, Max size: 10 MB      |
| `generated_dp` | File | Required, Max size: 5 MB      |

Collection name: **dp_generations**

---

## 3. Set API rules

In the collection settings → **API Rules**:

| Rule       | Value |
|------------|-------|
| List       | _(leave empty — admin only)_ |
| View       | `""` (allow all — so the result page can fetch by ID) |
| Create     | `""` (allow all — so users can submit without logging in) |
| Update     | _(leave empty — admin only)_ |
| Delete     | _(leave empty — admin only)_ |

> **Why open Create/View?**
> Users don't log in. The API route uses admin credentials server-side to create records.
> The result page fetches a single record by ID to display the download.

---

## 4. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_POCKETBASE_URL=https://unilag-energy-club-backend.up.railway.app
POCKETBASE_ADMIN_EMAIL=your-admin@email.com
POCKETBASE_ADMIN_PASSWORD=your-admin-password
```

---

## 5. Template image

Place your flyer template (without the yellow circle's photo placeholder) at:

```
/public/template.png
```

**Requirements:**
- Format: PNG (to preserve transparency/quality before JPEG output)
- Size: exactly **1080 × 1350 px**
- The yellow circle and name label should be baked into the template
  (the user's photo goes ON TOP of the yellow circle area)

### Calibrating the overlay positions

Open `lib/compose.ts` and update these constants to match your template:

```ts
const CIRCLE_LEFT = 62     // pixels from left edge to circle bounding box
const CIRCLE_TOP  = 300    // pixels from top edge to circle bounding box
const CIRCLE_DIAMETER = 360

const NAME_LEFT   = 62     // pixels from left to name label
const NAME_TOP    = 695    // pixels from top to name label baseline area
```

**How to measure:**
1. Open your template in Figma or Photoshop
2. Click the yellow circle → note its X, Y, W
3. Click the name label area → note its X, Y
4. Convert those values to 1080×1350 pixel space

---

## 6. Deploy (Railway)

Your Next.js app needs these env vars set in Railway:

```
NEXT_PUBLIC_POCKETBASE_URL
POCKETBASE_ADMIN_EMAIL
POCKETBASE_ADMIN_PASSWORD
```

Sharp requires the Node.js runtime. Add to your Railway service:
```
SHARP_IGNORE_GLOBAL_LIBVIPS=1
```
