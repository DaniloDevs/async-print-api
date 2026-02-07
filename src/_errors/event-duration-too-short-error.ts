export class EventDurationTooShortError extends Error {
  constructor(minMinutes: number, actualMinutes: number) {
    super(
      `Event duration ${actualMinutes}m is shorter than minimum allowed ${minMinutes}m`,
    );
    this.name = "EventDurationTooShortError";
  }
}
