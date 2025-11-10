export type EventStatus = 'Ongoing' | 'Completed'

export interface EventDto {
    id?: number
    name?: string
    startDate?: string
    endDate?: string
    location?: string
    status?: EventStatus
    thumbnailUrl?: string
}

export interface EventPayloadDto {
    name: string
    startDate: string
    endDate: string
    location: string
    status: EventStatus
    thumbnail: File | null
}

