import {
  PATH_NODES,
  LESSON_ORDER,
  VISIBLE_AHEAD,
  PATH_COVERS_ALL_LESSONS,
  currentIndex,
  nodeState,
  canOpen,
  visibleNodes,
  pathProgress,
} from '../units';
import { getLesson } from '../registry';

// The path is now the app's only lesson navigation, and it is LOCKED — so a
// mistake here does not just look wrong, it makes content unreachable. These
// assert the lock rule and the visible horizon rather than the copy.

describe('the path covers every section of every lesson', () => {
  it('includes every lesson in the registry', () => {
    expect(PATH_COVERS_ALL_LESSONS).toBe(true);
  });

  it('has one node per section, in lesson order', () => {
    const expected = LESSON_ORDER.reduce(
      (n, slug) => n + (getLesson(slug)?.sections.length ?? 0),
      0,
    );
    expect(PATH_NODES).toHaveLength(expected);
  });

  it('gives every node a unique key', () => {
    const keys = PATH_NODES.map((n) => n.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('numbers nodes contiguously from zero', () => {
    PATH_NODES.forEach((node, i) => expect(node.index).toBe(i));
  });

  // A sectionIndex past the end of its lesson would navigate into nothing.
  it('every sectionIndex resolves inside its lesson', () => {
    for (const node of PATH_NODES) {
      const lesson = getLesson(node.lessonSlug);
      expect(lesson).toBeDefined();
      expect(lesson!.sections[node.sectionIndex]).toBeDefined();
      expect(lesson!.sections[node.sectionIndex].id).toBe(node.sectionId);
    }
  });
});

describe('currentIndex — where the parent is', () => {
  it('is the first node for someone who has done nothing', () => {
    expect(currentIndex([])).toBe(0);
  });

  it('advances past what is finished', () => {
    const done = PATH_NODES.slice(0, 3).map((n) => n.key);
    expect(currentIndex(done)).toBe(3);
  });

  // Out-of-order completion is possible from an older build or a deep link.
  // Current must be the earliest GAP, never one past the last finished node.
  it('returns the earliest gap, not the position after the last completion', () => {
    const done = [PATH_NODES[0].key, PATH_NODES[5].key];
    expect(currentIndex(done)).toBe(1);
  });

  it('runs off the end when everything is done', () => {
    expect(currentIndex(PATH_NODES.map((n) => n.key))).toBe(PATH_NODES.length);
  });
});

describe('nodeState and the lock rule', () => {
  it('marks exactly one node current', () => {
    const states = PATH_NODES.map((n) => nodeState(n, []));
    expect(states.filter((s) => s === 'current')).toHaveLength(1);
  });

  it('names exactly VISIBLE_AHEAD nodes past the current one', () => {
    const states = PATH_NODES.map((n) => nodeState(n, []));
    expect(states.filter((s) => s === 'ahead')).toHaveLength(VISIBLE_AHEAD);
  });

  it('locks everything past the horizon', () => {
    expect(nodeState(PATH_NODES[VISIBLE_AHEAD + 1], [])).toBe('locked');
  });

  it('leaves no node current once the path is finished', () => {
    const done = PATH_NODES.map((n) => n.key);
    expect(PATH_NODES.map((n) => nodeState(n, done)).every((s) => s === 'done')).toBe(true);
  });

  // The core promise: finishing one opens the next immediately, with no wait.
  it('opens the next node the moment the current one is finished', () => {
    expect(canOpen(PATH_NODES[1], [])).toBe(false);
    expect(canOpen(PATH_NODES[1], [PATH_NODES[0].key])).toBe(true);
  });

  it('never opens a node beyond the current one', () => {
    expect(canOpen(PATH_NODES[2], [])).toBe(false);
    expect(canOpen(PATH_NODES[10], [])).toBe(false);
  });

  it('keeps finished nodes openable so they can be re-read', () => {
    expect(canOpen(PATH_NODES[0], [PATH_NODES[0].key])).toBe(true);
  });
});

describe('visibleNodes — what actually renders', () => {
  it('renders far fewer than the whole path for a new user', () => {
    expect(visibleNodes([]).length).toBeLessThan(PATH_NODES.length);
  });

  it('always includes the current node', () => {
    const done = PATH_NODES.slice(0, 6).map((n) => n.key);
    const visible = visibleNodes(done);
    expect(visible.some((n) => n.index === currentIndex(done))).toBe(true);
  });

  it('keeps finished nodes visible so the parent can scroll back', () => {
    const done = PATH_NODES.slice(0, 6).map((n) => n.key);
    expect(visibleNodes(done).slice(0, 6).map((n) => n.key)).toEqual(done);
  });

  it('never runs past the end of the path', () => {
    const done = PATH_NODES.map((n) => n.key);
    expect(visibleNodes(done)).toHaveLength(PATH_NODES.length);
  });
});

describe('pathProgress', () => {
  it('counts nothing for a new user', () => {
    expect(pathProgress([])).toEqual({ done: 0, total: PATH_NODES.length });
  });

  it('ignores keys that are not on the path', () => {
    expect(pathProgress(['nope#1']).done).toBe(0);
  });
});
