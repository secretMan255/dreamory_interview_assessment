import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { EventApi } from '../../api/event/event';
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, Chip, MenuItem, Select, Stack, TablePagination, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import type { EventDto, EventStatus } from '../../api/event/event.dto';
import { dateConverter, renderStatusChip } from '../../utils';
import type { EventListResponse, EventResponse } from '../../api/event/event.response';

export default function UserEventListPage() {
    const queryClient = useQueryClient()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const navigate = useNavigate()

    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<EventStatus | 'All'>('All')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const { data, isLoading } = useQuery<EventListResponse>({
        queryKey: ['events', page, rowsPerPage, search, status],
        queryFn: () =>
            EventApi.getList({
                page: page + 1,
                pageSize: rowsPerPage,
                keyword: search || undefined,
                status: status === 'All' ? undefined : status,
            })
    })

    const events: EventResponse[] = data?.items ?? []
    const total = data?.total ?? 0

    const filtered = useMemo(
        () =>
            events
                .filter((e) => (status === 'All' ? true : e.status === status))
                .filter((e) => {
                    const kw = search.toLowerCase();
                    return (
                        e.name.toLowerCase().includes(kw) ||
                        e.location.toLowerCase().includes(kw)
                    );
                })
                .sort(
                    (a, b) =>
                        new Date(a.startDate).getTime() -
                        new Date(b.startDate).getTime()
                ),
        [events, search, status],
    )

    useEffect(() => {
        setPage(0);
    }, [search, status]);

    const paged = useMemo(() => {
        const start = page * rowsPerPage;
        return filtered.slice(start, start + rowsPerPage);
    }, [filtered, page, rowsPerPage]);

    const handleViewDetail = (event: EventDto) => {
        navigate(`/user/events/${event.id}`)
    }

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                p: { xs: 2, sm: 3 },
                border: 1,
                borderColor: 'divider'
            }}
        >
            <Stack direction='row'>
                <Button
                    variant='outlined'
                    onClick={() => navigate('/admin')}
                >
                    Admin Portal
                </Button>
            </Stack>

            <Stack direction='row' spacing={0.5}>
                <Typography variant="h5" fontWeight={600}>
                    User Events Page
                </Typography>
            </Stack>

            <Stack direction='row' spacing={2}>
                <TextField
                    fullWidth
                    size='small'
                    label='Search event by name or location'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <Select
                    size="small"
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value as EventStatus | 'All');
                        setPage(0);
                    }}
                >
                    <MenuItem value="All">All Status</MenuItem>
                    <MenuItem value="Ongoing">Ongoing</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                </Select>
            </Stack>

            <Box
                sx={{
                    flex: 1,
                    width: '100%',
                    bgcolor: '#fff',
                    borderRadius: 1,
                    p: 2,
                    boxSizing: 'border-box',
                    overflow: 'auto',
                    border: 1,
                    borderColor: 'divider'
                }}
            >
                {isLoading ? (
                    <Typography variant="body2" color="text.secondary" align="center">
                        Loading events...
                    </Typography>
                ) : filtered.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center">
                        No events found.
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            display: 'grid',
                            gap: 2,
                            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(220px, 1fr))'
                        }}
                    >
                        {paged.map((e) => (
                            <Card
                                key={e.id}
                                variant='outlined'
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                }}
                            >
                                <CardActionArea
                                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                                    onClick={() => handleViewDetail(e)}
                                >
                                    <Box sx={{ position: 'relative', width: '100%' }}>
                                        <CardMedia
                                            component='img'
                                            image={e.thumbnail ?? 'https://placehold.co/600x400'}
                                            alt={e.name}
                                            sx={{
                                                height: 140,
                                                width: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <Chip label={e.status} size='small' color={renderStatusChip(e.status)} sx={{ position: 'absolute', top: 8, right: 8 }} />
                                    </Box>
                                    <CardContent
                                        sx={{
                                            flex: 1,
                                            width: '100%',
                                            display: 'grid',
                                            gridTemplateRows: 'auto auto 1fr auto',
                                            rowGap: 0.5,
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight={600} noWrap title={e.name}>
                                            {e.name}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" noWrap title={e.location}>
                                            {e.location}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ justifySelf: 'end', textAlign: 'left' }}
                                        >
                                            {dateConverter(e.startDate)}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        ))}
                    </Box>
                )}
            </Box>
            <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </Box>
    )
}