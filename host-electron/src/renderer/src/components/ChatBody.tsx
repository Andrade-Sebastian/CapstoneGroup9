import React, {useState, useEffect, useRef} from 'react';
import socket from '../Socket.js';
import { useSessionStore } from '../store/useSessionStore.tsx';
import useBrainflowManager from '../hooks/useBrainflowManager.ts';

export default function ChatBody() {
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

    const {
        hostName,
      } = useSessionStore()

  useEffect(() => {
    const handleMessage = (data) =>{
      console.log("Message receieved", data);
      setMessages((prevMessages) => [...prevMessages, data]);

    }
    socket.on("message", handleMessage)
    return () => {
      socket.off("message", handleMessage);
    }
  }, [])

  useEffect(() =>{
    bottomRef.current?.scrollIntoView({ behavior: 'smooth'});
  }, [messages]);
  return (
    <div className="flex flex-col flex-grow p-4 overflow-y-auto max-h-[50vh] space-y-4">
      <div className="flex flex-col text-sm space-y-2">
      {messages.map((message) =>
      message.name === hostName ? (
        <div className="self-end" key={message.id}>
          <p className="text-right text-xs text-gray-500">You</p>
          <div className="bg-[#007AFF] text-white max-w-[300px] p-3 rounded-lg ml-auto">
            <p>{message.text}</p>
          </div>
        </div>
      ):(
        <div className="self-start" key={message.id}>
          <p className="text-left text-xs text-gray-500">{message.name}</p>
          <div className="bg-[#E5E5EA] text-black max-w-[300px] p-3 rounded-lg">
            <p>{message.text}</p>
          </div>
        </div>

      ))}
    </div>
    <div ref={bottomRef}/>
    </div>
    );}

//https://dev.to/novu/building-a-chat-app-with-socketio-and-react-2edj
