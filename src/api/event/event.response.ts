import type { EventStatus } from './event.dto';

export interface EventResponse {
    id: number
    name: string
    startDate: string
    endDate: string
    location: string
    thumbnail: string | null
    description: string
    status: EventStatus
}

export interface EventListResponse {
    items: EventResponse[]
    total: number
}
