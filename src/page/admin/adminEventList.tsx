import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box,
    Button,
    IconButton,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TablePagination,
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { EventDto, EventStatus } from '../../api/event/event.dto';
import { EventApi } from '../../api/event/event';
import EventFormDialog from '../../components/eventFormDialog';
import type { EventResponse, EventListResponse } from '../../api/event/event.response';

export default function AdminEventListPage() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<EventStatus | 'All'>('All')
    const [deleteTarget, setDeleteTarget] = useState<EventDto | null>(null)
    const [openForm, setOpenForm] = useState<{ open: boolean; event?: EventDto }>({ open: false })
    const [password, setPassword] = useState('')

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

    const deleteMutation = useMutation({
        mutationFn: (payload: { id: number; password: string }) =>
            EventApi.delete(payload.id, payload.password),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            setDeleteTarget(null);
            setPassword('');
        },
    });

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">Events</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenForm({ open: true })}
                >
                    Create Event
                </Button>
            </Stack>

            <Stack direction="row" spacing={2}>
                <TextField
                    fullWidth
                    size="small"
                    label="Search event by name or location"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Select
                    size="small"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EventStatus | 'All')}
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
                    overflowX: 'auto',
                    bgcolor: '#fff',
                }}
            >
                <Table
                    size="small"
                    stickyHeader
                    sx={{
                        minWidth: 650,
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paged.map((e: EventResponse) => (
                            <TableRow key={e.id} hover>
                                <TableCell
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/admin/events/${e.id}`)}
                                >
                                    {e.name}
                                </TableCell>
                                <TableCell>{e.startDate}</TableCell>
                                <TableCell>{e.endDate}</TableCell>
                                <TableCell>{e.location}</TableCell>
                                <TableCell>{e.status}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        size="small"
                                        onClick={() => setOpenForm({ open: true, event: e })}
                                    >
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => setDeleteTarget(e)}
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}

                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No events found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
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

            <EventFormDialog
                open={openForm.open}
                event={openForm.event}
                onClose={() => setOpenForm({ open: false })}
            />

            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography mb={2}>
                        Please enter your password to delete "{deleteTarget?.name}".
                    </Typography>
                    <TextField
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => {
                            if (!deleteTarget) return;
                            deleteMutation.mutate({
                                id: Number(deleteTarget.id),
                                password,
                            });
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
