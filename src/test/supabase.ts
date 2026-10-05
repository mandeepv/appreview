// A programmable fake of src/lib/supabase (SPEC-20 R2).
//
// setup.ts installs it for every test file, so importing a service never
// reaches the real client (whose module throws at import without env vars).
// A test file that needs a different shape can still jest.mock the module
// itself — its own factory wins.
//
// Query results are programmed per table: setTableResult('entitlements',
// { data, error }). Every chained call is recorded in queryLog, so a test can
// assert WHAT was asked (e.g. that a read was scoped to the signed-in user).
// The builder is thenable, like supabase-js's, so `await
// supabase.from(t).select()` resolves to the programmed result.

type QueryResult = { data: unknown; error: unknown };
type ResultSource = QueryResult | (() => QueryResult | Promise<QueryResult>);

const EMPTY: QueryResult = { data: null, error: null };
const tableResults = new Map<string, ResultSource>();

export const queryLog: { table: string; op: string; args: unknown[] }[] = [];

const CHAIN_METHODS = [
  'select', 'eq', 'neq', 'in', 'is', 'not', 'gt', 'gte', 'lt', 'lte',
  'order', 'limit', 'match', 'insert', 'update', 'upsert', 'delete',
] as const;

function resolveFor(table: string): Promise<QueryResult> {
  const source = tableResults.get(table) ?? EMPTY;
  return Promise.resolve(typeof source === 'function' ? source() : source);
}

function makeBuilder(table: string) {
  const builder: Record<string, unknown> = {};
  for (const op of CHAIN_METHODS) {
    builder[op] = jest.fn((...args: unknown[]) => {
      queryLog.push({ table, op, args });
      return builder;
    });
  }
  builder.single = jest.fn(() => resolveFor(table));
  builder.maybeSingle = jest.fn(() => resolveFor(table));
  builder.then = (
    onFulfilled?: (value: QueryResult) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => resolveFor(table).then(onFulfilled, onRejected);
  return builder;
}

type AuthListener = (event: string, session: unknown) => unknown;
let authListener: AuthListener | null = null;

export const supabase = {
  from: jest.fn((table: string) => makeBuilder(table)),
  rpc: jest.fn(() => Promise.resolve(EMPTY)),
  auth: {
    getSession: jest.fn(),
    getUser: jest.fn(),
    onAuthStateChange: jest.fn(),
    signOut: jest.fn(),
    refreshSession: jest.fn(),
    signInWithOtp: jest.fn(),
    verifyOtp: jest.fn(),
    signInWithIdToken: jest.fn(),
    signInWithOAuth: jest.fn(),
    setSession: jest.fn(),
    exchangeCodeForSession: jest.fn(),
  },
  functions: {
    invoke: jest.fn(),
  },
};

export const supabaseModule = {
  supabase,
  getCurrentUser: jest.fn(),
  signOut: jest.fn(),
};

function installDefaults(): void {
  supabase.auth.getSession.mockImplementation(() =>
    Promise.resolve({ data: { session: null }, error: null }),
  );
  supabase.auth.getUser.mockImplementation(() =>
    Promise.resolve({ data: { user: null }, error: null }),
  );
  supabase.auth.onAuthStateChange.mockImplementation((listener: AuthListener) => {
    authListener = listener;
    return { data: { subscription: { unsubscribe: jest.fn() } } };
  });
  supabase.auth.signOut.mockImplementation(() => Promise.resolve({ error: null }));
  supabase.auth.refreshSession.mockImplementation(() =>
    Promise.resolve({ data: { session: null }, error: null }),
  );
  supabase.functions.invoke.mockImplementation(() => Promise.resolve(EMPTY));
  supabaseModule.getCurrentUser.mockImplementation(() => Promise.resolve(null));
  // lib/supabase's signOut wraps auth.signOut and throws on its error.
  supabaseModule.signOut.mockImplementation(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  });
}
installDefaults();

/** Program what a query on `table` resolves to (a value or a function). */
export function setTableResult(table: string, result: ResultSource): void {
  tableResults.set(table, result);
}

/** Fire the listener the app registered with onAuthStateChange. */
export async function fireAuthChange(event: string, session: unknown): Promise<void> {
  if (!authListener) throw new Error('No onAuthStateChange listener registered yet');
  await authListener(event, session);
}

/** Back to defaults: no programmed results, empty log, no listener, mocks cleared. */
export function resetSupabaseFake(): void {
  tableResults.clear();
  queryLog.length = 0;
  authListener = null;
  for (const group of [supabase, supabase.auth, supabase.functions, supabaseModule]) {
    for (const value of Object.values(group)) {
      if (jest.isMockFunction(value)) value.mockReset();
    }
  }
  supabase.from.mockImplementation((table: string) => makeBuilder(table));
  supabase.rpc.mockImplementation(() => Promise.resolve(EMPTY));
  installDefaults();
}
