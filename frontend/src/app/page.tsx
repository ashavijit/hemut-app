"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Search, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Question } from "@/lib/types"
import { api } from "@/lib/api"
import { useWebSocket } from "@/lib/use-websocket"
import { useAuth } from "@/lib/auth-context"

import { QuestionForm } from "@/components/question-form"
import { QuestionCard } from "@/components/question-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

const ITEMS_PER_PAGE = 20

const QuestionList = ({ 
  data, 
  emptyMessage, 
  onUpdate 
}: { 
  data: Question[], 
  emptyMessage: string, 
  onUpdate: (q: Question) => void 
}) => {
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE)
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDisplayLimit(ITEMS_PER_PAGE)
  }, [data])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayLimit < data.length) {
          setDisplayLimit((prev) => prev + ITEMS_PER_PAGE)
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [displayLimit, data.length])

  const visibleData = useMemo(() => data.slice(0, displayLimit), [data, displayLimit])

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg border-muted">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {visibleData.map((q) => (
        <QuestionCard key={q.id} question={q} onUpdate={onUpdate} />
      ))}
      
      {displayLimit < data.length && (
        <div ref={observerTarget} className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      
      {displayLimit >= data.length && data.length > ITEMS_PER_PAGE && (
        <p className="text-center text-xs text-muted-foreground py-4">
          No more questions to load
        </p>
      )}
    </div>
  )
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const { user } = useAuth()

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const data = await api.getQuestions()
      setQuestions(data)
    } catch (error) {
      toast.error("Failed to load questions. Please refresh.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  const handleWSMessage = useCallback((msg: { type: string; data: Record<string, unknown> }) => {
    if (msg.type === "new_question") {
      const newQ = msg.data as unknown as Question
      
      setQuestions((prev) => {
        if (prev.some(q => q.id === newQ.id)) return prev
        return [newQ, ...prev]
      })

      if (user?.is_admin) {
        toast.info("New Question Arrived!", {
          description: newQ.message?.slice(0, 50) + "...",
        })
      }
    } else if (msg.type === "question_answered" || msg.type === "status_updated") {
      setQuestions((prev) =>
        prev.map((q) => (q.id === msg.data.id ? { ...q, ...msg.data } : q))
      )
    }
  }, [user?.is_admin])

  useWebSocket(handleWSMessage)

  const handleNewQuestion = (q: Question) => {
    setQuestions((prev) => [q, ...prev.filter((x) => x.id !== q.id)])
    toast.success("Question posted successfully!")
  }

  const handleUpdate = (q: Question) => {
    setQuestions((prev) => prev.map((x) => (x.id === q.id ? q : x)))
  }

  const filteredGroups = useMemo(() => {
    const searchFiltered = questions.filter(q => 
      q.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const sorted = [...searchFiltered].sort((a, b) => {
      if (a.status === "escalated" && b.status !== "escalated") return -1
      if (b.status === "escalated" && a.status !== "escalated") return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return {
      all: sorted,
      pending: sorted.filter((q) => q.status === "pending"),
      escalated: sorted.filter((q) => q.status === "escalated"),
      answered: sorted.filter((q) => q.status === "answered"),
    }
  }, [questions, searchQuery])

  return (
    <div className="container max-w-4xl py-8 mx-auto space-y-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Q&A Dashboard</h1>
          <p className="text-muted-foreground">Manage and respond to audience questions in real-time.</p>
        </div>
        
        <QuestionForm onSubmit={handleNewQuestion} />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[120px] w-full rounded-xl" />
          <Skeleton className="h-[120px] w-full rounded-xl" />
          <Skeleton className="h-[120px] w-full rounded-xl" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="all">All ({filteredGroups.all.length})</TabsTrigger>
            <TabsTrigger value="escalated" className="data-[state=active]:text-red-500">
              Escalated ({filteredGroups.escalated.length})
            </TabsTrigger>
            <TabsTrigger value="pending">Pending ({filteredGroups.pending.length})</TabsTrigger>
            <TabsTrigger value="answered">Answered ({filteredGroups.answered.length})</TabsTrigger>
          </TabsList>

          <div className="mt-4 min-h-[500px]">
            <TabsContent value="all" forceMount={activeTab === 'all' ? true : undefined} hidden={activeTab !== 'all'}>
              <QuestionList 
                data={filteredGroups.all} 
                emptyMessage={searchQuery ? "No matching questions found." : "No questions yet."}
                onUpdate={handleUpdate} 
              />
            </TabsContent>
            
            <TabsContent value="escalated" forceMount={activeTab === 'escalated' ? true : undefined} hidden={activeTab !== 'escalated'}>
              <QuestionList 
                data={filteredGroups.escalated} 
                emptyMessage="No escalated questions."
                onUpdate={handleUpdate} 
              />
            </TabsContent>
            
            <TabsContent value="pending" forceMount={activeTab === 'pending' ? true : undefined} hidden={activeTab !== 'pending'}>
              <QuestionList 
                data={filteredGroups.pending} 
                emptyMessage="No pending questions."
                onUpdate={handleUpdate} 
              />
            </TabsContent>
            
            <TabsContent value="answered" forceMount={activeTab === 'answered' ? true : undefined} hidden={activeTab !== 'answered'}>
              <QuestionList 
                data={filteredGroups.answered} 
                emptyMessage="No answered questions yet."
                onUpdate={handleUpdate} 
              />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  )
}