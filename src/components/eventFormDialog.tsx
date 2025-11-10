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
} from '@mui/material';
import { EventApi } from '../api/event/event';
import type { EventDto, EventStatus } from '../api/event/event.dto';
import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { data } from 'react-router-dom';

type FormInputs = {
    name: string
    startDate: string
    endDate: string
    location: string
    status: EventStatus,
    thumbnail: FileList
}

export default function EventFormDialog(props: {
    open: boolean
    event?: EventDto
    onClose: () => void
}) {
    const { open, event, onClose } = props
    const queryClient = useQueryClient()

    const { register, handleSubmit, reset } = useForm<FormInputs>()

    useEffect(() => {
        if (event) {
            reset({
                name: event.name,
                startDate: event.startDate,
                endDate: event.endDate,
                location: event.location,
                status: event.status
            })
        } else {
            reset({
                name: '',
                startDate: '',
                endDate: '',
                location: '',
                status: 'Ongoing'
            })
        }
    }, [event, reset])

    const mutation = useMutation({
        mutationFn: async (data: FormInputs) => {
            const file = data.thumbnail?.[0] || null;
            if (event) {
                return await EventApi.updateEvent(Number(event.id), {
                    name: data.name,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    location: data.location,
                    status: data.status,
                    thumbnail: file,
                });
            }
            return EventApi.createEvent({
                name: data.name,
                startDate: data.startDate,
                endDate: data.endDate,
                location: data.location,
                status: 'Ongoing',
                thumbnail: file,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            onClose();
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
                        {...register('name', { required: 'Event name is required' })}
                    />
                    <TextField
                        type="date"
                        label="Start Date"
                        InputLabelProps={{ shrink: true }}
                        {...register('startDate', { required: true })}
                    />
                    <TextField
                        type="date"
                        label="End Date"
                        InputLabelProps={{ shrink: true }}
                        {...register('endDate', { required: true })}
                    />
                    <TextField
                        label="Location"
                        fullWidth
                        {...register('location', { required: 'Location is required' })}
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
                    <Button variant="outlined" component="label">
                        Upload Thumbnail
                        <input type="file" hidden {...register('thumbnail')} />
                    </Button>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit(onSubmit)} variant="contained">
                    {event ? 'Save' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}