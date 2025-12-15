export class EventStartDateInPastError extends Error {
   constructor(startAt: Date) {
     super(`Event start date ${startAt.toISOString()} cannot be in the past`)
     this.name = 'EventStartDateInPastError'
   }
 }
 