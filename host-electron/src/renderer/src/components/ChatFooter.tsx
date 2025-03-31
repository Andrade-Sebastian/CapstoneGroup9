import React, { useState } from 'react'

export default function ChatFooter() {
  const [message, setMessage] = useState('')
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim() !== '') {
      console.log('Sending message:', message)
      setMessage('')
    } else {
      console.log('Message is empty...')
    }
  }
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
