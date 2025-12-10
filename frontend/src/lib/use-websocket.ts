"use client"

import { useEffect, useRef, useCallback } from "react"
import { WSMessage } from "@/lib/types"

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/ws"

export function useWebSocket(onMessage: (msg: WSMessage) => void) {
    const ws = useRef<WebSocket | null>(null)
    const reconnectTimer = useRef<NodeJS.Timeout>()

    const connect = useCallback(() => {
        if (ws.current?.readyState === WebSocket.OPEN) return

        ws.current = new WebSocket(WS_URL)

        ws.current.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data) as WSMessage
                onMessage(msg)
            } catch { }
        }

        ws.current.onclose = () => {
            reconnectTimer.current = setTimeout(connect, 3000)
        }

        ws.current.onerror = () => ws.current?.close()
    }, [onMessage])

    useEffect(() => {
        connect()
        return () => {
            clearTimeout(reconnectTimer.current)
            ws.current?.close()
        }
    }, [connect])

    return ws
}
