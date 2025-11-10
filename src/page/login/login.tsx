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
import type { LoginDto } from '../../api/auth/auth.dto';
import { useAuth } from '../../auth/auth.context';

export default function LoginPage() {
    const { register, handleSubmit } = useForm<LoginDto>()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const { login } = useAuth()

    const onSubmit = async (values: LoginDto) => {
        try {
            setError('')
            setLoading(true)

            const res = await AuthApi.login(values)
            login(res.accessToken)

            navigate('/admin')
        } catch (err: any) {
            setError(
                err?.response?.data?.message || 'Login failed. Please check credentials.'
            )
        } finally {
            setLoading(false)
            navigate('/admin')
        }
    };

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
                        Dreamory Login
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
                            variant="outlined"
                            fullWidth
                            {...register('email', { required: true })}
                        />

                        <TextField
                            label="Password"
                            type="password"
                            required
                            variant="outlined"
                            fullWidth
                            {...register('password', { required: true })}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            fullWidth
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                        <Typography variant="body2" mt={2} textAlign="center">
                            Don't have an account?{' '}
                            <Link component={RouterLink} to="/register">
                                Register
                            </Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
