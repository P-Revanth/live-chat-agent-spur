"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type Message = {
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const STORAGE_KEY = "chat_session_id";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Load session and history on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem(STORAGE_KEY);
    if (storedSessionId) {
      setSessionId(storedSessionId);
      // Fetch conversation history
      fetch(`http://localhost:4000/chat/history/${storedSessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.messages && data.messages.length > 0) {
            setMessages(
              data.messages.map((msg: { sender: "user" | "ai"; text: string }) => ({
                ...msg,
                timestamp: new Date(), // We don't have stored timestamps, use current
              }))
            );
          }
        })
        .catch((err) => console.error("Failed to load history:", err));
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:4000/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, sessionId }),
      });

      const data = await response.json();

      // Store session ID if it's new
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem(STORAGE_KEY, data.sessionId);
      }

      setMessages((prev) => [...prev, { sender: "ai", text: data.reply, timestamp: new Date() }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Sorry, something went wrong. Please try again.", timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-linear-to-br from-[white] to-[#C0D0FD]">
      {/* Left Sidebar */}
      <div className="w-fit flex flex-col justify-between pb-6 pt-6">
        {/* Chatbot Name */}
        <div className="px-6 mb-10">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Noah"
              width={50}
              height={50}
            />
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-black tracking-wide">
                Noah
              </h1>
              <p className="text-slate-800 text-sm">
                Your e-commerce assistant
              </p>
            </div>
          </div>
        </div>

        {/* Robot Character */}
        <div className="flex w-fit">
          <div className="flex items-end gap-2">
            <Image
              src="/robot.png"
              alt="Robot"
              width={200}
              height={200}
              className="shrink-0"
            />
          </div>
          <div className="relative bg-white -left-7.5 rounded-xl w-40 h-fit rounded-bl-none px-3 py-2 mb-4">
            <p className="text-slate-800 font-medium max-w-40 text-sm leading-relaxed">
              Stuck on something? <span className="font-bold">Let me help, get a quick assist!</span>
            </p>
            {/* Speech bubble tail */}
            <div className="absolute -bottom-2 left-0 w-0 h-0 border-t-8 border-t-white border-r-8 border-r-transparent"></div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col p-10 rounded-tl-4xl rounded-bl-4xl shadow-xl backdrop-blur-md">

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 pl-15 pr-15 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-slate-500">
                <p className="text-4xl font-semibold">Welcome.!👋🏻</p>
                <p className="text-3xl mt-1">
                  How can I assist you today?
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl ${msg.sender === "user"
                  ? "bg-black text-white rounded-br-md"
                  : "bg-white text-black rounded-bl-md"
                  }`}
              >
                {msg.sender === "ai" && (
                  <span className="text-sm font-extrabold text-black block mb-1">
                    Noah
                  </span>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span className={`text-xs mt-1 block ${msg.sender === "user" ? "text-slate-300" : "text-slate-400"}`}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 text-slate-100 px-4 py-3 rounded-2xl rounded-bl-md">
                <span className="text-xs text-black block mb-1">
                  Noah
                </span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 pl-30 pr-30">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 text-black h-14 bg-white placeholder-slate-500 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C0D0FD] transition-all"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-black hover:bg-slate-400 disabled:bg-black-400 disabled:cursor-not-allowed p-3 rounded-full font-medium transition-all cursor-pointer"
            >
              <Image src="/send.svg" alt="Send" width={30} height={30} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}