"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { MessageCircleQuestion, LogOut, User, Shield } from "lucide-react"

export function Header() {
    const { user, logout, loading } = useAuth()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md group-hover:shadow-lg transition-shadow">
                        <MessageCircleQuestion className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        Hemut Q&A
                    </span>
                </Link>
                <nav className="flex gap-3 items-center">
                    {loading ? (
                        <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
                    ) : user ? (
                        <>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                                {user.is_admin ? (
                                    <Shield className="h-4 w-4 text-amber-500" />
                                ) : (
                                    <User className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="text-sm font-medium">{user.username}</span>
                                {user.is_admin && (
                                    <span className="text-xs bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded font-medium">
                                        Admin
                                    </span>
                                )}
                            </div>
                            <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}
