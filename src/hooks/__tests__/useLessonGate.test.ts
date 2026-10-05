// SPEC-20 R6 / INVARIANTS #13 — the per-lesson gate is deliberately a no-op:
// entitlement is enforced once, at the Loading gate. This pins that it opens
// the lesson immediately and asks Superwall nothing — so nobody mistakes the
// `learn_module_*` source strings for live placements, and a re-enabled
// per-lesson gate has to be a deliberate change (new placement + INVARIANTS
// #2 rules), not a drift.

import { renderHook } from '@testing-library/react-native';
import { useLessonGate } from '../useLessonGate';
import { SuperwallExpoModule, resetSuperwallFake, superwall } from '../../test/superwall';

beforeEach(() => resetSuperwallFake());

it('gateToLesson opens the lesson immediately and never asks Superwall', async () => {
  const { result } = await renderHook(() => useLessonGate());
  const onEntitled = jest.fn();

  result.current.gateToLesson('learn_module_sprinklers', onEntitled);

  expect(onEntitled).toHaveBeenCalledTimes(1);
  expect(superwall.registerPlacement).not.toHaveBeenCalled();
  expect(SuperwallExpoModule.getSubscriptionStatus).not.toHaveBeenCalled();
});
