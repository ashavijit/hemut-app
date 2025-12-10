"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { Question } from "@/lib/types"

interface Props {
    onSubmit: (q: Question) => void
}

export function QuestionForm({ onSubmit }: Props) {
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim()) {
            setError("Question cannot be empty")
            return
        }
        setError("")
        setLoading(true)
        try {
            const q = await api.createQuestion(message)
            onSubmit(q)
            setMessage("")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to submit")
        }
        setLoading(false)
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Ask a Question</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                        placeholder="Type your question here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" disabled={loading}>
                        {loading ? "Submitting..." : "Submit Question"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
