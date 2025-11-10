import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    Alert,
    Link,
} from '@mui/material';
import { AuthApi } from '../../api/auth/auth';
import type { RegisterDto } from '../../api/auth/auth.dto';

export default function RegisterPage() {
    const { register, handleSubmit } = useForm<RegisterDto>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onSubmit = async (data: RegisterDto) => {
        try {
            setError('')
            setLoading(true)

            await AuthApi.register(data)

            navigate('/login')
        } catch (err: any) {
            setError(
                err?.response?.data?.message || 'Register failed'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Card sx={{ width: 360 }}>
                <CardContent>
                    <Typography variant="h5" mb={2} fontWeight={600}>
                        Dreamory Register
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit(onSubmit)}
                        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                        <TextField
                            label="Email"
                            type="email"
                            required
                            {...register('email', { required: true })}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            required
                            {...register('password', { required: true })}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            fullWidth
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </Button>
                    </Box>

                    <Typography variant="body2" mt={2} textAlign="center">
                        Already have an account?{' '}
                        <Link component={RouterLink} to="/login">
                            Login
                        </Link>
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    )
}