# Elaja - Development Pathway

Elaja is a public-facing React + Vite + Supabase project that combines a personal portfolio style landing page with a roadmap / progress tracker.

## Features

- Custom branded hero section with an `E` favicon and Elaja title
- About Me card styled for a clean public portfolio presentation
- Supabase-backed development roadmap with phases, steps, and progress tracking
- Step detail modal for notes and completion tracking
- Responsive UI built with Tailwind CSS and Lucide icons

## Tech Stack

- React 18
- TypeScript
- Vite 8
- Tailwind CSS
- Supabase
- Lucide React

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local environment file:

   ```bash
   cp .env.example .env
   ```

3. Add your Supabase credentials to `.env`:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

## Supabase Setup

1. Create a new Supabase project.
2. Open the SQL Editor.
3. Run the migration in [supabase/migrations/20260708104747_create_development_pathway.sql](supabase/migrations/20260708104747_create_development_pathway.sql).
4. Copy the project URL and anon key into your `.env` file.

## Vercel Deployment

1. Push the repository to GitHub.
2. Import the repo into Vercel.
3. Use the Vite framework preset.
4. Set the build command to `npm run build`.
5. Set the output directory to `dist`.
6. Add these environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy the project.

## Scripts

- `npm run dev` - start local development server
- `npm run build` - create production build
- `npm run preview` - preview the built app locally
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript checks

## Repository Notes

- `.env` is ignored and should stay private.
- The app expects Supabase environment variables to be present at build time.
- The public-facing UI is branded as Elaja and should not include Bolt branding.