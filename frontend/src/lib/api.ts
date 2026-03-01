import axios from "axios";
import { getToken, removeToken } from "./auth";

export const api = axios.create({
  baseURL: 'http://localhost:3000'
})

// Interceptor de request: injeta token JWT
api.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Interceptor de response: redireciona para login em caso de 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken()

      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)