import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [roomCode, setRoomCode] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [onlinePlayers, setOnlinePlayers] = useState([]);
    const [isOnlineMode, setIsOnlineMode] = useState(false);
    const [localPlayerId, setLocalPlayerId] = useState(null);

    useEffect(() => {
        // In unified hosting, the frontend and backend share the exact same origin URL.
        const backendUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:3001'  // Dev Server port 
            : window.location.origin;  // Prod Server matched port

        const newSocket = io(backendUrl);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setLocalPlayerId(newSocket.id);
        });

        // Setup global listeners that update context state
        newSocket.on('lobby_update', (players) => {
            setOnlinePlayers(players);
        });

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={{
            socket,
            roomCode, setRoomCode,
            isHost, setIsHost,
            onlinePlayers, setOnlinePlayers,
            isOnlineMode, setIsOnlineMode,
            localPlayerId
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);
