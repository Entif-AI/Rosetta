/** Shared structural checks for Pack-defined Profiles over Core Evaluation. */
export function isProfileRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isProfileString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function isProfileRefs(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isProfileString);
}

export function checkProfileFields(record: Record<string, unknown>, fields: readonly string[], errors: string[], path: string): void {
  for (const field of Object.keys(record)) if (!fields.includes(field)) errors.push(`${path} does not allow field: ${field}`);
}

export function checkProfileStrings(record: Record<string, unknown>, fields: readonly string[], errors: string[], path: string): void {
  for (const field of fields) if (!isProfileString(record[field])) errors.push(`${path}.${field} must be a non-empty string.`);
}

export function checkProfileRefs(record: Record<string, unknown>, fields: readonly string[], errors: string[], path: string): void {
  for (const field of fields) if (!isProfileRefs(record[field])) errors.push(`${path}.${field} must be an array of non-empty references.`);
}

export const CORE_EVALUATION_VERDICTS = ['deny', 'fail', 'partial', 'pass', 'unknown'] as const;

/** RFC 3339 timestamp with ordinary seconds (00..59); leap-second instants are outside v1. */
export function isProfileTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:[Zz]|([+-])(\d{2}):(\d{2}))$/u.exec(value);
  if (!match) return false;
  const [, year, month, day, hour, minute, second, , offsetHour, offsetMinute] = match;
  const y = Number(year);
  const leapYear = y % 400 === 0 || (y % 4 === 0 && y % 100 !== 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][Number(month) - 1];
  return Number(month) >= 1 && Number(month) <= 12 && Number(day) >= 1 && Number(day) <= daysInMonth &&
    Number(hour) < 24 && Number(minute) < 60 && Number(second) < 60 &&
    (!offsetHour || Number(offsetHour) < 24) && (!offsetMinute || Number(offsetMinute) < 60) && Number.isFinite(Date.parse(value));
}

/** Compares full declared fractions without rounding them to JavaScript milliseconds. */
export function compareProfileTimestamps(left: string, right: string): number {
  const seconds = Math.floor(Date.parse(left) / 1_000) - Math.floor(Date.parse(right) / 1_000);
  if (seconds !== 0) return Math.sign(seconds);
  const leftFraction = /\.(\d+)/u.exec(left)?.[1] ?? '';
  const rightFraction = /\.(\d+)/u.exec(right)?.[1] ?? '';
  const precision = Math.max(leftFraction.length, rightFraction.length);
  const a = leftFraction.padEnd(precision, '0'); const b = rightFraction.padEnd(precision, '0');
  return a === b ? 0 : a < b ? -1 : 1;
}
