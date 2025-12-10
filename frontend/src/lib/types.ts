export interface User {
    id: number
    username: string
    email: string
    is_admin: boolean
    created_at: string
}

export interface Question {
    [x: string]: any
    id: number
    message: string
    status: "pending" | "escalated" | "answered"
    answer: string | null
    user_id: number | null
    created_at: string
    updated_at: string
}

export interface AuthResponse {
    access_token: string
    token_type: string
}

export interface WSMessage {
    type: "new_question" | "question_answered" | "status_updated"
    data: Record<string, unknown>
}
