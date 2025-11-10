import { AxiosClient } from '../axios'
import type { EventDto, EventPayloadDto } from './event.dto'
import type { EventResponse } from './event.response'

export class EventApi {
    private static Instance: EventApi

    private constructor() { }

    public static getInstance(): EventApi {
        if (!this.Instance) {
            this.Instance = new EventApi()
        }

        return this.Instance
    }

    public static async getList(dto: EventDto): Promise<EventResponse[]> {
        const res = await AxiosClient.getInstance().get('/events', { params: dto })
        return res.data
    }

    public static async getEvent(id: number): Promise<EventResponse> {
        const res = await AxiosClient.getInstance().get(`/events/${id}`)
        return res.data
    }

    public static async createEvent(payload: EventPayloadDto) {
        const form = new FormData()
        form.append('name', payload.name)
        form.append('startDate', payload.startDate)
        form.append('endDate', payload.endDate)
        form.append('location', payload.location)
        if (payload.thumbnail) form.append('thumbnail', payload.thumbnail)

        const res = await AxiosClient.getInstance().post('/create', form)
        return res.data
    }

    public static async updateEvent(id: number, payload: EventPayloadDto) {
        const form = new FormData()
        form.append('name', payload.name)
        form.append('startDate', payload.startDate)
        form.append('endDate', payload.endDate)
        form.append('location', payload.location)
        if (payload.status) form.append('status', payload.status)
        if (payload.thumbnail) form.append('thumbnail', payload.thumbnail)

        const res = await AxiosClient.getInstance().put(`/events/${id}`, form)
        return res.data
    }

    public static async delete(id: number, password: string) {
        const res = await AxiosClient.getInstance().request({
            url: `/events/${id}`,
            method: 'DELETE',
            data: { password }
        })

        return res.data
    }
}