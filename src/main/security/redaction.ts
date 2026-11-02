const PAT_PATTERN = /figd_[A-Za-z0-9_-]+/g;
const BASIC_PATTERN = /Basic\s+[A-Za-z0-9+/=]+/gi;
const SENSITIVE_KEY = /^(pat|token|authorization|password|secret|cookie|credential)$/i;
const MAX_DEPTH = 4;

export function redactText(value: string): string {
  return value.replace(PAT_PATTERN, '[REDACTED_PAT]').replace(BASIC_PATTERN, 'Basic [REDACTED]');
}

export function redactValue(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return '[TRUNCATED]';
  if (typeof value === 'string') return redactText(value);
  if (Array.isArray(value)) return value.map((item) => redactValue(item, depth + 1));
  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      output[key] = SENSITIVE_KEY.test(key) ? '[REDACTED]' : redactValue(item, depth + 1);
    }
    return output;
  }
  return value;
}
