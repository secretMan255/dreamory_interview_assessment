import type { EventStatus } from './event.dto'

export interface EventResponse {
    id: number
    name: string
    startDate: string
    endDate: string
    location: string
    status: EventStatus
}