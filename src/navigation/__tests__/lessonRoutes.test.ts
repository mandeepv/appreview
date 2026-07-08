import {
  LESSON_NAV,
  LESSON_SCREEN_ROUTE_NAMES,
  ROOT_STACK_ROUTE_NAMES,
} from '../lessonRoutes';

// Every lesson in LearnScreen's nav table must resolve to a navigation target
// that actually exists — a lesson pointing at an unregistered screen would be
// a runtime dead-end. We import both "tables" (the lesson map + the registered
// route names) and assert containment. No component / simulator imported.

describe('lesson nav targets resolve to registered routes', () => {
  const registered = new Set<string>(ROOT_STACK_ROUTE_NAMES);

  it('every kind:"screen" lesson target is a registered RootStack route', () => {
    for (const routeName of LESSON_SCREEN_ROUTE_NAMES) {
      expect(registered.has(routeName)).toBe(true);
    }
  });

  it('every flow-lesson routes through the LessonFlow registered route', () => {
    // kind:'flow' targets navigate to 'LessonFlow' with a nested screen param,
    // so LessonFlow itself must be registered.
    const hasFlowLessons = Object.values(LESSON_NAV).some((t) => t.kind === 'flow');
    expect(hasFlowLessons).toBe(true);
    expect(registered.has('LessonFlow')).toBe(true);
  });

  it('no lesson target points at an unknown route (containment, exhaustive)', () => {
    for (const [lessonId, target] of Object.entries(LESSON_NAV)) {
      if (target.kind === 'screen') {
        expect(registered.has(target.name)).toBe(true);
      } else {
        // flow → LessonFlow must exist
        expect(registered.has('LessonFlow')).toBe(true);
      }
      // sanity: lesson id is a non-empty string
      expect(lessonId.length).toBeGreaterThan(0);
    }
  });

  it('all 13 lessons are mapped', () => {
    // Guards against a lesson silently dropping out of the nav table.
    expect(Object.keys(LESSON_NAV)).toHaveLength(13);
    for (let i = 1; i <= 13; i++) {
      expect(LESSON_NAV[String(i)]).toBeDefined();
    }
  });
});
