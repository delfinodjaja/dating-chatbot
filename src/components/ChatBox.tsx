// ChatApp.tsx
import React, { useState } from "react";
import "./ChatApp.css";

type Chat = {
  id: number;
  name: string;
  lastMessage: string;
  messages: string[];
};

export default function ChatApp() {
  const [chats, setChats] = useState<Chat[]>([
    { id: 1, name: "Alice", lastMessage: "See you soon!", messages: ["Hello!", "See you soon!"] },
    { id: 2, name: "Bob", lastMessage: "How's it going?", messages: ["Hey!", "How's it going?"] },
  ]);
  const [activeChatId, setActiveChatId] = useState<number>(1);
  const [newMessage, setNewMessage] = useState("");
  const [editMode, setEditMode] = useState(false);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: newMessage,
            }
          : chat
      )
    );
    setNewMessage("");
  };

  const deleteChat = (id: number) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    if (activeChatId === id && chats.length > 1) {
      setActiveChatId(chats[0].id);
    }
  };

  const addChat = () => {
    const name = prompt("Enter contact name:");
    if (!name) return;
    const newChat: Chat = {
      id: Date.now(),
      name,
      lastMessage: "",
      messages: [],
    };
    setChats((prev) => [...prev, newChat]);
  };

  return (
    <div className="chat-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Chats</h2>
          <button onClick={() => setEditMode(!editMode)}>
            {editMode ? "Done" : "Edit"}
          </button>
        </div>
        <div className="chat-list">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${activeChatId === chat.id ? "active" : ""}`}
              onClick={() => setActiveChatId(chat.id)}
            >
              <div>
                <strong>{chat.name}</strong>
                <p>{chat.lastMessage}</p>
              </div>
              {editMode && (
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                >
                  ❌
                </button>
              )}
            </div>
          ))}
        </div>
        {editMode && (
          <button className="add-btn" onClick={addChat}>
            ➕ Add Chat
          </button>
        )}
      </div>

      {/* Chatbox */}
      <div className="chatbox">
        {activeChat ? (
          <>
            <div className="chat-header">
              <h3>{activeChat.name}</h3>
            </div>
            <div className="messages">
              {activeChat.messages.map((msg, index) => (
                <div key={index} className="message">
                  {msg}
                </div>
              ))}
            </div>
            <div className="input-area">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-chat">Select a chat to start messaging</div>
        )}
      </div>
    </div>
  );
}
