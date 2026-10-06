// SPEC-20 R7 / INVARIANTS #26 — every web address in the app is on purpose.
//
// App Store guideline 3.1.3: nothing in the app may link to the web funnel or
// say the app can be bought on the web. The only kinderwell.app link is the
// manage-subscription row Settings shows to web subscribers. A new URL fails
// here until someone adds it below with a reason — so a link to the funnel
// cannot slip in unreviewed.

import * as fs from 'fs';
import * as path from 'path';

const ALLOWED: Record<string, string> = {
  'https://kinderwell.app/manage': 'Settings → Manage subscription, web subscribers only',
  'https://apps.apple.com/account/subscriptions': 'Settings → Manage subscription, Apple subscribers',
  'https://apps.apple.com/app/kinderwell/idAPPLEAPPID': 'force-update modal → the App Store listing',
  'https://play.google.com/store/apps/details': 'force-update modal → the Play listing (Android)',
  'https://mandeepv.github.io/kinderwell-legal/privacy.html': 'privacy policy (Settings, sign-in screen)',
  'https://mandeepv.github.io/kinderwell-legal/terms.html': 'terms of service (Settings, sign-in screen)',
  'https://us.i.posthog.com': 'PostHog ingestion host (config, not a link)',
  'https://supabase.com/docs/guides/auth/social-login/auth-apple': 'a code comment',
};

const ROOT = path.join(__dirname, '..', '..', '..');
const URL_PATTERN = /https?:\/\/[a-zA-Z0-9./_-]+/g;

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) return ['__tests__', 'test'].includes(entry.name) ? [] : sourceFiles(relative);
    return /\.(ts|tsx)$/.test(entry.name) ? [relative] : [];
  });
}

it('every URL in the app is on the allowlist', () => {
  const found = new Map<string, string[]>();
  for (const file of [...sourceFiles('src'), 'App.tsx']) {
    for (const url of fs.readFileSync(path.join(ROOT, file), 'utf8').match(URL_PATTERN) ?? []) {
      found.set(url, [...(found.get(url) ?? []), file]);
    }
  }
  const unreviewed = [...found].filter(([url]) => !(url in ALLOWED)).map(([url, files]) => `${url} (${files.join(', ')})`);
  expect(unreviewed).toEqual([]);
});

it('the allowlist has no stale entries', () => {
  const source = [...sourceFiles('src'), 'App.tsx']
    .map((file) => fs.readFileSync(path.join(ROOT, file), 'utf8'))
    .join('\n');
  const stale = Object.keys(ALLOWED).filter((url) => !source.includes(url));
  expect(stale).toEqual([]);
});
