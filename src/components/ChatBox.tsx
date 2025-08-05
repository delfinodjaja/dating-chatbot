import React, { useState, useEffect, useRef } from "react";

type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
};

interface ChatBoxProps {
  behavior: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ behavior }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: input.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text, behavior }),
      });
      const data = await res.json();

      const botMessage: Message = {
        id: Date.now() + 1,
        sender: "bot",
        text: data.reply,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: "bot",
          text: "⚠️ Sorry, something went wrong.",
        },
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbox-container">
      <header className="chat-header">
        <h2>💖 Dating Chatbot</h2>
        <span className="behavior">Mode: {behavior}</span>
      </header>

      <div className="messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender}`}
          >
            <span>{msg.text}</span>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <div className="input-area">
        <textarea
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? "..." : "➤"}
        </button>
      </div>

      <style>{`
        .chatbox-container {
          display: flex;
          flex-direction: column;
          height: 600px;
          width: 450px;
          background: linear-gradient(160deg, #0d0d0d, #1a001a);
          border-radius: 20px;
          padding: 16px;
          color: #ff8ac7;
          font-family: "Segoe UI", sans-serif;
          box-shadow: 0 0 20px rgba(255, 0, 150, 0.5);
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #ff8ac7;
        }

        .chat-header h2 {
          font-size: 18px;
          margin: 0;
        }

        .behavior {
          font-size: 12px;
          opacity: 0.8;
        }

        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .messages::-webkit-scrollbar {
          width: 8px;
        }

        .messages::-webkit-scrollbar-thumb {
          background-color: #ff8ac7;
          border-radius: 4px;
        }

        .message {
          max-width: 75%;
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.4;
          word-break: break-word;
        }

        .message.user {
          align-self: flex-end;
          background: #ff8ac7;
          color: #1a001a;
          border-bottom-right-radius: 4px;
        }

        .message.bot {
          align-self: flex-start;
          background: #330033;
          color: #ff8ac7;
          border-bottom-left-radius: 4px;
        }

        .input-area {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 8px;
            }

        .input-area textarea {
            flex: 1;
            resize: none;
            min-height: 48px;
            max-height: 120px;
            border-radius: 12px;
            border: 1px solid #f0a;
            background: #220022;
            color: #f0a;
            padding: 12px;
            font-size: 15px;
            line-height: 1.4;
            font-family: inherit;
            }

        .input-area textarea:focus {
            outline: none;
            border-color: #ff4fa3;
            box-shadow: 0 0 6px #ff4fa3;
            }

        .input-area button {
            flex-shrink: 0;
            max-width: 80px;
            height: 48px;
            background: #f0a;
            color: #111;
            border: none;
            border-radius: 12px;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.3s ease;
            }

            .input-area button:disabled {
            background: #662255;
            color: #aaa;
            cursor: not-allowed;
            }

            .input-area button:not(:disabled):hover {
            background: #ff4fa3;
            color: white;
            }

      `}</style>
    </div>
  );
};

export default ChatBox;
