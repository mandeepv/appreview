# Edge Function Deployment

This doc was rewritten (Fable review 🟡). The prior version opened by
telling the reader to `supabase link --project-ref zqwzdyjfxytvedghujsd`
(prod), which contradicted the always-linked-to-dev rule and was a
real footgun — anyone running its steps in order would have hit dev
migrations against prod.

**The deployment flow is now covered in two authoritative places:**

- **Dev deploys** (routine): [`docs/DEV_PROD_ENVIRONMENTS.md`](../docs/DEV_PROD_ENVIRONMENTS.md) → "Migration tracking" section. CLI stays linked to dev; `supabase functions deploy <name>` targets dev via the linked project.

- **Prod deploys** (per-release): [`docs/RELEASE_CHECKLIST.md`](../docs/RELEASE_CHECKLIST.md) → Phase 5 (Deploy Edge Functions to prod if changed). Explicitly re-links to prod (`--project-ref zqwzdyjfxytvedghujsd`), deploys, verifies, and re-links back to dev.

## The one-liner for reference

Dev deploy (CLI already linked to dev):
```bash
supabase functions deploy delete-account
```

Prod deploy (per-release, follow RELEASE_CHECKLIST Phase 5):
```bash
supabase link --project-ref zqwzdyjfxytvedghujsd
supabase functions deploy delete-account
supabase link --project-ref xbkkjqvbsnroenqlqkmi   # re-link to dev
```

## Environment variables inside Edge Functions

Supabase auto-injects these into every function invocation:

- `SUPABASE_URL` — project URL of the project the function is deployed to
- `SUPABASE_ANON_KEY` — anon key of that project
- `SUPABASE_SERVICE_ROLE_KEY` — service-role key (bypasses RLS; use with care)

No env-var config on the caller side. If you need custom env vars for a function, set them via `supabase secrets set` per project.
