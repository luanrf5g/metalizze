import axios from "axios";
import { getToken, removeToken } from "./auth";

export const api = axios.create({
  baseURL: 'http://192.168.3.54:3000'
})
