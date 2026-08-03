/* Tiny event bus so Hero knows when the preloader has handed the globe over. */

export const LOADER_EVENT = "ieee:loaded";
export const LOADER_KEY = "ieee-preloaded";

let done = false;

export function isLoaderDone() {
  return done;
}

export function markLoaderDone() {
  if (done) return;
  done = true;
  try {
    sessionStorage.setItem(LOADER_KEY, "1");
  } catch {
    /* storage blocked — loader simply replays next visit */
  }
  window.dispatchEvent(new CustomEvent(LOADER_EVENT));
}

export function hasPreloadedThisSession() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(LOADER_KEY) === "1";
  } catch {
    return false;
  }
}
