export class EventItem {
  id: string
  title: string
  startDate: string
  note: string
  imageUrl?: string
  
  userId: string
  email: string
  createdAt: string
  notified: boolean
  state: string = EventState.PENDING
}


export enum EventState {
  PENDING = "Pending",
  COMPLETED = "Completed"
}