# Supabase Edge Function Deployment Guide

## Prerequisites

1. Install Supabase CLI:
```bash
brew install supabase/tap/supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref REDACTED_PROD_SUPABASE_PROJECT_REF
```

## Deploy the delete-account Function

```bash
supabase functions deploy delete-account
```

## Verify Deployment

After deployment, the function will be available at:
```
https://REDACTED_PROD_SUPABASE_PROJECT_REF.supabase.co/functions/v1/delete-account
```

## Environment Variables

The Edge Function uses these environment variables (automatically available in Supabase):
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (for admin operations)

## Testing the Function

You can test the function using curl:

```bash
curl -X POST 'https://REDACTED_PROD_SUPABASE_PROJECT_REF.supabase.co/functions/v1/delete-account' \
  -H 'Authorization: Bearer YOUR_USER_JWT_TOKEN' \
  -H 'Content-Type: application/json'
```

## Security Notes

- The function verifies the user is authenticated before deletion
- Uses the service role key (server-side only) to delete the auth user
- Deletes all user data: lesson_progress, user_profiles, and auth user
- GDPR/CCPA compliant - complete data deletion

## Troubleshooting

If deployment fails:

1. Check you're logged in: `supabase projects list`
2. Verify project link: `supabase status`
3. Check function logs: `supabase functions logs delete-account`
