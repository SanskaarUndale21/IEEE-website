/** Lets any event card pre-select an event in the registration form further down the page. */
export const SELECT_EVENT = "ieee-week:select-event";

export function selectEvent(slug: string) {
  window.dispatchEvent(new CustomEvent(SELECT_EVENT, { detail: slug }));
}
