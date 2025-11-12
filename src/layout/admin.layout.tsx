import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
} from '@mui/material';
import { useAuth } from '../auth/auth.context';

export default function AdminLayout() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#121212',
            }}
        >
            <AppBar position="static" color="secondary">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Dreamory Admin Portal
                    </Typography>
                    <Button color="inherit" component={Link} to="/user">
                        User Events
                    </Button>
                    <Button color="inherit" onClick={handleLogout}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Box
                sx={{
                    flex: 1,
                    width: '100%',
                    p: { xs: 2, sm: 3 },
                    bgcolor: '#fafafa',
                    boxSizing: 'border-box',
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
