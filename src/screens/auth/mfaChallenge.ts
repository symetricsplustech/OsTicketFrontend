interface Challenge {
  mfaToken: string;
}
let pending: Challenge | null = null;

// Kept only in this tab's memory, never in the URL, history state or storage.
export function setMfaChallenge(challenge: Challenge) {
  pending = challenge;
}
export function getMfaChallenge() {
  return pending;
}
export function clearMfaChallenge() {
  pending = null;
}
