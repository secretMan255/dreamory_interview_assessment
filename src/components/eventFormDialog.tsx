import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Stack,
    Typography,
} from '@mui/material'
import { EventApi } from '../api/event/event'
import type { EventDto, EventStatus } from '../api/event/event.dto'
import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { compressAndEncode, base64SizeInBytes } from '../utils'

type FormInputs = {
    name: string
    startDate: string
    endDate: string
    location: string
    description: string
    status: EventStatus
    thumbnail?: FileList
}

export default function EventFormDialog(props: {
    open: boolean
    event?: EventDto
    onClose: () => void
}) {
    const { open, event, onClose } = props
    const queryClient = useQueryClient()

    const {
        register,
        handleSubmit,
        reset,
        watch,
        getValues,
        formState: { errors },
    } = useForm<FormInputs>()

    const [preview, setPreview] = useState<string | null>(event?.thumbnail ?? null)
    const thumbFiles = watch('thumbnail')

    const startDateValue = watch('startDate')

    useEffect(() => {
        if (event) {
            reset({
                name: event.name,
                startDate: event.startDate ? event.startDate.slice(0, 10) : '',
                endDate: event.endDate ? event.endDate.slice(0, 10) : '',
                location: event.location,
                description: event.description,
                status: event.status
            })
        } else {
            reset({
                name: '',
                startDate: '',
                endDate: '',
                location: '',
                description: '',
                status: 'Ongoing'
            })
        }
    }, [event, reset])

    useEffect(() => {
        const file = thumbFiles?.[0]
        if (!file) {
            setPreview(event?.thumbnail ?? null)
            return
        }
        const url = URL.createObjectURL(file)
        setPreview(url)
        return () => URL.revokeObjectURL(url)
    }, [thumbFiles, event])

    const mutation = useMutation({
        mutationFn: async (data: FormInputs) => {
            const file = data.thumbnail?.[0]
            let thumbnail: string | undefined = event?.thumbnail || undefined

            if (file) {
                const encoded = await compressAndEncode(file, { maxW: 1200, maxH: 1200, quality: 0.8, mime: 'image/webp' })
                if (base64SizeInBytes(encoded) > 1 * 1024 * 1024) {
                    new Error('Image still too large after compression (limit 1MB). Try a smaller image.')
                }
                thumbnail = encoded
            }

            if (event) {
                return EventApi.updateEvent(Number(event.id), {
                    name: data.name,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    location: data.location,
                    status: data.status,
                    description: data.description,
                    thumbnail: thumbnail ?? null,
                })
            }

            return EventApi.createEvent({
                name: data.name,
                startDate: data.startDate,
                endDate: data.endDate,
                location: data.location,
                status: data.status,
                description: data.description,
                thumbnail: thumbnail ?? null,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] })
            reset({
                name: '',
                startDate: '',
                endDate: '',
                location: '',
                description: '',
                status: 'Ongoing'
            })
            onClose()
        },
    })

    const onSubmit = (data: FormInputs) => {
        mutation.mutate(data)
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
            <DialogTitle>{event ? 'Edit Event' : 'Create Event'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <TextField
                        label="Event Name"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        {...register('name', { required: 'Event name is required' })}
                    />

                    <TextField
                        type="date"
                        label="Start Date"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.startDate}
                        helperText={errors.startDate?.message}
                        {...register('startDate', { required: 'Start date is required' })}
                    />

                    <TextField
                        type="date"
                        label="End Date"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: startDateValue || undefined }}
                        error={!!errors.endDate}
                        helperText={errors.endDate?.message}
                        {...register('endDate', {
                            required: 'End date is required',
                            validate: (value) =>
                                new Date(value) >= new Date(getValues('startDate')) ||
                                'End date cannot be earlier than start date',
                        })}
                    />

                    <TextField
                        label="Location"
                        fullWidth
                        error={!!errors.location}
                        helperText={errors.location?.message}
                        {...register('location', { required: 'Location is required' })}
                    />

                    <TextField
                        label='Description'
                        fullWidth
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        {...register('description', { required: 'Description is required' })}
                    />

                    {event && (
                        <FormControl>
                            <InputLabel id="status-label">Status</InputLabel>
                            <Select
                                labelId="status-label"
                                label="Status"
                                defaultValue={event.status}
                                {...register('status')}
                            >
                                <MenuItem value="Ongoing">Ongoing</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    {preview && (
                        <img
                            src={preview}
                            alt="Preview Thumbnail"
                            style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 8 }}
                        />
                    )}

                    <Button variant="outlined" component="label">
                        Upload Thumbnail
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            {...register('thumbnail', {
                                validate: (files: FileList | undefined) => {
                                    const f = files?.[0]
                                    if (!f) return true
                                    if (!f.type.startsWith('image/')) return 'File must be an image'
                                    if (f.size > 5 * 1024 * 1024) return 'Image must be ≤ 5 MB'
                                    return true
                                },
                            })}
                        />
                    </Button>

                    {errors.thumbnail?.message && (
                        <Typography variant="body2" color="error">
                            {String(errors.thumbnail.message)}
                        </Typography>
                    )}

                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={mutation.isPending}>
                    {event ? 'Save' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
