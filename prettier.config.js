/**
 * Prettier Configuration for BETZ Sportsbook
 *
 * Enforces consistent code formatting across the codebase.
 * Run: npx prettier --write "src/**/*.{ts,tsx,css}"
 */

module.exports = {
  // Use single quotes for consistency with existing codebase
  singleQuote: true,

  // Use semicolons - required by TypeScript strict mode
  semi: true,

  // Use 2 spaces for indentation
  tabWidth: 2,
  useTabs: false,

  // Print trailing commas where valid in ES5 (objects, arrays, etc.)
  trailingComma: 'es5',

  // Use 100 character line width for better readability on modern displays
  printWidth: 100,

  // Use 'always' for arrow function parameters to be explicit
  arrowParens: 'always',

  // Preserve original line endings (LF on Unix/Mac, CRLF on Windows)
  endOfLine: 'auto',

  // Use single quotes in JSX
  jsxSingleQuote: false,

  // Use spaces instead of tabs
  useTabs: false,

  // Bracket spacing for objects
  bracketSpacing: true,

  // Put the > of a multi-line JSX element at the end of the last line
  bracketSameLine: false,

  // Format embedded code in markdown
  proseWrap: 'preserve',

  // Quote props in object only when required
  quoteProps: 'as-needed',

  // Enable HTML whitespace sensitivity
  htmlWhitespaceSensitivity: 'css',
};
