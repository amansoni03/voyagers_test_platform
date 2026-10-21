import { ProctorViolation } from '../types';

export function formatTimeRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function calculateIntegrityScore(violations: ProctorViolation[]): number {
  let score = 100;
  for (const v of violations) {
    if (v.severity === 'high') score -= 15;
    else if (v.severity === 'medium') score -= 8;
    else score -= 4;
  }
  return Math.max(10, Math.min(100, score));
}
