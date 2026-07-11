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
> in depth), but that second layer needs the `JWT_SECRET` secret to be set —
> see "One-time secret setup" below. Do not rely on either layer alone.

## JWT verification — two signing systems (SPEC-FIX-06, 2026-07-11)

`delete-account` verifies the caller's token in-code (defense in depth,
on top of the gateway's `verify_jwt`). It supports **both** Supabase
signing systems, chosen per-token by the token's `alg` header:

- **Asymmetric (ES256/RS256) — the new "JWT Signing Keys" system.** Verified
  against the project's **published public keys** at
  `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`. **No secret needed.** This
  is what our projects issue after migrating to signing keys — dev's JWKS
  advertises a single ES256 key (confirmed 2026-07-11).
- **HS256 (legacy) — the old symmetric secret.** Verified against the
  `JWT_SECRET` env var (see below). Retained so the function still works on
  any project still on the legacy secret.

> **History:** before SPEC-FIX-06 the function verified HS256 ONLY. When dev
> silently migrated to asymmetric signing keys, every real Delete Account
> returned 401 (`"alg" Header Parameter value not allowed`). Caught on dev
> during v1.2.0 release testing. The dual-path code now handles both.

### `JWT_SECRET` — only needed for the LEGACY (HS256) path

If a project is on the new asymmetric signing keys (verify via JWKS), the
`JWT_SECRET` secret is **not required** — the function verifies against the
public JWKS with no local secret. You still MUST set it on any project that
is still on the legacy HS256 secret. When in doubt, set it (harmless if
unused) OR check the project's JWKS: an ES256/RS256 key there means
asymmetric.

Set it **once per project** (persists across deploys):

```bash
supabase secrets set JWT_SECRET=<the project JWT secret>
```

> ⚠️ **The name must be `JWT_SECRET`, NOT `SUPABASE_JWT_SECRET`.** The
> `SUPABASE_` prefix is **reserved** by the Supabase CLI —
> `supabase secrets set SUPABASE_JWT_SECRET=...` is rejected, so a secret by
> that name can never be set. `index.ts` reads `Deno.env.get('JWT_SECRET')`
> to match. Do not rename it back. (SPEC-FIX-01 R2.)

Get the value from the Supabase dashboard: **Settings → JWT Keys → Legacy
JWT Secret** (use the secret for the project you're targeting).

- **Dev:** you (the implementer/intern) may set the dev project's secret
  yourself while developing against the dev project.
- **Prod:** ⚠️ **owner-only.** Setting the prod secret is part of the
  owner's prod deploy, not routine dev work.
- **Fail-closed:** if a token is HS256 but `JWT_SECRET` is unset, the
  function returns 500 (never deletes) — a safe failure, not a bypass.
  Asymmetric tokens are unaffected (they verify via JWKS).

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
