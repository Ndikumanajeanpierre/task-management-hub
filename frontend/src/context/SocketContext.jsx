import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const { token } = useAuth()
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (!token) {
      setSocket(null)
      return
    }

    const newSocket = io('http://localhost:5000', {
      auth: { token },                          // ← sends JWT to backend
      transports: ['websocket', 'polling'],     // ← fallback to polling if websocket fails
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected:', newSocket.id)
      setSocket(newSocket)                      // ← set AFTER confirmed connected
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
    })

    newSocket.on('connect_error', (err) => {
      console.error('🔴 Socket error:', err.message)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [token])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)