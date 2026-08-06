export interface FormErrors {
  title?: string;
  content?: string;
  abstract?: string;
  authorId?: string;
  communityId?: string;
  organizationId?: string;
  eventId?: string;
  tags?: string;
  tagInput?: string;
  tier?: string;
  resourceType?: string;
  visibility?: string;
  selectedApprovers?: string;
}

/**
 * Validates article form data (title, content, tags)
 * Used by Individual, Organization, Community, and Event post forms
 */
export function validateArticleForm(data: {
  title?: string;
  content?: string;
  tags?: string[];
}): FormErrors {
  const errors: FormErrors = {};

  // Title validation
  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters';
  } else if (data.title.length > 200) {
    errors.title = 'Title must be less than 200 characters';
  }

  // Content validation
  if (!data.content?.trim()) {
    errors.content = 'Content is required';
  } else if (data.content.trim().length < 20) {
    errors.content = 'Content must be at least 20 characters';
  }

  // Tags validation
  if (data.tags && data.tags.length > 5) {
    errors.tags = 'Maximum 5 tags allowed';
  }

  return errors;
}

/**
 * Validates individual article form
 */
export function validateIndividualArticle(data: {
  title?: string;
  content?: string;
  tags?: string[];
  tier?: string;
}): FormErrors {
  const errors = validateArticleForm(data);

  if (!data.tier?.trim()) {
    errors.tier = 'Content level is required';
  }

  return errors;
}

/**
 * Validates organization article form
 */
export function validateOrgArticle(data: {
  title?: string;
  content?: string;
  tier?: string;
  organizationId?: string;
  selectedApprovers?: string[];
}): FormErrors {
  const errors = validateArticleForm(data);

  if (!data.organizationId?.trim()) {
    errors.organizationId = 'Organization is required';
  }

  if (!data.tier?.trim()) {
    errors.tier = 'Content level is required';
  }

  if (!data.selectedApprovers || data.selectedApprovers.length === 0) {
    errors.selectedApprovers = 'At least one approver must be selected';
  }

  return errors;
}

/**
 * Validates community article form
 */
export function validateCommunityArticle(data: {
  title?: string;
  content?: string;
  communityId?: string;
  tier?: string;
  tags?: string[];
}): FormErrors {
  const errors = validateArticleForm(data);

  if (!data.communityId?.trim()) {
    errors.communityId = 'Community is required';
  }

  if (!data.tier?.trim()) {
    errors.tier = 'Content level is required';
  }

  return errors;
}

/**
 * Validates event article form
 */
export function validateEventArticle(data: {
  eventId?: string;
  title?: string;
  content?: string;
  resourceType?: string;
  visibility?: string;
}): FormErrors {
  const errors = validateArticleForm(data);

  if (!data.eventId?.trim()) {
    errors.eventId = 'Event is required';
  }

  if (!data.resourceType?.trim()) {
    errors.resourceType = 'Resource type is required';
  }

  if (!data.visibility?.trim()) {
    errors.visibility = 'Visibility is required';
  }

  return errors;
}

/**
 * Checks if form has any errors
 */
export function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some((error) => error !== undefined && error !== '');
}

/**
 * Gets error message for a specific field
 */
export function getFieldError(errors: FormErrors, field: keyof FormErrors): string | undefined {
  return errors[field];
}

/**
 * Validates character count for a field
 */
export function validateCharacterCount(
  text: string,
  minLength?: number,
  maxLength?: number
): string | undefined {
  if (minLength && text.trim().length < minLength) {
    return `Minimum ${minLength} characters required`;
  }
  if (maxLength && text.length > maxLength) {
    return `Maximum ${maxLength} characters allowed`;
  }
  return undefined;
}

/**
 * Gets character count info for display
 */
export function getCharacterCountInfo(text: string, maxLength: number): string {
  return `${text.length} / ${maxLength} characters`;
}
