"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"
import { Question } from "@/lib/types"
import { Send, Loader2, Sparkles } from "lucide-react"

interface Props {
    onSubmit: (q: Question) => void
}

export function QuestionForm({ onSubmit }: Props) {
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [focused, setFocused] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim()) return
        setLoading(true)
        try {
            const q = await api.createQuestion(message)
            onSubmit(q)
            setMessage("")
        } catch {
            // Error handled in parent
        }
        setLoading(false)
    }

    return (
        <Card className={`transition-all duration-300 ${focused ? "shadow-lg ring-2 ring-violet-500/20" : "shadow-sm"}`}>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-5 w-5 text-violet-500" />
                        <h3 className="font-semibold text-lg">Ask a Question</h3>
                    </div>
                    <Textarea
                        placeholder="What would you like to know? Type your question here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        rows={3}
                        className="resize-none text-base transition-all focus:ring-violet-500"
                    />
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                            {message.length > 0 ? `${message.length} characters` : "Be specific for better answers"}
                        </p>
                        <Button
                            type="submit"
                            disabled={loading || !message.trim()}
                            className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            {loading ? "Posting..." : "Post Question"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
