# Context: "DO OR DIE" Personal Task Tracker PWA

## Overview
"DO OR DIE" is a production-grade, mobile-first daily task checklist Progressive Web App (PWA) designed for home-screen installation on iOS and Android. It enforces a high-stakes, disciplined daily schedule divided into two operational phases:
1. **Phase 1: "Crunch Week" (Oct 26 – Nov 2, 2026)**: Non-recurring, dated daily milestones with hard deadlines (CS50 alternating, LeetCode rotation, Pwn.college, Cold-mail-bot, NLM+PyTorch, and Customer Churn Model with deadline Nov 2).
2. **Phase 2: "Steady State" (Nov 3, 2026 onward)**: Daily recurring weekday/weekend engines, rotating 2.5-hour deep-work blocks, LeetCode topic rotation tracker, and an automated Sunday Rollover Engine with a 2-week escalation cap.

## Architecture
- **Framework**: Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide Icons.
- **Database**: PostgreSQL (`pg` pool) compatible with Vercel Postgres / Neon / Supabase, with automatic local SQLite / zero-config fallback for offline development.
- **PWA**: Web App Manifest (`manifest.webmanifest`), Service Worker (`public/sw.js`) with offline caching and Web Push notification support.
- **Push Engine**: VAPID-based Web Push (`web-push`) with scheduled Vercel Crons for evening pending checks and Sunday morning catch-up nudges.
- **Security**: Single-user PIN / password session gate via `middleware.ts` and `httpOnly` secure cookies.
- **Deployment**: Zero-downtime Vercel deployment hooked into GitHub `main` branch.
