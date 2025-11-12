export type EventStatus = 'Ongoing' | 'Completed'

export interface EventDto {
    id?: number
    name?: string
    startDate?: string
    endDate?: string
    location?: string
    description?: string
    status?: EventStatus
    thumbnail?: string | null
}

export interface EventPayloadDto {
    name: string
    startDate: string
    endDate: string
    location: string
    description: string
    status: EventStatus
    thumbnail: string | null
}

export interface GetEventListParams {
    page?: number
    pageSize?: number
    keyword?: string
    status?: EventStatus
    orderBy?: 'name' | 'startDate' | 'endDate' | 'location' | 'status'
    order?: 'asc' | 'desc'
}