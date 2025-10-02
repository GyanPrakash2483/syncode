import { useState } from "react";

interface GeminiProps {
  openfile: string
  code: string
}

interface ChatMessage {
  sender: "user" | "llm",
  message: string
}

export default function Gemini(props: GeminiProps) {

  const [messages, setMessages] = useState<ChatMessage[]>([])

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#43474e]">
      <div className="h-full">
        Chat Window
      </div>
      <div className="bg-blue-400 h-[20%]">
        Text Window
      </div>
    </div>
  )
}