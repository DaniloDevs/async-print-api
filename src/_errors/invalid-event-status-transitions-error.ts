import { EventsStatus } from "../repository/events";

export class InvalidEventStatusTransitionError extends Error {
  constructor(from: EventsStatus, to: EventsStatus) {
    super(`Cannot change status from ${from} to ${to}`);
  }
}