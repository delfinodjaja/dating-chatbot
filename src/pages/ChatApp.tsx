import React, { useState, CSSProperties } from "react";

interface Message {
  text: string;
  sender: "user" | "bot";
}

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  messages: Message[];
}

const ChatApp: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 1,
      name: "Alice",
      lastMessage: "Hey there!",
      messages: [{ text: "Hey there!", sender: "bot" }],
    },
    {
      id: 2,
      name: "Bob",
      lastMessage: "How's it going?",
      messages: [{ text: "How's it going?", sender: "bot" }],
    },
  ]);

  const [selectedChat, setSelectedChat] = useState<Chat | null>(chats[0]);
  const [newMessage, setNewMessage] = useState("");

  const addChat = () => {
    const name = prompt("Enter name:");
    if (name) {
      const newChat = { id: Date.now(), name, lastMessage: "", messages: [] };
      setChats((prev) => [...prev, newChat]);
    }
  };

  const deleteChat = (id: number) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    if (selectedChat?.id === id) {
      setSelectedChat(null);
    }
  };

  const sendMessage = () => {
    if (!selectedChat || !newMessage.trim()) return;

    const userMessage: Message = { text: newMessage, sender: "user" };

    // Add user message
    const updatedChats = chats.map((chat) =>
      chat.id === selectedChat.id
        ? {
            ...chat,
            lastMessage: newMessage,
            messages: [...chat.messages, userMessage],
          }
        : chat
    );
    setChats(updatedChats);
    setSelectedChat((prev) =>
      prev
        ? { ...prev, lastMessage: newMessage, messages: [...prev.messages, userMessage] }
        : prev
    );
    setNewMessage("");

    // Demo bot reply after 1 second
    setTimeout(() => {
      const botReply: Message = { text: "Fuck u", sender: "bot" };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                lastMessage: botReply.text,
                messages: [...chat.messages, botReply],
              }
            : chat
        )
      );

      setSelectedChat((prev) =>
        prev
          ? { ...prev, lastMessage: botReply.text, messages: [...prev.messages, botReply] }
          : prev
      );
    }, 1000);
  };

  return (
    <div style={styles.container}>
      {/* Left Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Chats</h2>
          <button style={styles.addButton} onClick={addChat}>
            Add
          </button>
        </div>
        <div>
          {chats.map((chat) => (
            <div
              key={chat.id}
              style={{
                ...styles.chatItem,
                background: selectedChat?.id === chat.id ? "#331133" : "transparent",
              }}
              onClick={() => setSelectedChat(chat)}
            >
              <div>
                <div style={styles.chatName}>{chat.name}</div>
                <div style={styles.chatLast}>{chat.lastMessage}</div>
              </div>
              <button
                style={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Box */}
      <div style={styles.chatBox}>
        {selectedChat ? (
          <>
            <div style={styles.chatHeader}>{selectedChat.name}</div>
            <div style={styles.messages}>
              {selectedChat.messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.messageBubble,
                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                    background: msg.sender === "user" ? "#ff69b4" : "#220022",
                    color: msg.sender === "user" ? "#111" : "#ff8ac7",
                    borderBottomRightRadius: msg.sender === "user" ? 0 : 12,
                    borderBottomLeftRadius: msg.sender === "user" ? 12 : 0,
                    maxWidth: "70%",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div style={styles.inputArea}>
              <input
                style={styles.input}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />
              <button style={styles.sendButton} onClick={sendMessage}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={styles.noChat}>Select a chat to start messaging</div>
        )}
      </div>
    </div>
  );
};

// Styles
const styles: { [key: string]: CSSProperties } = {
  container: {
    display: "flex",
    height: "100vh",
    background: "linear-gradient(160deg, #0d0d0d, #1a001a)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#ff8ac7",
  },
  sidebar: {
    width: "30%",
    borderRight: "1px solid #f0a",
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    gap: "10px",
    background: "#220022",
  },
  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "10px",
    borderBottom: "1px solid #f0a",
  },
  sidebarTitle: {
    margin: 0,
    fontSize: "22px",
  },
  addButton: {
    background: "#f0a",
    color: "#111",
    border: "none",
    borderRadius: "6px",
    width: "60px",
    height: "32px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background 0.3s ease",
  },
  chatItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    borderRadius: "14px",
    cursor: "pointer",
    transition: "background 0.2s ease",
    userSelect: "none",
  },
  chatName: {
    fontWeight: "bold",
    fontSize: "16px",
    marginBottom: "4px",
  },
  chatLast: {
    fontSize: "13px",
    opacity: 0.8,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "150px",
  },
  deleteButton: {
    background: "#f0a",
    color: "#111",
    border: "none",
    borderRadius: "6px",
    width: "60px",
    height: "24px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "12px",
    userSelect: "none",
  },
  chatBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#330033",
  },
  chatHeader: {
    padding: "14px",
    borderBottom: "1px solid #f0a",
    fontWeight: "bold",
    fontSize: "18px",
  },
  messages: {
    flex: 1,
    padding: "10px 20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  messageBubble: {
    padding: "12px 18px",
    borderRadius: "16px",
    fontSize: "14px",
    lineHeight: "1.3",
  },
  inputArea: {
    display: "flex",
    padding: "12px 16px",
    borderTop: "1px solid #f0a",
    gap: "10px",
    background: "#220022",
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "20px",
    border: "1.5px solid #f0a",
    background: "#330033",
    color: "#ff8ac7",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  sendButton: {
    background: "#f0a",
    color: "#111",
    border: "none",
    borderRadius: "20px",
    padding: "0 20px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px",
    transition: "background 0.3s ease",
  },
  noChat: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "18px",
    opacity: 0.6,
  },
};

export default ChatApp;
