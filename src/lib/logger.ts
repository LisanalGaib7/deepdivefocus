/**
 * Lightweight logger wrapper.
 *
 * Why this exists:
 *   - `console.log` calls scattered across the codebase ship straight to the
 *     production console. Some leak admin email addresses, user IDs, and
 *     internal state. That is both noisy and a (mild) info-disclosure risk.
 *   - We still want full visibility during development.
 *
 * Rules:
 *   - `logger.debug` / `logger.info` are stripped in production builds.
 *   - `logger.warn` / `logger.error` always run — those are real signal.
 *   - Never log raw user PII / tokens / session bodies, regardless of level.
 *
 * Migration: replace `console.log(...)` with `logger.debug(scope, ...)`,
 * and keep `console.error(...)` as `logger.error(scope, ...)`.
 */

const isDev = import.meta.env.DEV;

type Scope = string;

const fmt = (scope: Scope) => `[${scope}]`;

export const logger = {
  debug: (scope: Scope, ...args: unknown[]) => {
    if (isDev) console.log(fmt(scope), ...args);
  },
  info: (scope: Scope, ...args: unknown[]) => {
    if (isDev) console.info(fmt(scope), ...args);
  },
  warn: (scope: Scope, ...args: unknown[]) => {
    console.warn(fmt(scope), ...args);
  },
  error: (scope: Scope, ...args: unknown[]) => {
    console.error(fmt(scope), ...args);
  },
};
