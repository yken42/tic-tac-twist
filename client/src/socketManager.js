import { io } from 'socket.io-client';

export const socket = io('htpp://localhost:3001');

socket.on('connect', () => {
    console.log('socket connected', socket.id);
})