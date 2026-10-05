// SPEC-20 R6 — restorePurchases folds every StoreKit outcome into one of five
// results, and never throws. Both Settings and the gate's escape hatch branch
// on these, so a mis-mapped outcome either strands a payer ("No Purchases
// Found" while still resolving) or hands out access. Superwall is the global
// fake from src/test/setup.ts.

import { restorePurchases } from '../purchaseService';
import { SuperwallExpoModule, resetSuperwallFake } from '../../test/superwall';

beforeEach(() => resetSuperwallFake());

function storeKitSays(restore: { result: string; errorMessage?: string | null }, status?: string) {
  SuperwallExpoModule.restorePurchases.mockResolvedValue({ errorMessage: null, ...restore });
  if (status) SuperwallExpoModule.getSubscriptionStatus.mockResolvedValue({ status });
}

describe('restorePurchases', () => {
  it('restore succeeded and the status is ACTIVE → restored', async () => {
    storeKitSays({ result: 'restored' }, 'ACTIVE');
    await expect(restorePurchases()).resolves.toEqual({ outcome: 'restored' });
  });

  it('restore succeeded but the status is INACTIVE → no_purchases (wrong Apple ID, usually)', async () => {
    storeKitSays({ result: 'restored' }, 'INACTIVE');
    await expect(restorePurchases()).resolves.toEqual({ outcome: 'no_purchases' });
  });

  // The reinstall bug: a cached UNKNOWN read as "nothing to restore" told a
  // real subscriber they had no purchase.
  it('restore succeeded but the status is still UNKNOWN → unknown, never no_purchases', async () => {
    storeKitSays({ result: 'restored' }, 'UNKNOWN');
    await expect(restorePurchases()).resolves.toEqual({ outcome: 'unknown' });
  });

  it('restore itself failed → failed, with Superwall’s message', async () => {
    storeKitSays({ result: 'failed', errorMessage: 'Cannot connect to iTunes Store' });
    await expect(restorePurchases()).resolves.toEqual({
      outcome: 'failed',
      errorMessage: 'Cannot connect to iTunes Store',
    });
    expect(SuperwallExpoModule.getSubscriptionStatus).not.toHaveBeenCalled();
  });

  it('the native call throws → threw, never a rejection', async () => {
    SuperwallExpoModule.restorePurchases.mockRejectedValue(new Error('native crash'));
    await expect(restorePurchases()).resolves.toEqual({ outcome: 'threw' });
  });
});
