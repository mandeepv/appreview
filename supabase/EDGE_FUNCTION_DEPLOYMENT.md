# Edge Function Deployment

> ## 🚨 NEVER deploy delete-account with `--no-verify-jwt`
>
> The `delete-account` function deletes a user's account using the
> service-role key. Its security depends on the Edge Function gateway
> verifying the caller's JWT (`verify_jwt = true`, codified in
> `supabase/config.toml`). Deploying with `--no-verify-jwt` disables that
> gateway check and would let anyone POST an unauthenticated request to the
> function.
>
> ```bash
> # ❌ NEVER do this for delete-account:
> supabase functions deploy delete-account --no-verify-jwt
>
> # ✅ Always deploy WITHOUT the flag (verification on):
> supabase functions deploy delete-account
> ```
>
> The function ALSO re-verifies the JWT signature + expiry in-code (defense
> in depth), but that second layer needs `SUPABASE_JWT_SECRET` to be set —
> see "One-time secret setup" below. Do not rely on either layer alone.

## One-time secret setup — `SUPABASE_JWT_SECRET`

The in-function JWT verification (HS256) needs the project's JWT secret.
Set it **once per project** (it persists across deploys):

```bash
supabase secrets set SUPABASE_JWT_SECRET=<the project JWT secret>
```

Get the value from the Supabase dashboard: **Settings → API → JWT secret**
(use the secret for the project you're targeting — dev secret for the dev
project, prod secret for prod).

- **Dev:** you (the implementer/intern) may set the dev project's secret
  yourself while developing against the dev project.
- **Prod:** ⚠️ **owner-only.** Setting the prod secret is part of the
  owner's prod deploy, not routine dev work. If the secret is missing on a
  project, `delete-account` fails closed (returns 500, never deletes) — so a
  forgotten secret is a safe failure, not a silent bypass.

---

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
