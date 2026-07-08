# 🚀 Full Software Development Pathway

A interactive full-stack learning roadmapping application designed to guide developer pathways from initial project planning to deployment and active product maintenance.

[![Live Demo](https://img.shields.io/badge/Demo-Live_Site-3b82f6?style=for-the-badge&logo=vercel)](https://software-development-path.vercel.app/)
[![Database](https://img.shields.io/badge/Database-Supabase-10b981?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Bundler](https://img.shields.io/badge/Bundler-Vite_8-f59e0b?style=for-the-badge&logo=vite)](https://vite.dev)

---

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS, Lucide React (Icons)
- **Build Tool:** Vite 8 (Ultra-fast Rust-powered bundling)
- **Database & Auth:** Supabase (PostgreSQL)
- **Deployment:** Vercel

---

## 🗺️ Architectural Pathway

The application splits the software development lifecycle into **8 distinct core phases**, dynamically rendering checklist steps and progress metrics directly from the relational database:

1. 📋 **Project Planning** — Scoping, repository initialization, and tech stack choices.
2. 🎨 **UI/UX Design** — Wireframing, layouts, and design scaling systems.
3. 💾 **Database Design** — Data modeling, schema execution, and access controls.
4. ⚙️ **Backend Development** — API design, CRUD handling, and authentication.
5. 💻 **Frontend Development** — Project scaffolding, styling setups, and UI assembly.
6. 🧪 **Testing & QA** — End-to-end testing maps, manual flows, and optimization.
7. 🚀 **Deployment** — Production environment configuration and deployment hooks.
8. 🔄 **Maintenance** — Error monitoring, iterative design, and dependency lifecycles.

---

## 🗄️ Database Schema & Architecture

The database architecture is built inside **Supabase (PostgreSQL)** and utilizes **Row Level Security (RLS)** to protect user progress tracking while keeping roadmap steps public.

```
       [development_phases] 
               │  (id)
               └───► 1 : Many 
                       │
             [development_steps] ───► (JSONB: items, tips)
                       │  (id)
                       └───► 1 : Many
                               │
                       [step_progress] ───► (Scoped via session_id)
```

### Core Relational Tables
- **`development_phases`**: Houses metadata for the 8 core lifecycle buckets (color themes, unique ordering, icons).
- **`development_steps`**: Holds specific roadmap objectives mapped to distinct phases. Leverages a flexible Postgres `JSONB` format for nested arrays of checklist requirements (`items`) and actionable advice (`tips`).
- **`step_progress`**: Securely tracks unique browser checkmarks using a distinct `session_id` filter allowing anonymous write-access while preventing cross-session tracking leaks.

---

## 🚀 Local Installation & Setup

Follow these quick commands to spin up a developer copy of the environment locally:

### 1. Clone the Repository
```bash
git clone [https://github.com/Mind67fhjk/Full-Software-Development-Path.git](https://github.com/Mind67fhjk/Full-Software-Development-Path.git)
cd Full-Software-Development-Path
```

### 2. Install Project Dependencies
```bash
npm install
```

### 3. Setup Environment Secret Profiles
Create a `.env` file in your root folder and supply your corresponding Supabase parameters extracted from your dashboard credentials:
```env
VITE_SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

### 4. Run Locally
```bash
npm run dev
```
Open your local browser environment to `http://localhost:5173` to test live interactions.
