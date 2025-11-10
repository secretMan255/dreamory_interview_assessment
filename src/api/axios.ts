import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, clearAccessToken } from '../auth/auth.store'

export class AxiosClient {
    private static instance: AxiosInstance

    private constructor() { }

    public static getInstance(): AxiosInstance {
        if (!this.instance) {
            this.instance = axios.create({
                baseURL: import.meta.env.VITE_API_BASE_URL as string,
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: false,
            })

            this.instance.interceptors.request.use(
                (config: InternalAxiosRequestConfig) => {
                    const token = getAccessToken()
                    if (token) {
                        config.headers = config.headers || {}
                            ; (config.headers as any).Authorization = `Bearer ${token}`
                    }
                    return config
                },
                (error: any) => Promise.reject(error)
            )

            // check status promt alert
            this.instance.interceptors.response.use(
                (response: AxiosResponse) => {
                    // if (response.data?.ret === STATUS.FAIL || response.data?.data?.ret === STATUS.FAIL) {
                    //     showToast({
                    //         title: 'Warning',
                    //         description: response.data?.data?.msg || response.data?.msg || 'Something went wrong'
                    //     })
                    //     return Promise.reject(response.data)
                    // } else if (response.data?.ret === STATUS.SUCCESS && response.data?.msg) {
                    //     showToast({
                    //         title: "Success",
                    //         description: response.data?.data?.msg
                    //     })
                    // }
                    return response.data
                },
                (error: { response: { status: any; data: { msg: any; message: any }; statusText: any }; message: any }) => {
                    const status = error.response?.status

                    if (status === 401 || status === 403) clearAccessToken()

                    // showToast({
                    //     title: 'API Error',
                    //     description:
                    //         error.response?.data?.msg ||
                    //         error.response?.data?.message ||
                    //         error?.message ||
                    //         error?.response?.statusText ||
                    //         'Unknown error occurred'
                    // })
                    return Promise.reject(error)
                }
            )
        }
        return this.instance
    }
}