import { displayName, familyLine, hasIdentity } from '../profileSummary';

// This is the one place the app tells a parent what it knows about their
// family, so every case here is about NOT overclaiming: no invented ages, no
// role the user did not choose, no placeholder name presented as their name.

describe('displayName', () => {
  it('returns a real name', () => {
    expect(displayName({ name: 'Sarah' })).toBe('Sarah');
  });

  it('trims surrounding whitespace', () => {
    expect(displayName({ name: '  Sarah  ' })).toBe('Sarah');
  });

  // NameAgeScreen writes the literal 'Parent' when the field is left blank, so
  // it is a placeholder rather than anything anyone typed. Greeting someone by
  // it reads like a broken mail-merge.
  it('treats the literal "Parent" as no name', () => {
    expect(displayName({ name: 'Parent' })).toBeNull();
    expect(displayName({ name: 'parent' })).toBeNull();
  });

  it('is null for blank, missing, or whitespace-only names', () => {
    expect(displayName({ name: '' })).toBeNull();
    expect(displayName({ name: '   ' })).toBeNull();
    expect(displayName({})).toBeNull();
    expect(displayName({ name: null })).toBeNull();
  });
});

describe('familyLine', () => {
  it('names the role for a mother, in US spelling', () => {
    expect(familyLine({ userType: 'mother', childrenCount: 2 })).toBe('Mom to two children');
  });

  it('names the role for a father', () => {
    expect(familyLine({ userType: 'father', childrenCount: 3 })).toBe('Dad to three children');
  });

  it('uses the singular for one child', () => {
    expect(familyLine({ userType: 'mother', childrenCount: 1 })).toBe('Mom to one child');
  });

  // Someone picks "Other / Guardian" precisely BECAUSE they are not the mother
  // or father — grandparent, step-parent, foster carer. Calling them "Parent"
  // overrides what they told us, so the line drops the role instead.
  it('states no role for a guardian', () => {
    expect(familyLine({ userType: 'other', childrenCount: 2 })).toBe('Two children');
  });

  it('states no role when userType is missing entirely', () => {
    expect(familyLine({ childrenCount: 2 })).toBe('Two children');
  });

  it('is null when there are no children to speak of', () => {
    expect(familyLine({ userType: 'mother', childrenCount: 0 })).toBeNull();
    expect(familyLine({ userType: 'mother' })).toBeNull();
    expect(familyLine({ userType: 'mother', childrenCount: null })).toBeNull();
  });

  // The stepper caps at 8, but a stale or hand-edited row could hold more. A
  // real family that size should still see itself rather than lose the line.
  it('falls back to digits past the word list', () => {
    expect(familyLine({ userType: 'father', childrenCount: 12 })).toBe('Dad to 12 children');
  });

  it('never states an age, since only bands are stored', () => {
    const line = familyLine({ userType: 'mother', childrenCount: 2 });
    expect(line).not.toMatch(/\d+-year-old/);
  });
});

describe('hasIdentity', () => {
  it('is true when either line survives', () => {
    expect(hasIdentity({ name: 'Sarah' })).toBe(true);
    expect(hasIdentity({ userType: 'mother', childrenCount: 2 })).toBe(true);
  });

  // An empty profile and a FAILED FETCH look identical on purpose: the header
  // is skipped in both cases, so there is no error state to design.
  it('is false when nothing can be said', () => {
    expect(hasIdentity({})).toBe(false);
    expect(hasIdentity({ name: 'Parent', childrenCount: 0 })).toBe(false);
  });
});
