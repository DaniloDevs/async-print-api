export class EventEndBeforeStartError extends Error {
   constructor(startAt: Date, endsAt: Date) {
     super(
       `Event end date ${endsAt.toISOString()} cannot be before start date ${startAt.toISOString()}`
     )
     this.name = 'EventEndBeforeStartError'
   }
 }
 