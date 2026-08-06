/**
 * Mastery Calculation Logic for K12 Standards
 *
 * Based on research findings:
 * - Common Core: 60-80% threshold (context-dependent)
 * - AP College Board: 60-75% for maintaining standards
 * - K12 Standards-Based Grading: 70-80% typical
 * - IEP Goals: 70-80% (individualized)
 *
 * Viridian defaults to 80% for content standards, 75% for skill standards
 */

export interface MasteryCalculationInput {
  /** Total number of objectives in standard */
  totalObjectives: number;
  /** Number of objectives completed/mastered */
  completedObjectives: number;
  /** IDs of mandatory objectives */
  mandatoryObjectiveIds?: string[];
  /** Number of mandatory objectives completed */
  completedMandatoryObjectives?: number;
  /** Pass percentage required (0-100, default 80) */
  passPercentage?: number;
  /** Standard type: 'skill' or 'content' */
  standardType?: 'skill' | 'content';
}

export interface MasteryResult {
  /** Whether student has achieved mastery */
  hasMastery: boolean;
  /** Percentage of objectives completed (0-100) */
  completionPercentage: number;
  /** Percentage required for mastery */
  requiredPercentage: number;
  /** Gap to mastery (negative if exceeded) */
  gap: number;
  /** Status message for UI */
  status: 'not-started' | 'in-progress' | 'near-mastery' | 'mastered';
  /** Detailed breakdown for diagnostics */
  breakdown: {
    totalObjectives: number;
    completedObjectives: number;
    mandatoryObjectives?: number;
    completedMandatoryObjectives?: number;
    optionalObjectives?: number;
    completedOptionalObjectives?: number;
  };
}

/**
 * Calculate whether a student has achieved mastery on a standard
 *
 * Algorithm:
 * 1. If standard has mandatory objectives, student must complete ALL mandatory
 * 2. Then check total completion against passPercentage threshold
 * 3. For skill standards, use 75% default; for content, use 80% default
 */
export function calculateMastery(input: MasteryCalculationInput): MasteryResult {
  const {
    totalObjectives,
    completedObjectives,
    mandatoryObjectiveIds = [],
    completedMandatoryObjectives = 0,
    passPercentage,
    standardType = 'content',
  } = input;

  // Determine required percentage based on standard type
  const requiredPercentage = passPercentage ?? (standardType === 'skill' ? 75 : 80);

  // Calculate completion percentage
  const completionPercentage =
    totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0;

  // Check mandatory objectives requirement
  const hasMandatoryCompliance =
    mandatoryObjectiveIds.length === 0 ||
    completedMandatoryObjectives === mandatoryObjectiveIds.length;

  // Determine mastery: must pass mandatory AND hit threshold
  const hasMastery = hasMandatoryCompliance && completionPercentage >= requiredPercentage;

  // Calculate gap
  const gap = completionPercentage - requiredPercentage;

  // Determine status
  let status: 'not-started' | 'in-progress' | 'near-mastery' | 'mastered';
  if (completedObjectives === 0) {
    status = 'not-started';
  } else if (hasMastery) {
    status = 'mastered';
  } else if (gap >= -10) {
    // Within 10 percentage points of mastery
    status = 'near-mastery';
  } else {
    status = 'in-progress';
  }

  // Calculate optional objectives for breakdown
  const mandatoryCount = mandatoryObjectiveIds.length;
  const optionalObjectives = totalObjectives - mandatoryCount;
  const completedOptionalObjectives = completedObjectives - completedMandatoryObjectives;

  return {
    hasMastery,
    completionPercentage,
    requiredPercentage,
    gap,
    status,
    breakdown: {
      totalObjectives,
      completedObjectives,
      mandatoryObjectives: mandatoryCount > 0 ? mandatoryCount : undefined,
      completedMandatoryObjectives: mandatoryCount > 0 ? completedMandatoryObjectives : undefined,
      optionalObjectives: mandatoryCount > 0 ? optionalObjectives : undefined,
      completedOptionalObjectives: mandatoryCount > 0 ? completedOptionalObjectives : undefined,
    },
  };
}

/**
 * Batch calculate mastery for multiple standards
 */
export function calculateMasteryBatch(
  standards: MasteryCalculationInput[]
): MasteryResult[] {
  return standards.map(calculateMastery);
}

/**
 * Get recommended passPercentage for a standard type
 */
export function getDefaultPassPercentage(standardType: 'skill' | 'content'): number {
  // Based on research:
  // - Skill standards: 60-75% (align with AP College Board)
  // - Content standards: 70-80% (align with K12 best practices)
  return standardType === 'skill' ? 75 : 80;
}

/**
 * Format mastery result for display
 */
export function formatMasteryDisplay(result: MasteryResult): {
  label: string;
  color: string;
  icon: string;
  description: string;
} {
  const completionLabel = `${result.completionPercentage}%`;

  if (result.status === 'mastered') {
    return {
      label: '✓ Mastered',
      color: 'green',
      icon: '✓',
      description: `Achieved ${completionLabel}/${result.requiredPercentage}% required`,
    };
  }

  if (result.status === 'near-mastery') {
    return {
      label: 'Almost There',
      color: 'yellow',
      icon: '◐',
      description: `${completionLabel}/${result.requiredPercentage}% - ${Math.abs(result.gap)}% away`,
    };
  }

  if (result.status === 'in-progress') {
    return {
      label: 'In Progress',
      color: 'blue',
      icon: '◑',
      description: `${completionLabel}/${result.requiredPercentage}% - ${Math.abs(result.gap)}% away`,
    };
  }

  return {
    label: 'Not Started',
    color: 'gray',
    icon: '○',
    description: 'No progress yet',
  };
}

/**
 * Validate mastery calculation input
 */
export function validateMasteryInput(input: MasteryCalculationInput): {
  valid: boolean;
  error?: string;
} {
  if (input.totalObjectives <= 0) {
    return { valid: false, error: 'Total objectives must be greater than 0' };
  }

  if (input.completedObjectives < 0 || input.completedObjectives > input.totalObjectives) {
    return {
      valid: false,
      error: 'Completed objectives must be between 0 and total objectives',
    };
  }

  if (input.mandatoryObjectiveIds && input.mandatoryObjectiveIds.length > input.totalObjectives) {
    return { valid: false, error: 'Mandatory objectives cannot exceed total objectives' };
  }

  if (input.passPercentage !== undefined && (input.passPercentage < 0 || input.passPercentage > 100)) {
    return { valid: false, error: 'Pass percentage must be between 0 and 100' };
  }

  return { valid: true };
}
