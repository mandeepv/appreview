/**
 * The Learn path — canvas artboard 29b, with the 30c ending.
 *
 * A single rail of every section in every lesson, 49 nodes deep. The lesson
 * layer is gone from navigation: a node opens its section directly, so the hub
 * screen is no longer on the happy path.
 *
 * Geometry is 29b's: a 22px gutter holding a 1px rail, 9px hollow dots for
 * finished nodes, a 12px filled dot beside tonight's card, 7px faint dots
 * ahead. No left-hand number gutter — the rail is the only left edge.
 *
 * WHAT THE RAIL SHOWS
 *   finished   title + check, every one of them — scroll up to re-read
 *   tonight    a forest card: eyebrow, title, description, Start
 *   ahead      the next three, named but not openable
 *   beyond     dots only — the rail continues, the titles do not
 *
 * The ending is 30c's: the rail arrives somewhere rather than trailing into a
 * dashed panel or a numbered future. It must never look like something is
 * missing.
 *
 * LOCKED, SEQUENTIALLY. Only a finished node or tonight's opens. Finishing
 * tonight's immediately opens the next — there is no daily drip, so a parent
 * with a free evening can keep going.
 *
 * WHERE IT OPENS. Always at tonight's card, with a little finished rail showing
 * above it. The screen answers "what do I do tonight?" every time it is opened,
 * so scrolling back through history does not persist across a tab switch — that
 * excursion ends when the screen is left.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Animated } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useLessonGate } from '../hooks/useLessonGate';
import { safeCapture } from '../lib/analytics';
import { getCompletedPathKeys } from '../lessons/pathProgress';
import { getLesson } from '../lessons/registry';
import {
  visibleNodes,
  nodeState,
  canOpen,
  pathProgress,
  shortLessonName,
  PATH_NODES,
  type PathNode,
} from '../lessons/units';
import {
  Animation,
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingRadius as R,
  oInk,
  oForest,
  oCream,
  // oClay — used only by the parked streak pill; restore with it.
} from '../constants/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * The padlock on rows that are not open yet.
 *
 * It replaces a copy-only explanation of the lock rule. A fading rail could not
 * carry that meaning on its own — fading out and running out look identical, so
 * a parent could read the end of the rail as the end of the product. A lock is
 * unambiguous in a way no amount of tuned opacity is: it says "there is
 * something here, and it is not yours yet" without naming a number, which
 * matters because the catalogue is meant to grow and any total would state a
 * ceiling.
 *
 * Shackle drawn as a stroked arc, body as a filled rect — at 13px a stroked
 * body reads as mush.
 */
function Lock({ size = 13, tint }: { size?: number; tint?: string } = {}) {
  // Defaults to the muted ink the rail's own secondary marks use; the closing
  // block passes forest so the lock belongs to that block rather than reading
  // as a generic system glyph dropped on top of it.
  const stroke = tint ?? oInk(0.3);
  const fill = tint ?? oInk(0.26);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 10V7a4 4 0 118 0v3" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" />
      <Rect x={5} y={10} width={14} height={10} rx={2.4} fill={fill} />
    </Svg>
  );
}

function Check() {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={oInk(0.4)}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * The line under tonight's title. Pulled from the section's own first real
 * paragraph, so the card describes the actual content rather than a generic
 * promise that content may not keep.
 */
function describeSection(node: PathNode): string {
  const lesson = getLesson(node.lessonSlug);
  const section = lesson?.sections[node.sectionIndex];
  if (!section) return '';
  for (const screen of section.screens) {
    // A section can end on a `sectionComplete` screen, which carries no blocks.
    if (screen.kind !== 'content') continue;
    for (const block of screen.blocks) {
      // A paragraph's text can be a rich run-array rather than a string; only
      // the plain form is usable as a one-line description.
      if (block.type === 'paragraph' && typeof block.text === 'string') {
        const text = block.text.trim().replace(/\s+/g, ' ');
        if (text.length > 20) {
          return text.length > 120 ? `${text.slice(0, 117).trimEnd()}…` : text;
        }
      }
    }
  }
  return lesson?.title ?? '';
}

/* PARKED FOR v-NEXT — the streak pill's flame, with the pill in the header.

function Flame({ dim = false }: { dim?: boolean }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3c.6 3-1.8 4.2-2.6 6.3-.8 2.2.5 3.7.5 3.7s-2-.4-2.4-2.4C6.2 12.9 5.5 14.6 5.5 16a6.5 6.5 0 0013 0c0-4.6-4-6.8-6.5-13z"
        stroke={dim ? oInk(0.34) : C.clay}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
*/

export default function LearnScreen() {
  const navigation = useNavigation<Nav>();
  const { gateToLesson } = useLessonGate();
  const [completed, setCompleted] = useState<string[]>([]);
  // PARKED FOR v-NEXT, with the pill in the header.
  // const [streak, setStreak] = useState(0);
  // Distinguishes "nothing finished yet" from "not read from disk yet". Without
  // it both look like `completed === []`, and the screen renders a day-one rail
  // for one frame before snapping to the real position — which for a parent
  // mid-path flashes the wrong lesson as tonight's.
  const [loaded, setLoaded] = useState(false);

  // Bumped on every focus, and used as the list's `key`.
  //
  // `initialScrollIndex` is applied when the list MOUNTS, and LearnScreen stays
  // mounted under the tab navigator — so without this, the rail would be
  // positioned once on first open and never again. Changing the key remounts
  // the list, which re-applies the initial position. That is the whole
  // reset-on-focus behaviour: no scrolling, no timing, just a fresh list that
  // starts in the right place.
  const [focusCount, setFocusCount] = useState(0);

  // Transient explanation for a tap on a section that isn't open yet. Tapping
  // a locked row used to do NOTHING — no movement, no message — so the rail
  // read as broken rather than sequential, and nothing anywhere explained the
  // lock rule. Held here (not per-row) so only one hint is ever on screen.
  const [lockedHint, setLockedHint] = useState<string | null>(null);
  const lockedHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Drives both opacity and a small rise. Snapping the hint in and out read as
  // a glitch rather than an answer to the tap — the eye catches the appearance
  // but not the meaning, and it vanished mid-sentence.
  //
  // useState's lazy initializer rather than useRef().current: the value is read
  // during render (it is passed into a style), and react-hooks/refs flags a ref
  // read there. Same single-instance guarantee, no warning.
  const [lockedHintAnim] = useState(() => new Animated.Value(0));

  // Re-read on every focus, not just on mount. The screen stays mounted under
  // the tab navigator, so returning from a finished lesson would otherwise show
  // the same card still waiting to be started.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      // Hold the rail back until the re-read lands.
      //
      // Without this, returning from a finished lesson renders the PREVIOUS
      // progress for a frame or two: the section just completed still sits
      // there as tonight's card, marked TONIGHT, and then snaps to the next
      // one. The stale frame shows the parent the exact thing they have
      // already done, at the moment they are looking for what is next.
      //
      // The read is one AsyncStorage round-trip, so this is a blank rail for a
      // few frames rather than a spinner — the header stays put throughout.
      setLoaded(false);
      setFocusCount((n) => n + 1);
      void (async () => {
        // Settled, not thrown: a failed read must not blank the whole rail.
        // (Parked: this read the streak alongside progress. See the header.)
        const keys = await Promise.allSettled([getCompletedPathKeys()]);
        if (!alive) return;
        if (keys[0].status === 'fulfilled') setCompleted(keys[0].value);
        setLoaded(true);
      })();
      return () => {
        alive = false;
        // Don't leave a hint (or its timer) behind on a screen we've left.
        if (lockedHintTimer.current) clearTimeout(lockedHintTimer.current);
        setLockedHint(null);
      };
    }, []),
  );

  const nodes = visibleNodes(completed);
  const progress = pathProgress(completed);
  const allDone = loaded && progress.done >= PATH_NODES.length;

  // What the rail says when it runs out of rows to draw.
  //
  // It must convey "this keeps going" WITHOUT naming a number. A count states a
  // ceiling: the catalogue is meant to grow, so any total is a promise about
  // the size of the product that goes stale the moment a lesson is added — and
  // until then reads as the limit of what the parent bought. The fade alone is
  // not enough either, because fading out and running out look identical; the
  // line below is what settles it in words.
  //
  // Phrased as an ongoing practice rather than a queue with an end, which is
  // also the truer description of the thing.
  const endNote = allDone
    ? "You've finished every one — for now."
    : 'Finish the lessons above and the next ones open up here.';

  // Where the rail sits when the screen is opened.
  //
  // The Path tab answers one question — "what do I do tonight?" — and it has to
  // answer it every time it is opened, not just the first time. Scrolling up
  // through finished sections is a deliberate excursion with an end; leaving the
  // screen ends it. Preserving that scroll would mean a parent who browsed their
  // history on Tuesday opens the app on Wednesday looking at section 3 of 40,
  // with nothing explaining why. (Same convention as Instagram Home, App Store
  // Today, Mail: re-entering a tab returns to its job.)
  const listRef = useRef<FlatList<PathNode>>(null);
  const currentPos = nodes.findIndex((n) => nodeState(n, completed) === 'current');

  // Every row's height is KNOWN, so the open position is arithmetic.
  //
  // This screen went through three failed attempts at scrolling to the card —
  // after layout, on contentSizeChange, via contentOffset — and every one of
  // them failed for the same underlying reason: row heights were unknown, so
  // the correct offset could not be computed until the rows had been measured,
  // and none of the callbacks that report measurement fire in a dependable
  // order relative to the progress read.
  //
  // The fix is to stop needing the measurement. Row heights are fixed (titles
  // clamp to a line count rather than wrapping freely — see ROW_H), which makes
  // `getItemLayout` exact, `initialScrollIndex` land on the first frame, and
  // the whole class of timing bugs go away.
  // Row offsets, summed once per render. getItemLayout is called per row, so
  // summing inside it would be quadratic over a rail that only gets longer.
  const layout = useMemo(() => {
    const heights = nodes.map((node) => rowHeight(nodeState(node, completed)));
    // Each row's offset is the sum of the heights before it.
    const rows: { length: number; offset: number }[] = [];
    for (const length of heights) {
      const prev = rows[rows.length - 1];
      rows.push({ length, offset: prev ? prev.offset + prev.length : 0 });
    }
    return rows;
  }, [nodes, completed]);

  // One row earlier than the card, so a finished row sits above it as the
  // affordance to scroll up. Clamped at 0 — on day one the card is already the
  // top of the rail and there is nothing to show above it.
  const initialScrollIndex =
    loaded && nodes.length > 0 && currentPos > 0 ? Math.max(0, currentPos - 1) : undefined;

  const openNode = (node: PathNode) => {
    if (!canOpen(node, completed)) {
      // Say why. The path is deliberately sequential — one section at a time,
      // in order — but that rule was invisible: the tap simply did nothing.
      if (lockedHintTimer.current) clearTimeout(lockedHintTimer.current);
      setLockedHint('Finish the section you’re on to unlock this one.');
      // Rise + fade in quickly (the tap should feel answered at once), hold
      // long enough to read the sentence, then fade out rather than cut.
      // Re-tapping restarts the hold, so a second tap re-reads instead of
      // stacking timers.
      lockedHintAnim.stopAnimation();
      Animated.timing(lockedHintAnim, {
        toValue: 1,
        duration: Animation.duration.fast,
        useNativeDriver: true,
      }).start();
      lockedHintTimer.current = setTimeout(() => {
        Animated.timing(lockedHintAnim, {
          toValue: 0,
          duration: Animation.duration.normal,
          useNativeDriver: true,
        }).start(({ finished }) => {
          // Only unmount if the fade actually completed — a tap during the
          // fade restarts it, and clearing the text then would blank a hint
          // that is on its way back in.
          if (finished) setLockedHint(null);
        });
      }, 2600);
      return;
    }

    // Analytics keep the established shape: slug as lesson_id so the tapped →
    // started funnel joins the engine's events. `lesson_started` is fired by
    // LessonController, never here — firing it on tap counted paywall bounces
    // as lesson starts (Fable review #8, SPEC-13 R5).
    safeCapture('lesson_tapped', {
      lesson_id: node.lessonSlug,
      section_id: node.sectionId,
      path_index: node.index,
    });

    // gateToLesson is a SEAM, not a check: it ignores this string and calls
    // through immediately (see useLessonGate, INVARIANTS #13). Entitlement is
    // enforced once, at the Loading gate. The key is kept in the shape a future
    // freemium tier would want, and is not a live Superwall placement.
    gateToLesson(`learn_module_${node.lessonSlug}`, () => {
      navigation.navigate('LessonScreen', {
        lessonId: node.lessonSlug,
        sectionIndex: node.sectionIndex,
        screenIndex: 0,
        returnTo: 'MainTabs',
        // Marks this as an OPEN, so lesson_started fires once here rather than
        // on every Next press (each of which pushes a fresh LessonScreen).
        entry: true,
      });
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>Kinderwell</Text>

        {/* DELIBERATELY NO COUNT HERE.
            A total ("3 of 49") states a ceiling, and the catalogue is meant to
            grow — the number would be a promise about the size of the product
            that goes stale the moment a lesson is added, and until then reads
            as the limit of what was bought rather than where it happens to be
            today. The rail conveys "there is more" without ever claiming how
            much. See the tail note below. */}
        {/* PARKED FOR v-NEXT — the streak pill.

            Not a bug and not abandoned: how the streak should behave is still
            an open design question, specifically what zero shows to a parent
            who had a hard week. Shipping a habit mechanic that has not been
            decided is worse than shipping none.

            Active days are STILL RECORDED while this is dark (see
            LessonController -> recordActiveDay), so whenever the pill comes
            back it has real history to show instead of starting everyone at
            zero. Restore by uncommenting this and the `streak` state below.

        {loaded ? (
          <View style={[styles.streakPill, streak === 0 ? styles.streakPillZero : null]}>
            <Flame dim={streak === 0} />
            <Text style={[styles.streakCount, streak === 0 ? styles.streakCountZero : null]}>
              {streak}
            </Text>
          </View>
        ) : null}
        */}
      </View>

      {/* Reading progress is one AsyncStorage round-trip. Holding the rail back
          for it shows an empty cream screen for a frame, which beats drawing the
          wrong lesson as tonight's and then swapping it.

          A FlatList rather than a mapped ScrollView because history is
          UNBOUNDED: it grows for as long as a parent keeps the app, and every
          finished row was previously a mounted, measured view. At forty sections
          that is forty views laid out on every focus. Virtualised, only the
          handful on screen exist. */}
      <FlatList
        // Remounts on focus so initialScrollIndex re-applies — see focusCount.
        key={`rail-${focusCount}`}
        ref={listRef}
        style={styles.scroll}
        data={loaded ? nodes : []}
        keyExtractor={(node) => node.key}
        renderItem={({ item }) => (
          <PathRow node={item} state={nodeState(item, completed)} onOpen={openNode} />
        )}
        // Re-render rows when progress changes; `completed` is closed over by
        // renderItem and FlatList cannot see inside it.
        extraData={completed}
        // Centring is right for a short day-one rail — pinned to the top it
        // leaves the card stranded under the masthead. But centring shifts
        // content away from the offsets getItemLayout reports, so it is only
        // safe when there is nothing to scroll to.
        contentContainerStyle={
          initialScrollIndex === undefined ? styles.scrollInnerCentred : styles.scrollInner
        }
        showsVerticalScrollIndicator={false}
        // Heights are fixed, so every row's offset is known without measuring
        // it. This is what lets the list open in the right place on the FIRST
        // frame instead of scrolling there afterwards.
        getItemLayout={(_data, index) => ({
          length: layout[index]?.length ?? ROW_H.ahead,
          offset: layout[index]?.offset ?? 0,
          index,
        })}
        // Opens AT the card, on the first frame, with no scroll involved.
        //
        // The index is one row EARLIER than the card so a finished row shows
        // above it: the history has to be visibly there or a parent will not
        // think to scroll up for it. Done this way rather than with a header
        // spacer, which would shift every offset getItemLayout returns.
        initialScrollIndex={initialScrollIndex}
        ListFooterComponent={
          loaded ? (
            allDone ? (
              <View style={styles.endRow}>
                <View style={styles.gutter} />
                <View style={styles.end}>
                  <Text style={styles.endText}>{endNote}</Text>
                </View>
              </View>
            ) : (
              /* The rail's closing block.
                 A deliberate, finished-looking panel rather than the rail
                 trailing off. Placeholder ROWS were tried three ways here —
                 blank, faded, locked — and each read as something having gone
                 wrong, because a half-drawn row is indistinguishable from a
                 broken one. A block reads as authored: it is clearly the end of
                 the list and clearly not the end of the product.
                 Says nothing about HOW MUCH is left, on purpose. */
              <View style={styles.moreRow}>
                <View style={styles.gutter}>
                  {/* One last rail stub joining the block to the path above, so
                      it belongs to the rail rather than floating after it. */}
                  <View style={styles.moreStub} />
                </View>
                <View style={styles.moreWrap}>
                  <View style={styles.moreCard}>
                    {/* Lock and heading on ONE line: floating above the title it
                        had nothing to anchor to and read as a stray glyph. */}
                    <View style={styles.moreHeading}>
                      <Lock size={15} tint={C.forest} />
                      <Text style={styles.moreTitle}>More lessons ahead</Text>
                    </View>
                    <Text style={styles.moreBody}>{endNote}</Text>
                  </View>
                </View>
              </View>
            )
          ) : null
        }
      />

      {/* Floats over the rail rather than sitting in it, so showing it never
          shifts the rows under the parent's finger. */}
      {lockedHint ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.lockedHint,
            {
              opacity: lockedHintAnim,
              transform: [
                {
                  // A short rise, not a slide from off-screen: the hint belongs
                  // to the row that was tapped, so it settles into place rather
                  // than travelling in from somewhere else.
                  translateY: lockedHintAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.lockedHintText}>{lockedHint}</Text>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
}

/** One node on the rail. Which of the four shapes it takes is `state`. */
function PathRow({
  node,
  state,
  onOpen,
}: {
  node: PathNode;
  state: ReturnType<typeof nodeState>;
  onOpen: (node: PathNode) => void;
}) {
  if (state === 'current') {
    return (
      <View style={styles.row}>
        <View style={styles.gutter}>
          <View style={styles.railLine} />
          <View style={styles.dotCurrent} />
        </View>
        <View style={styles.cardWrap}>
          <Pressable
            onPress={() => onOpen(node)}
            accessibilityRole="button"
            accessibilityLabel={`${shortLessonName(node.lessonSlug)}: ${node.title}. Five minutes.`}
            style={({ pressed }) => [styles.card, pressed ? { opacity: 0.92 } : null]}
          >
            {/* The lesson this section belongs to, not "TONIGHT".
                "TONIGHT · FIVE MINUTES" said when to do it but never what it
                was part of: a parent reading "What NOT to do when loved ones
                are upset" had no way to tell it belonged to Bonding, or that
                more of Bonding followed. The time estimate stays — it is the
                half that was doing real work, promising a short commitment. */}
            <Text style={styles.cardEyebrow}>
              {shortLessonName(node.lessonSlug).toUpperCase()} · FIVE MINUTES
            </Text>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {node.title}
            </Text>
            <Text style={styles.cardBody} numberOfLines={2}>
              {describeSection(node)}
            </Text>
            <View style={styles.cardButton}>
              <Text style={styles.cardButtonLabel}>Start</Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  if (state === 'done') {
    return (
      <Pressable
        onPress={() => onOpen(node)}
        accessibilityRole="button"
        accessibilityLabel={node.title}
        style={({ pressed }) => [styles.row, pressed ? { opacity: 0.6 } : null]}
      >
        <View style={styles.gutter}>
          <View style={styles.railLine} />
          <View style={styles.dotDone} />
        </View>
        <View style={styles.doneRow}>
          <Text style={styles.doneTitle} numberOfLines={2}>
            {node.title}
          </Text>
          <Check />
        </View>
      </Pressable>
    );
  }

  // 'ahead' is named but not openable; 'locked' is the rail continuing with no
  // title at all.
  //
  // These used to be a plain View on the reasoning that "a locked node that
  // swallows a tap is worse than one that plainly does not invite it". In
  // practice a parent DOES tap them — the rows look like the rest of the rail —
  // and got no response at all, which read as the app being broken rather than
  // the path being sequential. So they are pressable now, but only to explain
  // themselves: onOpen refuses to navigate and shows the lock hint instead
  // (see openNode). No pressed style — nothing is about to open, and a press
  // highlight would promise otherwise.
  return (
    <Pressable
      onPress={() => onOpen(node)}
      accessibilityRole="button"
      accessibilityState={{ disabled: true }}
      accessibilityLabel={
        state === 'ahead'
          ? `${node.title}. Locked until you finish the section you're on.`
          : "Locked until you finish the section you're on."
      }
      style={styles.row}
    >
      <View style={styles.gutter}>
        <View style={styles.railLineFaint} />
        <View style={styles.dotAhead} />
      </View>
      <View style={styles.aheadRow}>
        {state === 'ahead' ? (
          <>
            <Text style={styles.aheadTitle} numberOfLines={2}>
              {node.title}
            </Text>
            <Lock />
          </>
        ) : (
          // Past the named horizon the title is withheld on purpose — the point
          // is that the path continues, not what is in it. The lock alone says
          // that, and says it without a count.
          <Lock />
        )}
      </View>
    </Pressable>
  );
}

const GUTTER = 22;

/**
 * Fixed row heights, in points. These are what make the rail's open position
 * computable rather than measured — see `getItemLayout` in the list.
 *
 * Each is its content at the clamped number of lines plus its own padding, so
 * a title that would have wrapped to three lines is truncated instead of
 * silently changing the row's height and breaking every offset below it.
 */
const ROW_H = {
  /** 2 lines of 17pt serif at 1.4 + 32 vertical padding. */
  done: Math.round(17 * 1.4 * 2) + 32,
  /** Same type, same clamp, slightly looser padding. */
  ahead: Math.round(17 * 1.4 * 2) + 38,
  /**
   * Eyebrow + title's own marginTop + 2-line title + 2-line body + button +
   * card and wrap padding. The 12 is cardTitle's marginTop, which this
   * omitted — the card rendered ~12pt taller than declared, so every offset
   * below it drifted by that much (2026-09 review).
   */
  current: 16 + 12 + Math.round(25 * 1.22 * 2) + 9 + Math.round(16 * 1.55 * 2) + 18 + 50 + 42 + 16,
} as const;

/** The height of one row, by the state it renders in. */
function rowHeight(state: ReturnType<typeof nodeState>): number {
  if (state === 'current') return ROW_H.current;
  if (state === 'done') return ROW_H.done;
  return ROW_H.ahead;
}

const styles = StyleSheet.create({
  // Matches the header (forestDeep): this view's background fills the
  // safe-area inset above the bar, so any other colour leaves a mismatched
  // strip across the notch. The rail's own cream comes from `scroll` below.
  screen: { flex: 1, backgroundColor: C.forestDeep },

  // Sits just above the tab bar, inverted so it reads as a transient message
  // rather than another row on the rail.
  lockedHint: {
    position: 'absolute',
    left: 26,
    right: 26,
    // Clear of the tab bar. This screen's SafeAreaView insets the TOP only, so
    // a small bottom offset put the hint underneath the tabs — invisible, which
    // looks exactly like the "tap does nothing" bug it exists to fix.
    bottom: 96,
    backgroundColor: C.forestDeep,
    borderRadius: R.callout,
    paddingVertical: 14,
    paddingHorizontal: 18,
    // It floats above the rail, so it needs to read as lifted off it rather
    // than painted onto it — without a shadow the dark block looks like a gap
    // in the page.
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  lockedHintText: {
    fontFamily: F.sans,
    fontSize: 14,
    lineHeight: 14 * 1.45,
    color: oCream(0.92),
    textAlign: 'center',
  },

  // A forest bar, not a cream one with a hairline under it.
  //
  // Cream-on-cream separated only by a 1px rule, the masthead read as the top
  // of the scrolling page rather than a fixed chrome above it — nothing marked
  // where the app's frame ended and the content began. Filling it with the
  // palette's primary makes it plainly a separate surface, and pairs it with
  // the tab bar so the screen is framed top and bottom.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingVertical: 16,
    // forestDeep, NOT forest — tonight's card is forest, and a forest masthead
    // meant the card merged into the bar the moment it scrolled up under it:
    // one continuous green mass with no edge anywhere. forestDeep is the
    // palette's own takeover surface, which is what a masthead is, and it makes
    // the card read as a lighter object sitting ON the chrome rather than part
    // of it.
    backgroundColor: C.forestDeep,
    // Plus a hard edge, so the boundary holds even where the two greens are
    // closest in value — under a card mid-scroll, or in dark/low-light viewing.
    borderBottomWidth: 1,
    borderBottomColor: oCream(0.14),
  },
  // Serif, sentence case — the masthead of a book rather than a product label.
  // Cream on forest now; ink would be unreadable on it.
  wordmark: { fontFamily: F.serif, fontSize: 26, letterSpacing: -0.4, color: C.cream },
  /* PARKED FOR v-NEXT — the streak pill's styles.
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: oClay(0.12),
  },
  streakCount: { fontFamily: F.sansSemi, fontSize: 14, color: C.clayDeep },
  streakPillZero: { backgroundColor: oInk(0.07) },
  streakCountZero: { color: oInk(0.45) },
  */

  // Carries the page's cream now that `screen` is forest for the notch.
  scroll: { flex: 1, backgroundColor: C.paper },
  // flexGrow + centred: on day one the rail is a handful of rows and pinning
  // it to the top left the card stranded under the masthead with the screen
  // empty beneath. Once the rail outgrows the viewport this has no effect and
  // it scrolls normally from the top.
  // Top-aligned, and the default: row offsets must match what getItemLayout
  // reports or initialScrollIndex lands in the wrong place.
  scrollInner: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingTop: 22,
    paddingBottom: 40,
  },
  // Day one only, when nothing is being scrolled to. A handful of rows pinned
  // to the top leaves the card stranded under the masthead.
  scrollInnerCentred: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingBottom: 40,
  },

  row: { flexDirection: 'row' },
  gutter: { width: GUTTER, flexShrink: 0, position: 'relative' },
  railLine: {
    position: 'absolute',
    left: 5,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: oInk(0.2),
  },
  railLineFaint: {
    position: 'absolute',
    left: 5,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: oInk(0.14),
  },

  dotDone: {
    position: 'absolute',
    left: 1.5,
    top: 24,
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: C.paper,
    borderWidth: 1.5,
    borderColor: oInk(0.4),
  },
  dotCurrent: {
    position: 'absolute',
    left: 0,
    top: 30,
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: C.forest,
  },
  dotAhead: {
    position: 'absolute',
    left: 2.5,
    top: 26,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: oInk(0.22),
  },

  doneRow: {
    flex: 1,
    height: ROW_H.done,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 16,
    paddingLeft: 14,
  },
  doneTitle: { flex: 1, fontFamily: F.serif, fontSize: 17, lineHeight: 17 * 1.4, color: oInk(0.7) },

  // Mirrors doneRow so the lock lands in the same column as the checkmark —
  // one status gutter down the right edge, whatever the row's state.
  aheadRow: {
    flex: 1,
    height: ROW_H.ahead,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 19,
    paddingLeft: 14,
  },
  aheadTitle: {
    flex: 1,
    fontFamily: F.serif,
    fontSize: 17,
    lineHeight: 17 * 1.4,
    color: oInk(0.62),
  },

  cardWrap: { flex: 1, height: ROW_H.current, paddingVertical: 8, paddingLeft: 14 },
  card: {
    backgroundColor: C.forest,
    borderRadius: R.card,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
  },
  cardEyebrow: {
    fontFamily: F.monoMed,
    fontSize: 11,
    letterSpacing: 11 * 0.1,
    color: oCream(0.72),
  },
  cardTitle: {
    fontFamily: F.sansSemi,
    fontSize: 25,
    lineHeight: 25 * 1.22,
    letterSpacing: -0.65,
    color: C.cream,
    marginTop: 12,
  },
  cardBody: {
    fontFamily: F.serif,
    fontSize: 16,
    lineHeight: 16 * 1.55,
    color: oCream(0.82),
    marginTop: 9,
  },
  cardButton: {
    height: 50,
    borderRadius: 999,
    backgroundColor: C.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  cardButtonLabel: { fontFamily: F.sansSemi, fontSize: 16, color: C.forest },

  endRow: { flexDirection: 'row', paddingBottom: 28 },

  // --- the closing block ---------------------------------------------------
  // Deliberately NOT a row: rows here are lessons, and anything shaped like one
  // invites a tap and implies a specific lesson behind it. This is a panel that
  // ends the list.
  moreRow: { flexDirection: 'row', marginBottom: 40 },
  // A short stub of rail so the block hangs off the path rather than floating
  // below it. Same 1px line, same left offset as every row's railLine.
  // A short connector from the last row down to the box's top edge — the rail
  // arriving at it. It stops AT the border rather than running alongside it:
  // the box is a closed shape now, so a line down its flank would read as two
  // parallel edges rather than a path meeting a destination.
  moreStub: {
    position: 'absolute',
    left: 5,
    top: 0,
    height: 18,
    width: 1,
    backgroundColor: oForest(0.35),
  },
  // Zero left padding, and the card carries none either — see moreCard. The
  // block's TEXT has to line up with the lesson titles above it (14pt from the
  // gutter), not with tonight's card text (36pt). The card can sit further in
  // because it is FILLED: its background is the visual left edge. A dashed
  // outline is faint enough that the eye reads the text as the edge instead, so
  // matching the card's inset left this text 23pt right of every title above
  // it — which is the misalignment, and it is large, not subtle.
  // No left padding of its own: the CARD's 14pt padding is the whole inset, so
  // the border sits flush against the gutter (hard by the rail) and the text
  // inside lands at 14pt — exactly where every lesson title above it starts.
  // Splitting the inset between wrap and card is what put the text 23pt in.
  //
  // paddingTop is the gap the connector stub spans; it lives INSIDE the row so
  // the stub (absolutely positioned in the row's gutter) starts at the last
  // lesson row rather than being pushed down with a margin.
  moreWrap: { flex: 1, paddingTop: 18 },
  // A dashed FOREST outline on the paper ground, never filled. Filled would
  // compete with tonight's card, which must stay the loudest thing here. Forest
  // rather than grey ink because grey read as a disabled/empty state — the same
  // colour as the live card says "more of this", where a neutral said "nothing".
  //
  // paddingHorizontal is 22 to match `card` exactly: at 20 the text inside sat
  // 2pt left of every other block on the screen. Too small to name, big enough
  // for the eye to catch as a wobble in the left edge.
  // A CLOSED box — all four dashed sides. Dropping the left border to chase the
  // text alignment left it hanging open on one side, which reads as a shape
  // that failed to finish drawing rather than a deliberate panel.
  //
  // The alignment is solved by the padding instead: the card's own 14pt is the
  // only inset, so the BORDER hugs the gutter beside the rail while the TEXT
  // inside lands exactly on the lesson titles above. The box frames the column
  // rather than sitting indented from it.
  moreCard: {
    borderWidth: 1.5,
    borderColor: oForest(0.42),
    borderStyle: 'dashed',
    borderRadius: R.card,
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 20,
  },
  moreHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  moreTitle: {
    fontFamily: F.serif,
    fontSize: 20,
    lineHeight: 20 * 1.3,
    color: C.forest,
  },
  moreBody: {
    fontFamily: F.sans,
    fontSize: 14,
    lineHeight: 14 * 1.5,
    color: oInk(0.45),
    marginTop: 8,
  },

  end: { flex: 1, paddingLeft: 14, paddingTop: 14 },
  endText: { fontFamily: F.serifItalic, fontSize: 15, lineHeight: 15 * 1.5, color: oInk(0.5) },
});
