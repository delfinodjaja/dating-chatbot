import React, { useState } from "react";

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const response = await fetch("http://localhost:8000/chatbot/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ keep Django session cookie
        body: JSON.stringify({ message: input }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { sender: "bot", text: "Error: Could not get reply." }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Server error." }]);
    }

    setInput("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-lg bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 my-2 rounded-lg max-w-xs ${
                msg.sender === "user"
                  ? "ml-auto bg-pink-500"
                  : "mr-auto bg-gray-600"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            className="flex-1 p-3 rounded-l bg-gray-700 focus:outline-none"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-pink-500 hover:bg-pink-600 px-5 rounded-r"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;