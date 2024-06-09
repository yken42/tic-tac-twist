import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);
const apiUrl = import.meta.env.VITE_API_URL;

export const SocketProvider = ({ children }) => {
    
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io.connect(apiUrl);
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        }
    }, [])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}