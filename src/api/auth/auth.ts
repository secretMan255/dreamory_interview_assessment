import { AxiosClient } from '../axios';
import type { LoginDto, RegisterDto } from './auth.dto';
import type { LoginResponse } from './auth.response';

export class AuthApi {
    private static Instance: AuthApi

    private constructor() { }

    public static getInstance(): AuthApi {
        if (!this.Instance) {
            this.Instance = new AuthApi()
        }

        return this.Instance
    }

    public static async login(dto: LoginDto): Promise<LoginResponse> {
        const res = await AxiosClient.getInstance().post('/auth/login', dto)
        return res.data
    }

    public static async register(dto: RegisterDto) {
        await AxiosClient.getInstance().post('/auth/login', dto)
    }
}