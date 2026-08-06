import axios from "axios";
import type { ApiErrorBody } from "@/types";

 HEAD
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://electrical-ai.onrender.com/api/v1


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://electrical-ai.onrender.com/api/v1";
import axios from "axios";
import type { ApiErrorBody } from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://electrical-ai.onrender.com/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError: ApiErrorBody = {
      error: error.response?.data?.error ?? "UNKNOWN_ERROR",
      message: error.response?.data?.message ?? error.message,
      fields: error.response?.data?.fields,
    };
    return Promise.reject(apiError);
  }
);
