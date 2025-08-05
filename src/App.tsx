import React, { useState } from "react";
import "./App.css";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi there 👋 I'm HeartSync! How are you feeling today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [behavior, setBehavior] = useState<"Friendly" | "Professional" | "Funny">("Friendly");
  const [showPreferences, setShowPreferences] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
    };

    setMessages([...messages, newMessage]);
    setInput("");

    setTimeout(() => {
      let botReply = "";
      switch (behavior) {
        case "Friendly":
          botReply = "That sounds wonderful 💖 Tell me more!";
          break;
        case "Professional":
          botReply = "Thank you for sharing. Let's analyze that further.";
          break;
        case "Funny":
          botReply = "Haha, I love that 😂 Keep it coming!";
          break;
        default:
          botReply = "I'm here for you!";
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: botReply, sender: "bot" },
      ]);
    }, 700);
  };

  return (
    <div className="app">
      <div className="chat-container">
        <header className="chat-header">
          💌 HeartSync
          <button className="prefs-btn" onClick={() => setShowPreferences(true)}>⚙</button>
        </header>

        <div className="chat-box">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="input-area">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>➤</button>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Choose Chatbot Behavior</h2>
            <div className="options">
              <button onClick={() => { setBehavior("Friendly"); setShowPreferences(false); }}>
                💖 Friendly
              </button>
              <button onClick={() => { setBehavior("Professional"); setShowPreferences(false); }}>
                📚 Professional
              </button>
              <button onClick={() => { setBehavior("Funny"); setShowPreferences(false); }}>
                😂 Funny
              </button>
            </div>
            <button className="close-btn" onClick={() => setShowPreferences(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
