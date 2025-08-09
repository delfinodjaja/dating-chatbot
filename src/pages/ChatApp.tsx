import React, { useState, CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#111827", // dark background
    color: "#fff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  sidebar: {
    width: "30%",
    backgroundColor: "#1f2937", // gray-800
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #374151", // gray-700
  },
  sidebarHeader: {
    padding: "16px",
    fontSize: "1.5rem",
    fontWeight: 700,
    borderBottom: "1px solid #374151",
  },
  profileList: {
    flex: 1,
    overflowY: "auto",
  },
  profileItem: {
    padding: "12px 16px",
    borderBottom: "1px solid #374151",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  profileItemHover: {
    backgroundColor: "#374151",
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#111827",
  },
  chatHeader: {
    padding: "16px",
    borderBottom: "1px solid #374151",
    fontSize: "1.25rem",
    fontWeight: 600,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatMessages: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
  },
  chatBubble: {
    maxWidth: "60%",
    marginBottom: "12px",
    padding: "10px 14px",
    borderRadius: "12px",
    backgroundColor: "#2563eb", // blue-600
    alignSelf: "flex-end",
  },
  chatBubbleOther: {
    maxWidth: "60%",
    marginBottom: "12px",
    padding: "10px 14px",
    borderRadius: "12px",
    backgroundColor: "#374151", // gray-700
    alignSelf: "flex-start",
  },
  chatInputContainer: {
    display: "flex",
    padding: "12px",
    borderTop: "1px solid #374151",
    backgroundColor: "#1f2937",
  },
  chatInput: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    outline: "none",
    backgroundColor: "#374151",
    color: "#fff",
    fontSize: "1rem",
  },
  sendButton: {
    marginLeft: "8px",
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#10b981", // green-500
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  editButton: {
    padding: "6px 10px",
    fontSize: "0.9rem",
    borderRadius: "6px",
    backgroundColor: "#f59e0b", // amber-500
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

interface Chat {
  name: string;
  lastMessage: string;
  messages: { text: string; sender: "me" | "other" }[];
}

export default function ChatApp() {
  const [chats, setChats] = useState<Chat[]>([
    {
      name: "Alice",
      lastMessage: "See you soon!",
      messages: [
        { text: "Hello!", sender: "other" },
        { text: "Hi Alice", sender: "me" },
        { text: "See you soon!", sender: "other" },
      ],
    },
  ]);
  const [activeChatIndex, setActiveChatIndex] = useState(0);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const updatedChats = [...chats];
    updatedChats[activeChatIndex].messages.push({
      text: newMessage,
      sender: "me",
    });
    updatedChats[activeChatIndex].lastMessage = newMessage;
    setChats(updatedChats);
    setNewMessage("");
  };

  const addChat = () => {
    const name = prompt("Enter new chat name:");
    if (!name) return;
    setChats([
      ...chats,
      { name, lastMessage: "", messages: [] },
    ]);
  };

  const deleteChat = (index: number) => {
    const confirmDelete = window.confirm("Delete this chat?");
    if (!confirmDelete) return;
    const updatedChats = chats.filter((_, i) => i !== index);
    setChats(updatedChats);
    if (activeChatIndex === index) setActiveChatIndex(0);
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          Chats
          <button style={styles.editButton} onClick={addChat}>
            + Add
          </button>
        </div>
        <div style={styles.profileList}>
          {chats.map((chat, index) => (
            <div
              key={index}
              style={styles.profileItem}
              onClick={() => setActiveChatIndex(index)}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{chat.name}</span>
                <button
                  style={styles.editButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(index);
                  }}
                >
                  Delete
                </button>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                {chat.lastMessage}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {chats.length > 0 && (
        <div style={styles.chatArea}>
          <div style={styles.chatHeader}>
            {chats[activeChatIndex]?.name}
          </div>
          <div style={styles.chatMessages}>
            {chats[activeChatIndex]?.messages.map((msg, i) => (
              <div
                key={i}
                style={
                  msg.sender === "me"
                    ? styles.chatBubble
                    : styles.chatBubbleOther
                }
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div style={styles.chatInputContainer}>
            <input
              style={styles.chatInput}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button style={styles.sendButton} onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}