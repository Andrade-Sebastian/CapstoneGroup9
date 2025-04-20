import React, { useState } from 'react'
import socket from "../Views/socket.tsx";
import { useJoinerStore } from '../hooks/stores/useJoinerStore.ts'
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ChatFooter() {
  const [message, setMessage] = useState('')

  const {
      nickname,
    } = useJoinerStore()

  const handleSendMessage = async (e) => {
    e.preventDefault()
    try{
      if (message.trim() !== '' && nickname) {
        const isValidMessage = await checkMessage(message);
        if(!isValidMessage){
          toast.error("No profanity allowed!");
          return;
        }
        socket.emit("message", {
          text: message,
          name: nickname,
          id: `%{socket.id}${Date.now()}`,
          socketID: socket.id,
        });
        console.log('Sending message:', message)
        setMessage('')
      } else {
        console.log('Message is empty...')
      }
    }
    catch (error) {
      console.log("There was an error checking the message");
      toast.error("There was an error sending the message. Wait and try again. ")
    }
  }

  const checkMessage = async (message: string) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/joiner/check-message/`, {
        params: {message},
      });
      console.log("RESPONSE STATUS RETURNED: ", response.status);
      if (response.status === 200) {
        console.log("Message is valid");
        return true;
      }
    } catch (error) {
      if (error.response.status === 400) {
        console.log("Message is not valid");
      } else {
        console.log("Could not check message", error);
      }
      return false;
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="flex p-2 border-t bg-[#FEFEFE]">
      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-grow px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
      />
      <button
        type="submit"
        className="ml-2 px-4 py-2 bg-[#7F56D9] text-white rounded-md hover:bg-[#6B46C1] transition"
      >
        Send
      </button>
    </form>
  )
}
