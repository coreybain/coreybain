# Personal Site V2 Finish TODO

## Goal
Close the gap between the current implementation and the original v2 plan.

## Priority 1: Core Plan Gaps

- [ ] Move public site content from static in-repo data to Convex-backed queries.
  - Replace reads from `src/lib/site/content.ts` with Convex queries for profile, capabilities, experience, projects, posts, experiments, and site settings.
  - Keep only seed data or migration helpers in local files if needed.

- [ ] Build real admin CRUD for projects.
  - Replace the placeholder table in `src/app/admin/projects/page.tsx`.
  - Add create, edit, publish/unpublish, feature/unfeature, and sort controls.
  - Persist to the `projects` table in Convex.

- [ ] Build real admin CRUD for posts.
  - Replace the placeholder table in `src/app/admin/posts/page.tsx`.
  - Add create, edit, publish/unpublish, and tagging flows.
  - Persist to the `posts` table in Convex.

- [ ] Build real admin settings editing.
  - Replace the static cards in `src/app/admin/settings/page.tsx`.
  - Add form controls for headline, subheadline, availability, location, socials, and featured content curation.
  - Persist to `siteSettings` and related tables in Convex.

- [ ] Add admin management for experience entries and capabilities.
  - Create routes or embed sections in admin for editing `experienceEntries` and `capabilities`.
  - Support ordering and publish-safe updates.

- [ ] Implement publish-time AI knowledge indexing.
  - Populate `aiKnowledgeDocuments` from published projects, posts, and key page content.
  - Add embedding generation and storage.
  - Add re-index logic when content is created, updated, published, or unpublished.

- [ ] Switch Ask Corey retrieval to use `aiKnowledgeDocuments`.
  - Replace the current lexical matcher in `src/lib/ai/knowledge.ts`.
  - Retrieve from Convex-backed indexed knowledge with citations to canonical site URLs.

- [ ] Send contact notifications via Resend.
  - Trigger email notification after `contactSubmissions` are created.
  - Configure target email via env and/or site settings.

## Priority 2: UX And Product Completion

- [ ] Make the AI contact brief editable before submission.
  - Let visitors revise summary/goals/scope/next steps.
  - Store both original input and the edited AI brief.

- [ ] Add admin workflow actions for messages.
  - Mark as `new`, `replied`, or `archived`.
  - Show original inquiry plus AI brief plus matched projects/posts.

- [ ] Add CRUD for experiments if keeping `/experiments`.
  - If not enough content exists, decide whether to hide or remove the route for now.

- [ ] Make homepage curation fully data-driven.
  - Pull featured projects/posts/experiments from settings instead of hardcoded selection logic.

## Priority 3: Security, Reliability, And AI Safeguards

- [ ] Add rate limiting to `/api/ask`.
- [ ] Add rate limiting to `/api/contact/brief`.
- [ ] Add bot protection to `/contact`.
  - Example options: Turnstile, hCaptcha, or similar.

- [ ] Add request guardrails for AI calls.
  - Token caps
  - Timeout limits
  - Safe fallback responses

- [ ] Add structured logging for AI operations.
  - Log failures, latency, and approximate token usage.
  - Keep logs lightweight and privacy-aware.

- [ ] Decide whether to require Vercel AI Gateway in all environments.
  - Current code falls back to direct Anthropic if `AI_GATEWAY_API_KEY` is missing.
  - If strict plan compliance is desired, remove the fallback and require Gateway everywhere.

## Priority 4: SEO And Metadata

- [ ] Add route-level metadata for key public pages.
  - `/`
  - `/about`
  - `/work`
  - `/work/[slug]`
  - `/blog`
  - `/blog/[slug]`
  - `/ask`
  - `/contact`

- [ ] Add Open Graph metadata for public routes.

- [ ] Add JSON-LD structured data.
  - `Person` for home/about
  - `BlogPosting` or `Article` for blog posts
  - `SoftwareApplication` or `CreativeWork` for project pages

## Priority 5: Auth Architecture Cleanup

- [ ] Decide whether to add middleware/proxy-based admin protection.
  - Current protection is page-level and works.
  - Add middleware only if you want to match the original plan more closely.

- [ ] Add sign-out and session management affordances in admin/auth UI.

## Cleanup And Verification

- [ ] Remove remaining placeholder copy that implies unfinished wiring.
  - `src/app/admin/projects/page.tsx`
  - `src/app/admin/posts/page.tsx`
  - `src/app/admin/settings/page.tsx`

- [ ] Re-run full verification after each major milestone.
  - `pnpm exec tsc --noEmit`
  - `pnpm exec next build`

- [ ] Fix the existing ESLint flat-config compatibility warning seen during build.

## Suggested Implementation Order

1. Convex-backed content queries and admin CRUD
2. AI knowledge indexing and Ask Corey retrieval migration
3. Contact notifications and editable AI brief
4. Message workflow actions and remaining admin surfaces
5. AI safeguards and bot protection
6. SEO, JSON-LD, and final polish

## Definition Of Done

- [ ] Public content is sourced from Convex, not static files.
- [ ] Admin can manage projects, posts, settings, experience, and capabilities.
- [ ] Ask Corey uses indexed knowledge documents with citations.
- [ ] Contact flow stores submissions, sends notifications, and supports editable briefs.
- [ ] AI endpoints have basic abuse protection and operational guardrails.
- [ ] Route-level metadata and structured data are in place.
- [ ] Typecheck and production build pass cleanly.
