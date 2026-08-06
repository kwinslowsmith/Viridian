/**
 * Test cases for mastery calculations
 *
 * Scenarios based on research:
 * - Content standards: 80% default
 * - Skill standards: 75% default
 * - Mandatory objectives: Must all pass regardless of percentage
 */

import { calculateMastery, getDefaultPassPercentage, validateMasteryInput } from './calculations';

describe('Mastery Calculations', () => {
  describe('Content Standards (80% default)', () => {
    test('Basic mastery - exactly 80%', () => {
      const result = calculateMastery({
        totalObjectives: 5,
        completedObjectives: 4, // 80%
        standardType: 'content',
      });

      expect(result.hasMastery).toBe(true);
      expect(result.completionPercentage).toBe(80);
      expect(result.requiredPercentage).toBe(80);
      expect(result.status).toBe('mastered');
    });

    test('Below mastery - 60%', () => {
      const result = calculateMastery({
        totalObjectives: 5,
        completedObjectives: 3, // 60%
        standardType: 'content',
      });

      expect(result.hasMastery).toBe(false);
      expect(result.completionPercentage).toBe(60);
      expect(result.status).toBe('in-progress');
      expect(result.gap).toBe(-20);
    });

    test('Near mastery - 75%', () => {
      const result = calculateMastery({
        totalObjectives: 5,
        completedObjectives: 4, // 80% BUT one is mandatory
        mandatoryObjectiveIds: ['obj1', 'obj2'],
        completedMandatoryObjectives: 2,
        standardType: 'content',
      });

      expect(result.hasMastery).toBe(true);
      expect(result.status).toBe('mastered');
    });
  });

  describe('Skill Standards (75% default)', () => {
    test('Skill standard at 75%', () => {
      const result = calculateMastery({
        totalObjectives: 4,
        completedObjectives: 3, // 75%
        standardType: 'skill',
      });

      expect(result.hasMastery).toBe(true);
      expect(result.completionPercentage).toBe(75);
      expect(result.requiredPercentage).toBe(75);
    });

    test('Skill standard below threshold - 50%', () => {
      const result = calculateMastery({
        totalObjectives: 4,
        completedObjectives: 2, // 50%
        standardType: 'skill',
      });

      expect(result.hasMastery).toBe(false);
      expect(result.status).toBe('in-progress');
    });
  });

  describe('Mandatory Objectives Logic', () => {
    test('Mandatory: Must pass ALL mandatory even with high percentage', () => {
      const result = calculateMastery({
        totalObjectives: 5,
        completedObjectives: 4, // 80% overall
        mandatoryObjectiveIds: ['obj1', 'obj2', 'obj3'],
        completedMandatoryObjectives: 2, // Only 2 of 3 mandatory
        standardType: 'content',
      });

      expect(result.hasMastery).toBe(false); // Fails because mandatory not all passed
      expect(result.status).toBe('in-progress');
    });

    test('Mandatory: Pass with ALL mandatory + threshold', () => {
      const result = calculateMastery({
        totalObjectives: 5,
        completedObjectives: 4, // 80%
        mandatoryObjectiveIds: ['obj1', 'obj2'],
        completedMandatoryObjectives: 2, // All mandatory passed
        standardType: 'content',
      });

      expect(result.hasMastery).toBe(true);
      expect(result.breakdown.mandatoryObjectives).toBe(2);
      expect(result.breakdown.completedMandatoryObjectives).toBe(2);
    });

    test('Mandatory: Breakdown shows optional vs mandatory', () => {
      const result = calculateMastery({
        totalObjectives: 6, // 3 mandatory + 3 optional
        completedObjectives: 5,
        mandatoryObjectiveIds: ['obj1', 'obj2', 'obj3'],
        completedMandatoryObjectives: 3,
        standardType: 'content',
      });

      expect(result.breakdown.mandatoryObjectives).toBe(3);
      expect(result.breakdown.optionalObjectives).toBe(3);
      expect(result.breakdown.completedOptionalObjectives).toBe(2);
    });
  });

  describe('Custom Pass Percentage', () => {
    test('Override default with custom percentage', () => {
      const result = calculateMastery({
        totalObjectives: 10,
        completedObjectives: 6, // 60%
        passPercentage: 60, // Custom: 60% instead of 80%
        standardType: 'content',
      });

      expect(result.hasMastery).toBe(true);
      expect(result.requiredPercentage).toBe(60);
    });

    test('Custom percentage below default', () => {
      const result = calculateMastery({
        totalObjectives: 10,
        completedObjectives: 7, // 70%
        passPercentage: 60,
        standardType: 'content',
      });

      expect(result.hasMastery).toBe(true);
      expect(result.completionPercentage).toBe(70);
    });
  });

  describe('Status Calculation', () => {
    test('Not started - zero completed', () => {
      const result = calculateMastery({
        totalObjectives: 5,
        completedObjectives: 0,
        standardType: 'content',
      });

      expect(result.status).toBe('not-started');
    });

    test('In progress - 50% complete', () => {
      const result = calculateMastery({
        totalObjectives: 10,
        completedObjectives: 5, // 50%
        standardType: 'content',
      });

      expect(result.status).toBe('in-progress');
    });

    test('Near mastery - within 10%', () => {
      const result = calculateMastery({
        totalObjectives: 10,
        completedObjectives: 7, // 70%, need 80%
        standardType: 'content',
      });

      expect(result.status).toBe('near-mastery');
      expect(result.gap).toBe(-10);
    });

    test('Mastered - exceeded threshold', () => {
      const result = calculateMastery({
        totalObjectives: 10,
        completedObjectives: 9, // 90%
        standardType: 'content',
      });

      expect(result.status).toBe('mastered');
      expect(result.gap).toBe(10);
    });
  });

  describe('Default Pass Percentages', () => {
    test('Content standard default is 80%', () => {
      expect(getDefaultPassPercentage('content')).toBe(80);
    });

    test('Skill standard default is 75%', () => {
      expect(getDefaultPassPercentage('skill')).toBe(75);
    });
  });

  describe('Input Validation', () => {
    test('Valid input passes', () => {
      const result = validateMasteryInput({
        totalObjectives: 5,
        completedObjectives: 4,
      });

      expect(result.valid).toBe(true);
    });

    test('Invalid: Zero total objectives', () => {
      const result = validateMasteryInput({
        totalObjectives: 0,
        completedObjectives: 0,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('greater than 0');
    });

    test('Invalid: Completed > total', () => {
      const result = validateMasteryInput({
        totalObjectives: 5,
        completedObjectives: 10,
      });

      expect(result.valid).toBe(false);
    });

    test('Invalid: Pass percentage > 100', () => {
      const result = validateMasteryInput({
        totalObjectives: 5,
        completedObjectives: 4,
        passPercentage: 150,
      });

      expect(result.valid).toBe(false);
    });
  });

  describe('Real-World Scenarios', () => {
    test('AP History: 60% = 6 of 10 objectives', () => {
      // AP College Board: 60-75% means most exams should pass
      const result = calculateMastery({
        totalObjectives: 10,
        completedObjectives: 6,
        passPercentage: 60,
        standardType: 'skill',
      });

      expect(result.hasMastery).toBe(true);
    });

    test('Common Core Math: 80% = 4 of 5 standards', () => {
      // Common Core: Varies by state, but 80% is typical
      const result = calculateMastery({
        totalObjectives: 5,
        completedObjectives: 4,
        passPercentage: 80,
        standardType: 'content',
      });

      expect(result.hasMastery).toBe(true);
    });

    test('IEP Goal: 80% accuracy with 3 mandatory trials', () => {
      // IEP: Typically 80% accuracy, but must demonstrate consistently
      const result = calculateMastery({
        totalObjectives: 4,
        completedObjectives: 4, // 100% (all trials passed)
        mandatoryObjectiveIds: ['trial1', 'trial2', 'trial3'],
        completedMandatoryObjectives: 3,
        passPercentage: 80,
        standardType: 'content',
      });

      expect(result.hasMastery).toBe(true);
    });

    test('K12 Standards: 3 of 4 objectives with 1 mandatory', () => {
      const result = calculateMastery({
        totalObjectives: 4,
        completedObjectives: 3, // 75%
        mandatoryObjectiveIds: ['critical-skill'],
        completedMandatoryObjectives: 1,
        passPercentage: 80,
        standardType: 'content',
      });

      expect(result.hasMastery).toBe(false); // 75% < 80% required
    });
  });
});

/**
 * Usage Example:
 *
 * import { calculateMastery } from '@/lib/mastery/calculations';
 *
 * const result = calculateMastery({
 *   totalObjectives: 5,
 *   completedObjectives: 4,
 *   mandatoryObjectiveIds: ['obj1', 'obj2'],
 *   completedMandatoryObjectives: 2,
 *   standardType: 'content'
 * });
 *
 * console.log(result.hasMastery); // true/false
 * console.log(result.status); // 'mastered' | 'near-mastery' | 'in-progress' | 'not-started'
 */
