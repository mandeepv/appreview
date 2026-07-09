import { parseLesson } from '../schema';
import { sprinklers } from '../content/sprinklers';

describe('sprinklers content', () => {
  it('validates against the schema', () => {
    expect(() => parseLesson(sprinklers)).not.toThrow();
  });
  it('has the exact storage key and 5 sections summing to 52 screens', () => {
    const p = parseLesson(sprinklers);
    expect(p.storageKey).toBe('@sprinklers_completed_sections');
    expect(p.sections.map(s => s.id)).toEqual(['1','2','3','4','5']);
    expect(p.sections.map(s => s.screens.length)).toEqual([10,13,14,9,6]);
    expect(p.sections.reduce((n,s)=>n+s.screens.length,0)).toBe(52);
  });
});
