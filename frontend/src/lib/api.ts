import { User, Question, AuthResponse } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    }

    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers })
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Request failed" }))
        throw new Error(error.detail || "Request failed")
    }
    return res.json()
}

export const api = {
    register: (username: string, email: string, password: string) =>
        request<User>("/auth/register", {
            method: "POST",
            body: JSON.stringify({ username, email, password }),
        }),

    login: async (username: string, password: string) => {
        const formData = new URLSearchParams()
        formData.append("username", username)
        formData.append("password", password)
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData,
        })
        if (!res.ok) throw new Error("Invalid credentials")
        const data: AuthResponse = await res.json()
        localStorage.setItem("token", data.access_token)
        return data
    },

    getMe: () => request<User>("/auth/me"),

    getQuestions: () => request<Question[]>("/questions"),

    createQuestion: (message: string) =>
        request<Question>("/questions", {
            method: "POST",
            body: JSON.stringify({ message }),
        }),

    answerQuestion: (id: number, answer: string) =>
        request<Question>(`/questions/${id}/answer`, {
            method: "POST",
            body: JSON.stringify({ answer }),
        }),

    updateStatus: (id: number, status: string) =>
        request<Question>(`/questions/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
        }),

    deleteQuestion: (id: number) =>
        request<{ message: string }>(`/questions/${id}`, { method: "DELETE" }),
}
