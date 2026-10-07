// SPEC-20 R8 / INVARIANTS #9 — the two outside layers around delete-account.
//
//  - The gateway verifies the JWT before the function runs (verify_jwt = true,
//    committed in supabase/config.toml so a redeploy can't silently drop it).
//    The function verifies again in code (handler_test.ts); this pins layer 1.
//  - The service-role key bypasses every RLS rule. It lives only in the edge
//    functions' environment — never in the app bundle or its build config,
//    where anyone with the IPA could read it.

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.join(__dirname, '..', '..', '..');
const read = (relative: string) => fs.readFileSync(path.join(ROOT, relative), 'utf8');

function filesUnder(dir: string): string[] {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : filesUnder(relative);
    return /\.(ts|tsx|js|json)$/.test(entry.name) ? [relative] : [];
  });
}

// Each `[functions.<name>]` block in supabase/config.toml → its verify_jwt.
function gatewayJwtSettings(): Record<string, string | undefined> {
  const blocks = read('supabase/config.toml').split(/^\[/m).slice(1);
  return Object.fromEntries(
    blocks
      .filter((block) => block.startsWith('functions.'))
      .map((block) => [
        block.slice('functions.'.length, block.indexOf(']')),
        block.match(/^verify_jwt\s*=\s*(\w+)\s*$/m)?.[1],
      ]),
  );
}

// Deployable functions: every directory under supabase/functions with an
// index.ts (shared code would live in `_`-prefixed folders).
const functionNames = fs
  .readdirSync(path.join(ROOT, 'supabase/functions'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(ROOT, 'supabase/functions', entry.name, 'index.ts')))
  .map((entry) => entry.name);

describe('delete-account gateway JWT check (INVARIANTS #9)', () => {
  it('supabase/config.toml keeps verify_jwt = true for delete-account', () => {
    expect(gatewayJwtSettings()['delete-account']).toBe('true');
  });
});

// INVARIANTS #30. The purchase handoff runs before the app has a session, so
// its gateway check is off and the function protects itself (single-use key,
// entitlement check, rate limit — its handler_test.ts). That makes it the
// exception, not a pattern: a second function with the check off, or a new
// function whose setting nobody decided, fails here.
describe('the gateway JWT check is off for redeem-handoff only (INVARIANTS #30)', () => {
  it('redeem-handoff is deployed with verify_jwt = false', () => {
    expect(gatewayJwtSettings()['redeem-handoff']).toBe('false');
  });

  it.each(functionNames)('%s states its verify_jwt in supabase/config.toml', (name) => {
    expect(['true', 'false']).toContain(gatewayJwtSettings()[name]);
  });

  it('no other function turns the check off', () => {
    const off = Object.entries(gatewayJwtSettings())
      .filter(([, value]) => value !== 'true')
      .map(([name]) => name);
    expect(off).toEqual(['redeem-handoff']);
  });
});

describe('the service-role key never ships with the app (INVARIANTS #9)', () => {
  const SERVICE_KEY_NAMES = /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEYS|sb_secret_|service_role_key/i;
  const shipped = [...filesUnder('src'), 'App.tsx', 'app.config.js', 'app.json', 'eas.json'];

  it.each(shipped)('%s names no service-role key', (file) => {
    expect(read(file)).not.toMatch(SERVICE_KEY_NAMES);
  });
});
