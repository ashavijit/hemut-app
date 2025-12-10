"use client"

import { Question } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface Props {
    question: Question
    onUpdate: (q: Question) => void
}

export function QuestionCard({ question, onUpdate }: Props) {
    const { user } = useAuth()
    const [answer, setAnswer] = useState("")
    const [loading, setLoading] = useState(false)

    const statusColors = {
        pending: "bg-yellow-500",
        escalated: "bg-red-500",
        answered: "bg-green-500",
    }

    const handleAnswer = async () => {
        if (!answer.trim()) return
        setLoading(true)
        try {
            const updated = await api.answerQuestion(question.id, answer)
            onUpdate(updated)
            setAnswer("")
        } catch { }
        setLoading(false)
    }

    const handleStatus = async (status: string) => {
        setLoading(true)
        try {
            const updated = await api.updateStatus(question.id, status)
            onUpdate(updated)
        } catch { }
        setLoading(false)
    }

    return (
        <Card className="mb-4">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <p className="text-sm text-muted-foreground">
                        {new Date(question.created_at).toLocaleString()}
                    </p>
                    <Badge className={statusColors[question.status]}>{question.status}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-lg mb-4">{question.message}</p>
                {question.answer && (
                    <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm font-medium">Answer:</p>
                        <p>{question.answer}</p>
                    </div>
                )}
                {!question.answer && (
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Type your answer..."
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        />
                        <Button onClick={handleAnswer} disabled={loading || !answer.trim()}>
                            Submit Answer
                        </Button>
                    </div>
                )}
            </CardContent>
            {user?.is_admin && (
                <CardFooter className="gap-2">
                    {question.status !== "answered" && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatus("answered")}
                            disabled={loading}
                        >
                            Mark Answered
                        </Button>
                    )}
                    {question.status !== "escalated" && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatus("escalated")}
                            disabled={loading}
                        >
                            Escalate
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    )
}
