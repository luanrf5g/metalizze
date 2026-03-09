import axios from "axios";
import { getToken, removeToken } from "./auth";

export const api = axios.create({
  baseURL: 'http://192.168.3.54:3000'
})

api.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
