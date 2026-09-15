import { LESSON_REGISTRY } from '../registry';
import { PATH_NODES } from '../units';

/**
 * `lesson_started` has now regressed in BOTH directions, which is why these
 * exist:
 *
 *   - Under-counting: the fire lived in LessonHubScreen, and the path stopped
 *     routing through the hub — so nine of thirteen lessons stopped reporting
 *     while `lesson_tapped` kept flowing and hid the gap.
 *   - Over-counting: moving it into LessonController and deduping with a ref
 *     did nothing, because every Next press does navigation.push() and mounts a
 *     FRESH controller whose ref starts empty. It fired on every screen.
 *
 * The event is not unit-testable end to end without a navigator, so these lock
 * the STRUCTURAL facts the once-per-visit semantics rest on. If someone changes
 * how lessons are opened, these should be what fails.
 */

describe('lesson_started fires once per visit', () => {
  // The controller keys entirely off this flag. If the param is dropped from
  // the type, or an opener stops passing it, the event silently stops firing —
  // the exact failure mode that lost nine lessons last time.
  it('the LessonScreen route carries an `entry` flag', () => {
    const types = require('fs').readFileSync(
      require('path').join(__dirname, '../../navigation/types.ts'),
      'utf8',
    ) as string;
    const route = types.slice(types.indexOf('LessonScreen: {'));
    expect(route.slice(0, route.indexOf('};'))).toMatch(/entry\?: boolean/);
  });

  // A ref or state guard inside the controller cannot dedup across a push,
  // because the push builds a new component instance. Locking the navigation
  // shape is what keeps the next person from re-introducing that fix.
  it('advancing a screen pushes rather than replacing params', () => {
    const screen = require('fs').readFileSync(
      require('path').join(__dirname, '../LessonScreen.tsx'),
      'utf8',
    ) as string;
    const onAdvance = screen.slice(screen.indexOf('const onAdvance'));
    const body = onAdvance.slice(0, onAdvance.indexOf('[navigation'));
    expect(body).toContain("navigation.push('LessonScreen'");
    // The advance push must NOT carry `entry`, or every Next re-fires.
    expect(body).not.toContain('entry');
  });

  it('the path opener marks its navigation as an entry', () => {
    const learn = require('fs').readFileSync(
      require('path').join(__dirname, '../../screens/LearnScreen.tsx'),
      'utf8',
    ) as string;
    const open = learn.slice(learn.indexOf("navigation.navigate('LessonScreen'"));
    expect(open.slice(0, open.indexOf('});'))).toContain('entry: true');
  });

  // Every lesson is reachable from the path, so every lesson's start is
  // reportable — flow and hub alike. This is the property the under-count
  // violated.
  it('every registered lesson is reachable from the path', () => {
    const onPath = new Set(PATH_NODES.map((n) => n.lessonSlug));
    for (const slug of Object.keys(LESSON_REGISTRY)) {
      expect(onPath.has(slug)).toBe(true);
    }
  });
});
