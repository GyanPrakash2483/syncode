import { CircleStopIcon, SendHorizontal } from "lucide-react";
import { Button } from "primereact/button";
import React, { useState, useRef, useEffect } from "react";
import api from "../api";
import GeminiSparkleAurora from "../assets/gemini_sparkle_aurora.svg"
import Markdown from "react-markdown";

interface GeminiProps {
  username: string;
  openfile: string;
  code: string;
}

interface ChatMessage {
  sender: "user" | "llm";
  message: string;
}

interface MessageProps {
  chatMessage: ChatMessage;
}

function Message(props: MessageProps) {
  if (props.chatMessage.sender === "user") {
    return (
      <div
        className="bg-[#1265c5] w-fit ml-auto max-w-[70%] p-2 rounded-tl-xl rounded-bl-xl rounded-br-xl my-4 whitespace-pre-line"
      >
        {props.chatMessage.message}
      </div>
    )
  } else {
    return (
      <div
        className="max-w-[400px] wrap-normal w-fit p-2"
      >
        <Markdown>
          {props.chatMessage.message}
        </Markdown>
      </div>
    )
  }

}

export default function Gemini(props: GeminiProps) {

  const [messages, setMessages] = useState<ChatMessage[]>([])

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [userMessage, setUserMessage] = useState<string>("")

  const [isGeneratingContent, setIsGeneratingContent] = useState<boolean>(false);

  const sendMessage = async () => {
    if (isGeneratingContent) {
      return;
    }
    setIsGeneratingContent(true)

    setMessages((prev: ChatMessage[]) => {
      const newMessages: ChatMessage[] = [...prev];

      newMessages.push({
        sender: "user",
        message: userMessage
      })

      return newMessages;
    });

    setMessages((prev: ChatMessage[]) => {
      const newMessages: ChatMessage[] = [...prev];

      newMessages.push({
        sender: "llm",
        message: "**_**"
      })

      return newMessages;
    });

    const message = userMessage;
    setUserMessage("");

    const response = await api.googleGenerativeAI(props.username, props.openfile, props.code, message);

    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullMessage = "";
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunkText = decoder.decode(value);
          console.log(chunkText);
          fullMessage += chunkText;

          setMessages((prev: ChatMessage[]) => {
            const newMessages: ChatMessage[] = [...prev];
            const lastIndex: number = newMessages.length - 1;

            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              message: fullMessage + "**__**"
            }

            return newMessages;
          });
        }
      }

      setMessages((prev: ChatMessage[]) => {
        const newMessages: ChatMessage[] = [...prev];
        const lastIndex: number = newMessages.length - 1;

        newMessages[lastIndex] = {
          ...newMessages[lastIndex],
          message: fullMessage
        }

        return newMessages;
      });
    }

    setIsGeneratingContent(false);
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [userMessage])

  const messageContainerRef = useRef<HTMLDivElement>(null);

  const [initialMessageContainerHeight, setInitialMessageContainerHeight] = useState<number>(0);
  
  useEffect(() => {
    if (messageContainerRef.current) {
      setTimeout(() => {
        setInitialMessageContainerHeight(messageContainerRef.current?.clientHeight || 800);
      }, 3000)
    }
  }, [])

  useEffect(() => {
    if(messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages])

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#1d1f22]">
      <div className="text-sm p-1 bg-gray-950 flex items-center justify-end pr-4">
        Model: gemini-2.5-flash
      </div>
      {
        messages.length === 0
        ?
        <div
          className="h-full overflow-y-scroll p-2 flex flex-col items-center justify-center gap-8"
          ref={messageContainerRef}
          style={{
            height: initialMessageContainerHeight ? `${initialMessageContainerHeight}px` : "100%"
          }}
        >
          <img
            src={GeminiSparkleAurora}
            width={150}
          />
          <span
            className="text-2xl font-bold bg-gradient-to-r from-[#EA4335] via-[#4285F4] to-[#34A853] text-transparent bg-clip-text"
          >
            Ask Gemini
          </span>
        </div>
        :
        <div
          className="overflow-y-scroll p-2"
          ref={messageContainerRef}
          style={{
            height: initialMessageContainerHeight ? `${initialMessageContainerHeight}px` : "100%"
          }}
        >
          {
            messages.map((message: ChatMessage, index: number) => {
              return (
                <Message chatMessage={message} key={index} />
              )
            })
          }
        </div>
      }
      <div className="bg-[#3b3d42] overflow-visible m-2 rounded-sm p-2">
        <textarea
          ref={textAreaRef}
          className="w-full h-auto resize-none outline-none border-0"
          placeholder="Ask Gemini..."
          value={userMessage}
          onChange={e => setUserMessage(e.target.value)}
          onKeyDown={handleKeyDown}

        />
        <div className="flex justify-end">
          <Button
            style={{
              backgroundColor: "#00000000",
              border: "none",
              padding: 10,
              color: "white"
            }}
            disabled={isGeneratingContent}
          >
            {
              isGeneratingContent
                ?
                <CircleStopIcon
                  className="animate-pulse"
                />
                :
                <SendHorizontal
                  onClick={sendMessage}
                />
            }
          </Button>
        </div>
      </div>
    </div>
  )
}