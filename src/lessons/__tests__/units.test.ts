import {
  PATH_NODES,
  LESSON_ORDER,
  VISIBLE_AHEAD,
  PATH_COVERS_ALL_LESSONS,
  ALL_LESSONS_HAVE_SHORT_NAMES,
  LESSON_SHORT_NAME,
  shortLessonName,
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

  // The guard checks identity, not just count. A misspelled slug keeps the
  // counts equal while dropping a whole lesson from the app — and because the
  // path is the only lesson navigation, that content becomes unreachable with
  // no error anywhere.
  it('names a real lesson for every slug on the path', () => {
    for (const slug of LESSON_ORDER) {
      expect(getLesson(slug)).toBeDefined();
    }
  });

  it('leaves no registry lesson off the path', () => {
    const ordered = new Set<string>(LESSON_ORDER);
    for (const node of PATH_NODES) expect(ordered.has(node.lessonSlug)).toBe(true);
    expect(ordered.size).toBe(LESSON_ORDER.length);
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

  // History renders IN FULL. It was capped for a while to keep the card on
  // screen; that traded away a parent's ability to scroll back through what
  // they have finished, which is the part of this screen that accumulates. The
  // card is kept in view by the open scroll offset instead.
  it('shows every finished node, back to the first', () => {
    const done = PATH_NODES.slice(0, 10).map((n) => n.key);
    const visible = visibleNodes(done);
    const shownDone = visible.filter((n) => done.includes(n.key));
    expect(shownDone).toHaveLength(done.length);
    expect(visible[0].index).toBe(0);
  });

  it('starts at node one however deep the parent is', () => {
    const done = PATH_NODES.slice(0, 30).map((n) => n.key);
    expect(visibleNodes(done)[0].index).toBe(0);
  });

  it('never runs past the end of the path', () => {
    const done = PATH_NODES.map((n) => n.key);
    const visible = visibleNodes(done);
    expect(visible[visible.length - 1].index).toBe(PATH_NODES.length - 1);
  });

  // A finished path has no current node, so the rail is history only. It must
  // still render something rather than collapsing to an empty screen.
  it('still returns nodes when the whole path is finished', () => {
    const done = PATH_NODES.map((n) => n.key);
    expect(visibleNodes(done).length).toBeGreaterThan(0);
  });

  // The future stays bounded even though the past does not: a parent must never
  // see the whole remaining course written out in advance.
  it('never reveals more than the horizon ahead of the current node', () => {
    for (let i = 0; i <= PATH_NODES.length; i += 1) {
      const done = PATH_NODES.slice(0, i).map((n) => n.key);
      const current = currentIndex(done);
      const beyond = visibleNodes(done).filter((n) => n.index > current + VISIBLE_AHEAD);
      expect(beyond.length).toBeLessThanOrEqual(3);
    }
  });

  // Out-of-order completion (deep link, older build) must not strand the card
  // off the rendered slice — the earliest gap is what the parent is shown.
  it('includes the current node even when completion is out of order', () => {
    const done = [PATH_NODES[0].key, PATH_NODES[8].key, PATH_NODES[20].key];
    const visible = visibleNodes(done);
    expect(visible.some((n) => n.index === currentIndex(done))).toBe(true);
  });

  // Completion keys from a renamed or removed section must not shift the path.
  it('ignores unknown keys rather than advancing past them', () => {
    expect(visibleNodes(['gone#1', 'nope#2']).some((n) => n.index === 0)).toBe(true);
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


// The active card's eyebrow reads "<LESSON> · FIVE MINUTES", so every lesson on
// the path needs a short name. shortLessonName falls back to the raw slug
// rather than throwing — which means a missing entry ships a card reading
// "RECORDINGDEEPBONDMOMENTS" instead of failing loudly. These are what make it
// fail loudly, here, instead.
describe('lesson short names (the card eyebrow)', () => {
  it('has a short name for every lesson on the path', () => {
    expect(ALL_LESSONS_HAVE_SHORT_NAMES).toBe(true);
  });

  it('resolves a real name for every slug in LESSON_ORDER', () => {
    for (const slug of LESSON_ORDER) {
      expect(shortLessonName(slug)).not.toBe(slug);
    }
  });

  // They sit in an eyebrow beside "· FIVE MINUTES", so a long one wraps or
  // truncates the line that tells the parent this is a short commitment.
  it('keeps every short name short enough for the eyebrow', () => {
    for (const name of Object.values(LESSON_SHORT_NAME)) {
      expect(name.length).toBeLessThanOrEqual(14);
    }
  });
});
