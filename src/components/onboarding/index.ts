/**
 * SPEC-17 — onboarding UX system. Screens import from here; the grammar lives
 * inside. See docs/specs/SPEC-17-onboarding-ux-system.md.
 */
export { QuestionScreen, RevealFooter, ContinueButton } from './QuestionScreen';
export { StatementScreen } from './StatementScreen';
export { RecapChips, SnapshotCard } from './SnapshotPieces';
export type { SnapshotRow } from './SnapshotPieces';
export { CalculatingView } from './CalculatingView';
export { OptionList, SelectionCountPill, isMultiSelectValid } from './OptionList';
export type { Option } from './OptionList';
export { OptionCard } from './OptionCard';
export type { OptionCardVariant } from './OptionCard';
export { useReduceMotion } from './useReduceMotion';
export {
  AUTO_ADVANCE_DELAY_MS,
  claimSingleAdvance,
} from './optionListLogic';
export { FLOWS, VARIANT_A_FLOW, VARIANT_B_FLOW, stepFor } from './flows';
export type { FlowScreen, FlowStep } from './flows';
