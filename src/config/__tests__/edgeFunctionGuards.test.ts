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

describe('delete-account gateway JWT check (INVARIANTS #9)', () => {
  it('supabase/config.toml keeps verify_jwt = true for delete-account', () => {
    const toml = read('supabase/config.toml');
    const section = toml.split(/^\[/m).find((block) => block.startsWith('functions.delete-account]'));
    expect(section).toBeDefined();
    expect(section).toMatch(/^verify_jwt\s*=\s*true\s*$/m);
  });
});

describe('the service-role key never ships with the app (INVARIANTS #9)', () => {
  const SERVICE_KEY_NAMES = /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEYS|sb_secret_|service_role_key/i;
  const shipped = [...filesUnder('src'), 'App.tsx', 'app.config.js', 'app.json', 'eas.json'];

  it.each(shipped)('%s names no service-role key', (file) => {
    expect(read(file)).not.toMatch(SERVICE_KEY_NAMES);
  });
});
