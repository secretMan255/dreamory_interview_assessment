import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Divider,
    Stack,
    Typography
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { EventApi } from '../../api/event/event'
import type { EventResponse } from '../../api/event/event.response'
import { dateConverter, renderStatusChip } from '../../utils'

export default function UserEventDetailPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()

    const { data, isLoading, isError } = useQuery<EventResponse>({
        queryKey: ['event', id],
        enabled: !!id,
        queryFn: () => EventApi.getEvent(Number(id!))
    })

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%', height: '100%', boxSizing: 'border-box' }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Button
                    variant="text"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                >
                    Back
                </Button>
            </Stack>

            {isLoading ? (
                <Typography color="text.secondary" sx={{ mt: 2 }}>Loading event...</Typography>
            ) : isError || !data ? (
                <Typography color="error" sx={{ mt: 2 }}>Failed to load event.</Typography>
            ) : (
                <Card variant='outlined' sx={{ maxWidth: 980, mx: 'auto', overflow: 'hidden', border: 1, borderColor: 'divider', mt: 2 }}>
                    <Box sx={{ position: 'relative' }}>
                        <CardMedia
                            component="img"
                            image={data.thumbnail ?? 'https://placehold.co/1200x600'}
                            alt={data.name}
                            sx={{ height: { xs: 180, sm: 260 }, width: '100%', objectFit: 'cover' }}
                        />
                        <Chip label={data.status} size="small" color={renderStatusChip(data.status)} sx={{ position: 'absolute', top: 12, right: 12 }} />
                    </Box>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography variant="h5" fontWeight={700}>{data.name}</Typography>
                        <Typography variant="body2" color="text.secondary">Location: {data.location}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Date: {dateConverter(data.startDate)}{data.endDate ? ` — ${dateConverter(data.endDate)}` : ''}
                        </Typography>
                        <Divider sx={{ my: 1.5 }} />
                        {data.description && <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{data.description}</Typography>}
                    </CardContent>
                </Card>
            )}
        </Box>
    )
}