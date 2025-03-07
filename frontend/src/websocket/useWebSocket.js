import { useState, useEffect, useRef } from "react";

const useWebSocket = (url) => {
  const [socketMessages, setSocketMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    socketRef.current = new WebSocket(`ws://localhost:8081/${url}/`);

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    socketRef.current.onmessage = (event) => {
      console.log("Received:", event.data);
      if (event.data) {
        const parsedData = JSON.parse(event.data);
        // Only update state if message type is 'text'
        if (
          parsedData.type === "agent_response"
        ) {
          setSocketMessages((prev) => [...prev, parsedData]);
        }
      }
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket closed. Reconnecting...");
      setIsConnected(false);
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      socketRef.current.close();
    };
  };

  const sendSocketMessage = (message) => {    
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      
      const newMessage =  JSON.stringify(message)
      socketRef.current.send(newMessage);
    } else {
      console.warn("WebSocket is not connected. Message not sent.");
    }
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return { socketMessages, sendSocketMessage, isConnected };
};

export default useWebSocket;