// SPEC-20 R7 — the Learn path, the app's only lesson navigation.
//
//  - It must READ progress when the tab opens. The 2026-09-12 bug: the rail
//    never read it, so every parent was sent back to section 1 with the rest
//    locked behind it.
//  - Tonight's card is the earliest unfinished section, never one past the
//    furthest finished one (INVARIANTS #11), so out-of-order progress (a deep
//    link, an older build) can't strand a parent behind a lock.
//  - Locked sections explain themselves and open nothing; tonight's card and
//    finished sections open the lesson as a new visit (`entry: true`, which is
//    what fires lesson_started once).
//
// getCompletedPathKeys has its own tests (pathProgress.test); it is stubbed
// here to set the scene.

import { fireEvent, screen } from '@testing-library/react-native';
import LearnScreen from '../LearnScreen';
import { getCompletedPathKeys } from '../../lessons/pathProgress';
import { PATH_NODES, shortLessonName, type PathNode } from '../../lessons/units';
import { renderScreen } from '../../test/render';
import { lastCapture, resetAnalyticsFakes } from '../../test/analytics';

jest.mock('../../lessons/pathProgress', () => ({
  ...jest.requireActual('../../lessons/pathProgress'),
  getCompletedPathKeys: jest.fn(),
}));

const completedKeys = getCompletedPathKeys as jest.Mock;
const [n0, n1, n2] = PATH_NODES;

const tonightLabel = (node: PathNode) => `${shortLessonName(node.lessonSlug)}: ${node.title}. Five minutes.`;
const lockedLabel = (node: PathNode) => `${node.title}. Locked until you finish the section you're on.`;

// Scenes here keep tonight's card within the first two rows, so the list
// opens at the top. With two or more sections finished it opens scrolled
// (initialScrollIndex > 0), and React Native's FlatList then draws rows only
// after the device reports the content's measured size — which the test
// renderer never does. That scroll-to-the-card is left to the simulator
// end-to-end flows (SPEC-20 R10); everything else is checked here.
async function openLearn(done: PathNode[]) {
  completedKeys.mockResolvedValue(done.map((n) => n.key));
  return renderScreen(LearnScreen, { name: 'Learn' });
}

beforeEach(() => {
  completedKeys.mockReset();
  resetAnalyticsFakes();
});

it('reads progress when the tab opens, and resumes after it (2026-09-12)', async () => {
  await openLearn([n0]);
  expect(await screen.findByLabelText(tonightLabel(n1))).toBeTruthy();
  expect(completedKeys).toHaveBeenCalledTimes(1);
});

it('first launch → the first section is tonight', async () => {
  await openLearn([]);
  expect(await screen.findByLabelText(tonightLabel(n0))).toBeTruthy();
});

it('out-of-order progress → tonight is the earliest gap, not past the furthest (INVARIANTS #11)', async () => {
  await openLearn([n0, n2]);
  expect(await screen.findByLabelText(tonightLabel(n1))).toBeTruthy();
});

it('a progress read failure still shows the path from the start', async () => {
  completedKeys.mockRejectedValue(new Error('storage unavailable'));
  await renderScreen(LearnScreen, { name: 'Learn' });
  expect(await screen.findByLabelText(tonightLabel(n0))).toBeTruthy();
});

it("tonight's card → opens that section as a new visit (entry: true)", async () => {
  const navigation = await openLearn([n0]);
  await fireEvent.press(await screen.findByLabelText(tonightLabel(n1)));
  expect(navigation.navigate).toHaveBeenCalledWith('LessonScreen', {
    lessonId: n1.lessonSlug,
    sectionIndex: n1.sectionIndex,
    screenIndex: 0,
    returnTo: 'MainTabs',
    entry: true,
  });
  expect(lastCapture('lesson_tapped')).toEqual({
    lesson_id: n1.lessonSlug,
    section_id: n1.sectionId,
    path_index: n1.index,
  });
});

it('a finished section can be opened again', async () => {
  const navigation = await openLearn([n0]);
  await fireEvent.press(await screen.findByLabelText(n0.title));
  expect(navigation.navigate).toHaveBeenCalledWith(
    'LessonScreen',
    expect.objectContaining({ lessonId: n0.lessonSlug, sectionIndex: n0.sectionIndex, entry: true }),
  );
});

it('a locked section opens nothing, and says why', async () => {
  const navigation = await openLearn([n0]);
  await fireEvent.press(await screen.findByLabelText(lockedLabel(n2)));
  expect(navigation.navigate).not.toHaveBeenCalled();
  expect(screen.getByText('Finish the section you’re on to unlock this one.')).toBeTruthy();
});

it('every section finished → the closing note', async () => {
  await openLearn(PATH_NODES);
  expect(await screen.findByText("You've finished every one — for now.")).toBeTruthy();
});
