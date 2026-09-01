# Project Blueprint: Rental Asset Scheduler

You are an expert full-stack developer building a rental asset scheduling application. Follow the architecture, schema, and strict development rules outlined below.

## 🛠️ Tech Stack
- **Frontend Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS, Shadcn UI
- **Database & Auth:** Supabase (PostgreSQL)
- **Calendar Engine:** FullCalendar (React Wrapper) or `@shadcn/ui` custom grid

## 🗄️ Supabase Database Schema

### 1. `r_producttype` Table
Product Type Master (e.g., 'Portable Toilets','Portable Cabin','Security Cabin', 'Vehicle').
- `id`: uuid (Primary Key, default: gen_random_uuid())
- `name`: text
- `created_at`: timestamp with time zone (default: now())
- `created_by`: text
- `is_active`: number (Required, values 0, 1 only)

### 2. `r_productcategory` Table
Product Category Master (e.g., 'Single Cabin','Portable Cabin','Security Cabin','Light Vehicle').
- `id`: uuid (Primary Key, default: gen_random_uuid())
- `name`: text
- `producttype_id`: uuid (Foreign Key -> r_producttype.id, ON DELETE CASCADE)
- `created_at`: timestamp with time zone (default: now())
- `created_by`: text
- `is_active`: number (Required, values 0, 1 only)

### 3. `r_assets` Table
Tracks the inventory available for rent.
- `id`: uuid (Primary Key, default: gen_random_uuid())
- `serial_number`: text (Required)
- `sku`: text (Required)
- `producttype_id`: uuid (Foreign Key -> r_producttype.id, ON DELETE CASCADE)
- `category_id`: uuid (Foreign Key -> r_productcategory.id, ON DELETE CASCADE)
- `color_hex`: text (default: '#3b82f6' for calendar UI rendering)
- `created_at`: timestamp with time zone (default: now())
- `created_by`: text
- `is_active`: number (Required, values 0, 1 only)

### 4. `r_bookings` Table
Tracks asset reservations.
- `id`: uuid (Primary Key, default: gen_random_uuid())
- `asset_id`: uuid (Foreign Key -> r_assets.id, ON DELETE CASCADE)
- `customer_name`: text (Required)
- `customer_email`: text
- `start_time`: timestamp with time zone (Required)
- `end_time`: timestamp with time zone (Required)
- `status`: text (Check constraint: 'pending', 'confirmed', 'active', 'returned')
- `notes`: text
- `created_at`: timestamp with time zone (default: now())
- `created_by`: text

## ⚠️ Critical Business Logic (Strict Rules)
1. **Double-Booking Prevention:** Implement a strict PostgreSQL exclusion constraint or a robust pre-insert RPC function to prevent overlapping `start_time` and `end_time` for the *same* `asset_id`.
   - Overlap logic: `(start_time, end_time) OVERLAPS (existing_start, existing_end)`
2. **Timezone Sanitization:** Ensure all calendar interactions normalize dates to UTC before saving to Supabase to prevent scheduling offsets.

## 🚀 Step-by-Step Implementation Plan

### Step 1: Database Setup
- Generate SQL migration files for the `r_producttype`,`r_productcategory`,`r_assets` and `r_bookings` tables.
- Include Row Level Security (RLS) policies allowing authenticated users full access.

### Step 2: Core Components & Layout
- Build an asset sidebar (`<AssetSidebar />`) displaying the asset list with filtering toggles.
- Build the main calendar container view (`<CalendarView />`) integrating monthly, weekly, and daily grids.
- Build three login components - admin , user and driver
- admin login to create and maintain producttype, product category and asset register.
- user login to create bookings for the assets.

### Step 3: Booking Form & Validation
- Create a modal form (`<BookingModal />`) to add/edit bookings.
- Implement client-side validation to prevent picking an end date prior to a start date.
- Wire up the form to save directly to Supabase via `@supabase/supabase-js`.

### Step 4: Real-time Sync
- Enable Supabase realtime broadcast so modifications instantly update the calendar grid across active windows.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
