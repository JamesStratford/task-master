import React, { createContext, useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketClient = socketIOClient(`${process.env.REACT_APP_BACKEND_URL}`);
    setSocket(socketClient);

    // Cleanup the socket connection on component unmount
    return () => {
      socketClient.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};