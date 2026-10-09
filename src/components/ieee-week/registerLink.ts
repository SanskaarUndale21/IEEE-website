import { selectEvent } from "./registerBus";

/** Spread onto an <a href="#register"> so the form below picks the right event. */
export function selectEventLink(slug: string) {
  return { onClick: () => selectEvent(slug) };
}
