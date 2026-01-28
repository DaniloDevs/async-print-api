import type { EventStatus } from "../../../repository/event";


type MakeEventOverrides = Partial<{
   title: string,
   bannerKey: string | null,
   status: EventStatus,
   startAt: Date,
   endsAt: Date
}>

export function makeEvent(overrides: MakeEventOverrides = {}) {
   return {
      title: "Event Test",
      bannerKey: null,
      status: "active" as EventStatus,
      startAt: new Date(),
      endsAt: new Date(),
      ...overrides,
   };
}