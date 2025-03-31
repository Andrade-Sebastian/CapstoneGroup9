import React from 'react';

export default function ChatBody() {
  return (
    <div className="flex flex-col flex-grow p-4 overflow-y-auto max-h-[50vh] space-y-4">
      <div className="flex flex-col text-sm space-y-2">
        <div className="self-end">
          <p className="text-right text-xs text-gray-500">You</p>
          <div className="bg-[#007AFF] text-white max-w-[300px] p-3 rounded-lg ml-auto">
            Hello
          </div>
        </div>
        <div className="self-start">
          <p className="text-left text-xs text-gray-500">Other</p>
          <div className="bg-[#E5E5EA] text-black max-w-[300px] p-3 rounded-lg">
            Yoo
          </div>
        </div>
      </div>
      <div className="text-center text-xs italic text-gray-500">Someone is typing...</div>
    </div>
  );
}
