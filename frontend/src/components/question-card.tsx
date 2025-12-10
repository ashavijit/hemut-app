"use client"

import { Question } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { Clock, CheckCircle2, AlertTriangle, Send, Loader2, ArrowUp, Check } from "lucide-react"

interface Props {
    question: Question
    onUpdate: (q: Question) => void
}

export function QuestionCard({ question, onUpdate }: Props) {
    const { user } = useAuth()
    const [answer, setAnswer] = useState("")
    const [loading, setLoading] = useState(false)
    const [showAnswerForm, setShowAnswerForm] = useState(false)

    const statusConfig = {
        pending: {
            color: "bg-amber-100 text-amber-700 border-amber-200",
            icon: Clock,
            label: "Pending"
        },
        escalated: {
            color: "bg-red-100 text-red-700 border-red-200",
            icon: AlertTriangle,
            label: "Escalated"
        },
        answered: {
            color: "bg-emerald-100 text-emerald-700 border-emerald-200",
            icon: CheckCircle2,
            label: "Answered"
        },
    }

    const config = statusConfig[question.status]
    const StatusIcon = config.icon

    const handleAnswer = async () => {
        if (!answer.trim()) return
        setLoading(true)
        try {
            const updated = await api.answerQuestion(question.id, answer)
            onUpdate(updated)
            setAnswer("")
            setShowAnswerForm(false)
            toast.success("Answer submitted successfully!")
        } catch {
            toast.error("Failed to submit answer")
        }
        setLoading(false)
    }

    const handleStatus = async (status: string) => {
        setLoading(true)
        try {
            const updated = await api.updateStatus(question.id, status)
            onUpdate(updated)
            toast.success(`Status updated to ${status}`)
        } catch {
            toast.error("Failed to update status")
        }
        setLoading(false)
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffSec = Math.floor(diffMs / 1000)
        const diffMin = Math.floor(diffSec / 60)
        const diffHr = Math.floor(diffMin / 60)
        const diffDay = Math.floor(diffHr / 24)

        if (diffSec < 10) return "Just now"
        if (diffSec < 60) return `${diffSec}s ago`
        if (diffMin < 60) return `${diffMin}m ago`
        if (diffHr < 24) return `${diffHr}h ago`
        if (diffDay < 7) return `${diffDay}d ago`
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    return (
        <Card className={`group transition-all duration-200 hover:shadow-md ${question.status === "escalated" ? "border-red-200 bg-red-50/30" : ""}`}>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDate(question.created_at)}</span>
                    </div>
                    <Badge variant="outline" className={`${config.color} gap-1.5 font-medium`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {config.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-base leading-relaxed">{question.message}</p>

                {question.answer && (
                    <div className="relative pl-4 border-l-2 border-emerald-400 bg-emerald-50/50 rounded-r-lg p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 mb-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Answer
                        </div>
                        <p className="text-sm text-foreground/80">{question.answer}</p>
                    </div>
                )}

                {!question.answer && !showAnswerForm && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAnswerForm(true)}
                        className="gap-2"
                    >
                        <Send className="h-4 w-4" />
                        Write an answer
                    </Button>
                )}

                {!question.answer && showAnswerForm && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                        <Textarea
                            placeholder="Type your answer here..."
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="min-h-[100px] resize-none"
                        />
                        <div className="flex gap-2">
                            <Button
                                onClick={handleAnswer}
                                disabled={loading || !answer.trim()}
                                className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Submit Answer
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => { setShowAnswerForm(false); setAnswer("") }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>

            {user?.is_admin && (
                <CardFooter className="pt-0 gap-2 border-t bg-muted/30">
                    <span className="text-xs text-muted-foreground mr-2">Admin:</span>
                    {question.status !== "answered" && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatus("answered")}
                            disabled={loading}
                            className="gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        >
                            <Check className="h-3.5 w-3.5" />
                            Mark Answered
                        </Button>
                    )}
                    {question.status !== "escalated" && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatus("escalated")}
                            disabled={loading}
                            className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <ArrowUp className="h-3.5 w-3.5" />
                            Escalate
                        </Button>
                    )}
                    {question.status !== "pending" && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatus("pending")}
                            disabled={loading}
                            className="gap-1.5"
                        >
                            <Clock className="h-3.5 w-3.5" />
                            Set Pending
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    )
}
