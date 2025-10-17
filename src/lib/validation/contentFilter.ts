import {
  RegExpMatcher,
  TextCensor,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";

// Initialize the matcher with English dataset
const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

// Optional: Create a censor if you want to replace bad words with asterisks
const censor = new TextCensor();

export interface ValidationResult {
  valid: boolean;
  error?: string;
  cleanedText?: string;
  matches?: string[];
}

/**
 * Check if text contains profanity
 */
export const containsProfanity = (text: string): boolean => {
  if (!text) return false;
  const matches = matcher.getAllMatches(text);
  return matches.length > 0;
};

/**
 * Validate text content with comprehensive checks
 */
export const validateContent = (
  text: string,
  fieldName: string = "Content",
  options: {
    minLength?: number;
    maxLength?: number;
    allowEmpty?: boolean;
  } = {}
): ValidationResult => {
  // Check if empty
  if (!text || text.trim().length === 0) {
    console.log("test is empty");

    if (options.allowEmpty) {
      return { valid: true };
    }
    return { valid: false, error: `${fieldName} cannot be empty` };
  }

  // Check length
  if (options.minLength && text.length < options.minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${options.minLength} characters`,
    };
  }

  if (options.maxLength && text.length > options.maxLength) {
    return {
      valid: false,
      error: `${fieldName} must be less than ${options.maxLength} characters`,
    };
  }

  const matches = matcher.getAllMatches(text);

  if (matches.length > 0) {
    const profaneWords = matches.map((match) =>
      text.substring(match.startIndex, match.endIndex)
    );

    console.log("Profanity detected:", profaneWords); // Debug log

    return {
      valid: false,
      error: `${fieldName} contains inappropriate language`,
      cleanedText: censor.applyTo(text, matches),
      matches: profaneWords,
    };
  }

  return { valid: true };
};

/**
 * Specific validators for different fields
 */
export const validateDeckName = (name: string): ValidationResult => {
  return validateContent(name, "Deck name", {
    minLength: 1,
    maxLength: 100,
  });
};

export const validateDescription = (description: string): ValidationResult => {
  return validateContent(description, "Description", {
    maxLength: 500,
    allowEmpty: true,
  });
};

export const validateUsername = (username: string): ValidationResult =>
  validateContent(username, "Username", {
    minLength: 3,
    maxLength: 30,
  });
