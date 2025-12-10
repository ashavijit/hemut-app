"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function Header() {
    const { user, logout, loading } = useAuth()

    return (
        <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">
                    Hemut Q&A
                </Link>
                <nav className="flex gap-4 items-center">
                    {loading ? null : user ? (
                        <>
                            <span className="text-sm text-muted-foreground">
                                {user.username} {user.is_admin && "(Admin)"}
                            </span>
                            <Button variant="outline" size="sm" onClick={logout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">Register</Button>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}
