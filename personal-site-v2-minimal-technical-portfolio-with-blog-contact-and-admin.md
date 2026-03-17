# Personal Site V2: Minimal Technical Portfolio With Blog, Contact, and Admin

## Summary
Replace the current single-screen homepage with a minimal, elegant, system-theme portfolio site that is optimized for showcasing your work first, while also supporting a public blog, an AI-powered contact flow for work inquiries, a grounded “Ask Corey” experience, a stronger proof-of-experience layer, and an admin-only CMS backed by Convex for content/data, Better Auth for authentication/session management, and Vercel AI SDK for AI interactions.

Chosen defaults for this plan:
- Primary goal: project showcase
- Visual direction: technical minimal
- Public structure: homepage hub + detail pages
- Content model: Convex CMS from day one
- Auth scope: admin only
- Work presentation: concise case studies with outbound demo links
- Contact flow: on-site form, stored in Convex, with email notifications
- AI features: grounded “Ask Corey” + AI-assisted contact brief
- AI integration: Vercel AI SDK + Vercel AI Gateway
- Proof layer: structured experience, richer case studies, and visible AI credibility
- Theme behavior: system light/dark only, no manual toggle in v1

## Product Shape
Public routes:
- `/` home hub
- `/ask` Ask Corey page
- `/work` project index
- `/work/[slug]` project case study
- `/blog` blog index
- `/blog/[slug]` blog post
- `/contact` contact page
- `/about` short profile/resume-style page
- `/experiments` optional AI/engineering experiments page if enough content exists by launch

Protected routes:
- `/auth/sign-in` Better Auth sign-in page
- `/admin` dashboard landing
- `/admin/projects` manage projects
- `/admin/posts` manage blog posts
- `/admin/messages` manage contact submissions
- `/admin/settings` manage hero copy, social links, availability, featured items

## Experience Design
Design direction:
- Quiet, technical, and editorial rather than “startup landing page”
- Left-aligned layouts, strong typography, restrained accents, generous whitespace
- Use Tailwind with CSS variables and `light-dark()` / `prefers-color-scheme` driven tokens
- Avoid repeated cards, blur-heavy UI, gradient hero patterns, and over-centered layouts
- Keep motion subtle: fade/slide reveals, hover refinement, no decorative animation

Homepage structure:
- Compact hero with name, role, and one sharp sentence about the work you do
- Capabilities strip that emphasizes principal/lead engineering, product delivery, AI integration, SaaS systems, and Apple-platform breadth
- Selected work list with 3-4 featured projects
- Ask Corey preview with 2-3 suggested prompts and a link to the full Ask Corey page
- Latest writing preview with 2-3 recent posts
- Short profile strip: experience, current focus, availability
- Small differentiator section for memorable proof points such as `npx coreybaines`, experiments, OSS, or notable side projects
- Primary CTA cluster: “View work”, “Read writing”, “Contact”
- Footer with email, GitHub, LinkedIn, and optional app/store/demo links

About page structure:
- Concise positioning summary focused on principal/lead full-stack engineering
- Experience timeline covering leadership, architecture, delivery, and platform breadth
- Capabilities section spanning TypeScript/JavaScript, Java, Swift/SwiftUI/Objective-C, SaaS architecture, CI/CD, and mentoring
- Current focus section including AI product integration, product engineering, and selected ongoing work
- Optional links to public profile sources such as GitHub and LinkedIn

Ask Corey experience:
- Dedicated `/ask` page with a minimal chat-style interface
- Suggested prompts focused on hiring fit, architecture experience, AI work, leadership, and relevant projects
- Answers must be grounded only in published site content and return citations linking to the relevant work/about/blog pages
- If the answer is not supported by site content, the assistant should say so plainly and suggest nearby content instead of inventing details

AI-powered contact experience:
- `/contact` starts with one freeform prompt: “What are you trying to build?”
- AI turns the message into a concise project brief before final submission
- The brief includes inferred goals, likely scope, urgency cues, and the most relevant projects/posts from your site
- The visitor can edit the generated brief before submitting
- Final submission stores both the original message and the AI-refined brief

## Content Model
Convex tables / entities:
- `projects`
  - `slug`, `title`, `tagline`, `summary`, `body`, `role`, `period`, `status`
  - `stack: string[]`
  - `outcomes: string[]`
  - `impactMetrics?: string[]`
  - `teamContext?: string`
  - `responsibilities?: string[]`
  - `audience?: string`
  - `lessonsLearned?: string[]`
  - `media?: { type: "image" | "video", src: string, alt: string }[]`
  - `links: { live?, repo?, store?, video? }`
  - `featured: boolean`
  - `published: boolean`
  - `sortOrder: number`
- `posts`
  - `slug`, `title`, `excerpt`, `body`, `coverImage?`, `tags: string[]`
  - `publishedAt`, `updatedAt`
  - `published: boolean`
  - `seoTitle?`, `seoDescription?`
- `contactSubmissions`
  - `name`, `email`, `company?`, `website?`, `message`
  - `aiBrief?`, `matchedProjectSlugs?: string[]`, `matchedPostSlugs?: string[]`
  - `status: "new" | "replied" | "archived"`
  - `createdAt`
- `siteSettings`
  - `headline`, `subheadline`, `availability`, `location?`
  - `socialLinks`
  - `featuredProjectSlugs`
  - `featuredPostSlugs`
- `experienceEntries`
  - `company`, `title`, `startDate`, `endDate?`, `summary`
  - `highlights: string[]`
  - `skills: string[]`
  - `sortOrder: number`
- `capabilities`
  - `slug`, `title`, `summary`, `proofPoints: string[]`
- `experiments`
  - `slug`, `title`, `summary`, `body`, `published`
  - `tags: string[]`
  - `links: { live?, repo?, post? }`
  - `featured: boolean`
- `aiKnowledgeDocuments`
  - `sourceType: "project" | "post" | "page"`
  - `sourceSlug`, `title`, `url`, `plainText`
  - `published: boolean`
  - `embedding`
  - `updatedAt`

Better Auth component-managed auth/session data:
- Users, accounts, sessions, and verification records managed through Better Auth’s Convex integration via `@convex-dev/better-auth`

## Public Interfaces
Key UI/data interfaces:
- `ProjectCard`
  - title, tagline, role, period, primary link, status
- `ProjectDetail`
  - hero meta, summary, outcomes, tech stack, narrative body, outbound links
- `ExperienceEntry`
  - company, title, dates, summary, highlights, skills
- `CapabilityHighlight`
  - title, summary, proofPoints
- `PostCard`
  - title, excerpt, date, tags
- `AskCoreyMessage`
  - `role: "user" | "assistant"`, `content`, `citations?: { title, url }[]`
- `AskCoreyAnswer`
  - `answer`, `citations`, `followUpPrompts?: string[]`
- `ContactFormInput`
  - `name`, `email`, `company?`, `website?`, `message`
- `ContactBriefPreview`
  - `summary`, `goals`, `scopeSignals`, `matchedProjects`, `matchedPosts`
- `SiteSettings`
  - hero copy, availability text, social metadata, featured selections

Public navigation:
- `Home`
- `Ask Corey`
- `Work`
- `Blog`
- `About`
- `Contact`
- `Experiments` when enough content exists to justify the route

## Backend and Auth Architecture
Auth:
- Better Auth is the canonical auth and session layer for the site
- Use Better Auth’s Convex integration, admin-only
- Initial provider default: GitHub OAuth for you as the sole admin
- Better Auth issues and validates the session used by Next.js middleware, server components, and admin pages
- Middleware/route protection covers `/admin` and Better Auth endpoints
- Convex trusts Better Auth identity for authenticated admin queries and mutations
- No public accounts, comments, or reader sessions in v1

Convex usage:
- Convex is the single source of truth for projects, posts, submissions, and site settings
- Public pages read published content only
- Admin pages can create drafts, edit content, publish/unpublish, and archive messages
- Contact submissions write to Convex, then trigger email notification
- Published projects, posts, and page content are normalized into `aiKnowledgeDocuments` for retrieval

AI layer:
- Vercel AI SDK is the application-layer integration for all AI features in the site
- Use `ai` for server-side generation, `@ai-sdk/react` for the Ask Corey chat UI, and `@ai-sdk/gateway` for model access through Vercel AI Gateway
- Ask Corey uses retrieval-augmented generation over published `projects`, `posts`, and key page content only
- AI answers must include citations to the source documents used for the response
- AI contact flow uses the same published knowledge base to suggest relevant projects/posts and generate a cleaner inquiry brief
- The AI layer is read-only with respect to public content; it does not mutate published content directly
- Re-index `aiKnowledgeDocuments` whenever a project, post, or key page copy is published or updated
- If retrieval finds weak or no matches, the UX should degrade gracefully by returning a concise fallback without fabricated claims
- Ask Corey uses Vercel AI SDK chat streaming via `streamText`
- AI contact brief generation uses Vercel AI SDK structured output via `generateObject`
- Default model routing goes through Vercel AI Gateway
- Default text model: `anthropic/claude-sonnet-4.6`
- Default embedding model for knowledge indexing: `openai/text-embedding-3-large`

AI safeguards and operations:
- Apply rate limiting to `/api/ask` and `/api/contact/brief`
- Add bot protection to the contact flow
- Set request-level token and timeout caps for Ask Corey and contact brief generation
- Log generation failures, latency, and approximate token usage for debugging and cost control
- Add a short privacy disclosure on `/contact` explaining that inquiry text may be processed by AI before submission
- Do not store raw Ask Corey chat transcripts in v1 unless there is a clear moderation or analytics need

Next.js usage:
- App Router
- Server-render public page shells for SEO
- Use Better Auth server/client helpers for sign-in, session reads, and protected route checks
- Use Convex/Next helpers for application data fetching and authenticated admin data access
- Keep interactive admin surfaces client-side where it simplifies auth/session flows
- Implement Ask Corey and the AI contact brief behind server actions or route handlers so model calls stay server-side
- Implement `useChat`-driven UI for `/ask` backed by a streaming API route such as `/api/ask`
- Implement a server-side endpoint such as `/api/contact/brief` for structured brief generation before final form submission

Email:
- Send contact notifications via Resend
- Notification target configured in environment/settings
- No auto-reply in v1

SEO and structured data:
- Add JSON-LD for `Person` on the homepage/about page
- Add `BlogPosting` or `Article` schema on blog posts
- Add `SoftwareApplication` or `CreativeWork` schema on project detail pages where appropriate
- Ensure AI-generated summaries do not replace the hand-authored SEO fields for core pages

## Admin Scope
Admin capabilities:
- Sign in
- CRUD for projects
- CRUD for posts
- CRUD for experience entries and capabilities
- Publish/unpublish posts and projects
- CRUD for experiments if the route is enabled
- Mark submissions as replied/archived
- Edit core site settings
- Review AI-generated contact briefs alongside the original inquiry

Intentionally out of scope for v1:
- Rich block editor
- Public comments
- Reader accounts
- Search
- Analytics dashboard
- Manual theme toggle
- Full resume PDF builder

## Build Phases
1. Foundation
- Remove current homepage
- Add site-wide layout, nav, footer, theme tokens, metadata base
- Set up Better Auth as the auth/session layer, integrate it with Convex, and add the protected admin shell

2. Public content system
- Create Convex schema and queries/mutations
- Build home, ask, work index/detail, blog index/detail, about, and contact routes
- Build the optional experiments route if there are at least 2-3 high-quality items to launch with
- Seed initial projects, posts, experience entries, capabilities, and site settings

3. Admin CMS
- Build Better Auth sign-in/session flow
- Build admin CRUD screens for projects/posts/messages/settings/experience/capabilities
- Add publish and archive actions

4. AI features
- Install and configure `ai`, `@ai-sdk/react`, and `@ai-sdk/gateway`
- Build the Ask Corey retrieval pipeline over published site content
- Build the `/ask` experience with citations and suggested prompts
- Build AI-assisted contact brief generation and project/post matching
- Add content re-indexing on publish/update

5. Contact operations
- Build validated contact form
- Store submissions in Convex
- Send Resend email notification
- Add admin inbox view

6. Polish
- SEO metadata per route
- Open Graph basics
- JSON-LD structured data
- Responsive refinement
- Empty states, loading states, and error states

## Acceptance Criteria
- Homepage no longer looks like a link list and clearly explains who you are and what you build
- System theme follows OS light/dark preference automatically
- Homepage visibly communicates breadth across product engineering, architecture, AI integration, and Apple/web/backend experience
- Work section supports featured items and full case-study pages
- Blog supports draft/published states and is fully manageable from admin
- About page contains a structured experience timeline and capability proof points
- Ask Corey answers questions about your work using only grounded site content and always shows citations
- Contact flow can turn a rough inquiry into an editable brief and suggest relevant work before submission
- All AI requests go through Vercel AI SDK, with Gateway-backed model routing
- Contact form stores messages and sends notification email
- Better Auth is the only auth/session system in the app, and admin routes are protected and usable only by your account
- Public pages are readable and polished on mobile and desktop
- No placeholder starter styling remains

## Test Cases and Scenarios
Content and navigation:
- Home loads with featured work and latest posts
- Home shows Ask Corey teaser prompts and links to `/ask`
- Home shows capability highlights and at least one memorable differentiator section
- Work index shows only published projects
- Work detail page renders valid slug and 404s for missing/unpublished slug
- Blog index shows only published posts in date order
- Blog post route renders tags, metadata, and body correctly
- About page renders experience entries in the intended order
- Ask Corey returns cited answers for supported questions
- Ask Corey returns a safe fallback when no grounded answer is available
- Ask Corey streams responses correctly through the `/api/ask` endpoint
- Contact brief generation returns schema-valid structured output through `/api/contact/brief`

Auth and admin:
- Unauthenticated user is redirected away from `/admin`
- Authenticated admin can create/edit/publish/unpublish a post
- Authenticated admin can create/edit/feature a project
- Authenticated admin can archive a contact submission
- Publishing a project or post updates the AI knowledge index

Contact:
- Visitor can enter a rough project idea and receive an AI-generated editable brief
- AI contact flow suggests relevant projects/posts based on the inquiry
- Valid form submission writes to Convex and sends email
- Invalid email or empty message shows clear validation feedback
- Submission failure shows retry-safe error state without duplicate writes
- Contact page shows privacy/AI-processing disclosure before final submission

AI safeguards:
- Ask Corey and contact brief endpoints respect rate limits and fail gracefully when limits are hit
- Model or retrieval failures surface a calm fallback message rather than a broken UI
- AI answers never cite unpublished or admin-only content

UI and theming:
- Site respects system light mode
- Site respects system dark mode
- Typography, spacing, and focus states remain accessible in both themes
- Layout remains intact on small mobile widths and large desktop screens

SEO:
- Each public page has title/description metadata
- Blog and project detail pages generate shareable metadata from content
- Homepage/about expose valid `Person` schema
- Project pages expose valid product/work schema where appropriate
- Sitemap and robots are present in v1 if time allows, otherwise phase 2

## Assumptions and Defaults
- Content emphasis is based on publicly verifiable GitHub profile information and your stated goals, not on unverified LinkedIn copy
- Admin access is only for you, so GitHub OAuth is sufficient for v1
- Blog and project body content can start as markdown-compatible rich text stored in Convex
- Resend is the email provider unless you prefer another transactional email service later
- No manual theme switcher is required because you asked for system theme behavior
- “About” replaces a traditional resume page and can include experience, stack, and current focus
- Better Auth owns session creation, validation, and logout behavior; Convex does not introduce a separate auth/session system
- AI outputs are advisory and grounded in your published content; they do not create or modify source content automatically
- Model defaults were chosen from the Vercel AI Gateway catalog on March 17, 2026 and can be revised later without changing the overall architecture
- Launch content should highlight principal/lead engineering, Corporate Interactive tenure, full-stack SaaS work, Apple platform experience, and memorable public artifacts such as `npx coreybaines`

## References
- GitHub profile source: https://github.com/coreybain
- LinkedIn profile source for manual verification/copy import: https://www.linkedin.com/in/coreybaines/
- Better Auth Convex integration: https://better-auth.com/docs/integrations/convex
- Better Auth Next.js integration: https://www.better-auth.com/docs/integrations/next
- Vercel AI SDK UI `useChat`: https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat
- Vercel AI SDK AI Gateway provider: https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway
- Vercel AI SDK getting started: https://ai-sdk.dev/docs/getting-started/nodejs
- Convex authentication overview: https://docs.convex.dev/auth
- Convex Next.js App Router docs: https://docs.convex.dev/client/nextjs/app-router/
