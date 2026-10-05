// SPEC-20 R6 — the lesson-progress DB service. The distinction that matters
// most is getAllRemoteProgress's {} vs null: {} means "signed in, no rows" and
// the sign-in merge may write local progress up; null means "the read failed"
// and the merge must skip, or a network blip would overwrite the account's
// real progress (SPEC-13). Supabase is the global fake.

import { getAllRemoteProgress, getRemoteSections, upsertSections } from '../lessonProgressService';
import { queryLog, resetSupabaseFake, setTableResult, supabase } from '../../test/supabase';
import { makeUser } from '../../test/factories';

function signedInAs(id: string | null) {
  supabase.auth.getUser.mockResolvedValue({ data: { user: id ? makeUser(id) : null }, error: null });
}

beforeEach(() => resetSupabaseFake());

describe('getAllRemoteProgress', () => {
  it('signed out → {} (no rows), not null', async () => {
    signedInAs(null);
    await expect(getAllRemoteProgress()).resolves.toEqual({});
  });

  it("maps the signed-in user's rows, and reads only theirs", async () => {
    signedInAs('user-a');
    setTableResult('lesson_progress', {
      data: [
        { lesson_id: 'sprinklers', completed_sections: ['1', '2'] },
        { lesson_id: 'serveReturn', completed_sections: null },
      ],
      error: null,
    });
    await expect(getAllRemoteProgress()).resolves.toEqual({ sprinklers: ['1', '2'], serveReturn: [] });
    expect(queryLog).toContainEqual({ table: 'lesson_progress', op: 'eq', args: ['user_id', 'user-a'] });
  });

  it('a failed read → null, so the merge skips instead of overwriting', async () => {
    signedInAs('user-a');
    setTableResult('lesson_progress', { data: null, error: { message: 'timeout' } });
    await expect(getAllRemoteProgress()).resolves.toBeNull();
  });
});

describe('getRemoteSections', () => {
  it('no row yet (PGRST116) → []', async () => {
    signedInAs('user-a');
    setTableResult('lesson_progress', { data: null, error: { code: 'PGRST116', message: 'no rows' } });
    await expect(getRemoteSections('sprinklers')).resolves.toEqual([]);
  });

  it('a row → its sections', async () => {
    signedInAs('user-a');
    setTableResult('lesson_progress', { data: { completed_sections: ['1'] }, error: null });
    await expect(getRemoteSections('sprinklers')).resolves.toEqual(['1']);
  });
});

describe('upsertSections', () => {
  it('signed out (or the demo user) → skipped, no write', async () => {
    signedInAs(null);
    await expect(upsertSections('sprinklers', ['1'], 5)).resolves.toBe('skipped');
    expect(queryLog.filter((q) => q.op === 'upsert')).toHaveLength(0);
  });

  it("writes the signed-in user's row, keyed for upsert, not yet complete", async () => {
    signedInAs('user-a');
    await expect(upsertSections('sprinklers', ['1', '2'], 5)).resolves.toBe('ok');
    const upsert = queryLog.find((q) => q.op === 'upsert');
    expect(upsert?.args[0]).toEqual(
      expect.objectContaining({
        user_id: 'user-a',
        lesson_id: 'sprinklers',
        completed_sections: ['1', '2'],
        completed: false,
        completed_at: null,
      }),
    );
    expect(upsert?.args[1]).toEqual({ onConflict: 'user_id,lesson_id' });
  });

  it('every section done → completed, with a timestamp', async () => {
    signedInAs('user-a');
    await upsertSections('sprinklers', ['1', '2', '3'], 3);
    const row = queryLog.find((q) => q.op === 'upsert')?.args[0] as Record<string, unknown>;
    expect(row.completed).toBe(true);
    expect(typeof row.completed_at).toBe('string');
  });

  it('a write error → failed, never a throw', async () => {
    signedInAs('user-a');
    setTableResult('lesson_progress', { data: null, error: { message: 'RLS violation' } });
    await expect(upsertSections('sprinklers', ['1'], 5)).resolves.toBe('failed');
  });
});
