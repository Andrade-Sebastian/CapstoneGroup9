import React, { useState } from 'react'
import socket from '../Socket.js';
import { useSessionStore } from '../store/useSessionStore.tsx';

export default function ChatFooter() {
  const [message, setMessage] = useState('')

  const {
      hostName,
    } = useSessionStore()

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim() !== '' && hostName) {
      socket.emit("message", {
        text: message,
        name: hostName,
        id: `%{socket.id}${Math.random()}`,
        socketID: socket.id,
      });
      console.log('Sending message:', message)
      setMessage('')
    } else {
      console.log('Message is empty...')
    }
  }
  return (
    <form onSubmit={handleSendMessage} className="flex p-2 border-t bg-[#FEFEFE]" autoComplete='off'>
      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-grow px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
      />
      <button
        type="submit"
        className="ml-2 px-4 py-2 bg-[#7F56D9] text-white rounded-md hover:bg-[#6B46C1] transition cursor-pointer"
      >
        Send
      </button>
    </form>
  )
}
