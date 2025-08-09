import React, { useState, useEffect, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

// Interface for your app's chat state
interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  messages: { text: string; sender: "user" | "bot" }[];
  botInfo: {
    hobby: string;
    relationship: string | number;
    background: string;
    quirks?: string;
    favorite_food?: string;
    [key: string]: any;
  };
}

// Interface matching your API response shape
interface ApiChatbot {
  id: number;
  name: string;
  hobbies?: string;
  love_meter?: number;
  background?: string;
  quirks?: string;
  favorite_food?: string;
  // Add any other fields your backend returns here
}

const ChatApp: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load chatbot data from API on mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const res = await fetch("http://localhost:8000/api/chatbot/get_list/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch chats");
        }

        // Use ApiChatbot[] here
        const data: ApiChatbot[] = await res.json();

        // Map API data to your Chat interface
        const mappedChats: Chat[] = data.map((item) => ({
          id: item.id,
          name: item.name || "Unknown",
          lastMessage: "", // or get from API if available
          messages: [], // initially empty or from API
          botInfo: {
            hobby: item.hobbies || "Unknown",
            relationship: item.love_meter !== undefined ? item.love_meter.toString() : "Unknown",
            background: item.background || "No background info available.",
            quirks: item.quirks || "None",
            favorite_food: item.favorite_food || "Unknown",
          },
        }));

        setChats(mappedChats);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  // Make sure selectedChat initializes properly after chats load
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  // When chats change, set first chat as selected by default if none selected
  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [chats, selectedChat]);

  const [newMessage, setNewMessage] = useState("");
  const [showBotInfo, setShowBotInfo] = useState(false);
  const navigate = useNavigate();

  const addChat = () => {
    const name = prompt("Enter name:");
    if (name) {
      const newChat: Chat = {
        id: Date.now(),
        name,
        lastMessage: "",
        messages: [],
        botInfo: {
          hobby: "Unknown",
          relationship: "Unknown",
          background: "No background info available.",
        },
      };
      setChats((prev) => [...prev, newChat]);
      setSelectedChat(newChat);
    }
  };

  const deleteChat = (id: number) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    if (selectedChat?.id === id) {
      setSelectedChat(null);
      setShowBotInfo(false);
    }
  };

  type Message = { text: string; sender: "user" | "bot" };

const sendMessage = () => {
  if (!selectedChat || !newMessage.trim()) return;

  const userMessage: Message = { text: newMessage.trim(), sender: "user" };
  const currentChatId = selectedChat.id; // Store the current chat ID
  
  setNewMessage("");

  // Update both chats and selectedChat with user message in one go
  setChats((prevChats) => 
    prevChats.map((chat) =>
      chat.id === currentChatId
        ? {
            ...chat,
            lastMessage: userMessage.text,
            messages: [...chat.messages, userMessage],
          }
        : chat
    )
  );

  setSelectedChat((prev) =>
    prev && prev.id === currentChatId
      ? { ...prev, lastMessage: userMessage.text, messages: [...prev.messages, userMessage] }
      : prev
  );

  // Bot replies after 1 second delay
  setTimeout(() => {
    const botReply: Message = { text: "Hello! This is a bot reply.", sender: "bot" };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              lastMessage: botReply.text,
              messages: [...chat.messages, botReply],
            }
          : chat
      )
    );

    setSelectedChat((prev) =>
      prev && prev.id === currentChatId
        ? { ...prev, lastMessage: botReply.text, messages: [...prev.messages, botReply] }
        : prev
    );
  }, 1000);
};


  const toggleBotInfo = () => {
    setShowBotInfo((prev) => !prev);
  };

  const onSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setShowBotInfo(false);
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
              onClick={() => onSelectChat(chat)}
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
      <div
        style={{
          ...styles.chatBox,
          marginRight: showBotInfo ? 360 : 0, // reserve space for bot info panel width
          transition: "margin-right 0.4s ease",
        }}
      >
        {selectedChat ? (
          <>
            <div style={styles.chatHeader}>
              {selectedChat.name}
              <button
                style={styles.dotButton}
                onClick={toggleBotInfo}
                title={showBotInfo ? "Close Bot Info" : "Show Bot Info"}
              >
                {showBotInfo ? "×" : "⋮"}
              </button>
            </div>

            <div style={styles.messages}>
              {selectedChat.messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.messageBubble,
                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                    background: msg.sender === "user" ? "#f08" : "#220022",
                    color: "#fff",
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

      {/* Sliding Bot Info Panel */}
      {selectedChat && (
        <div
          style={{
            ...styles.botInfoBox,
            right: showBotInfo ? 0 : "-420px",
            display: showBotInfo ? "block" : "none",
          }}
        >
          <h3>Bot Info</h3>
          <div style={styles.botInfoContent}>
            <p>
              <strong>Name:</strong> {selectedChat.name}
            </p>
            <p>
              <strong>Hobby:</strong> {selectedChat.botInfo.hobby}
            </p>
            <p>
              <strong>Relationship:</strong> {selectedChat.botInfo.relationship}
            </p>
            <p>
              <strong>Background:</strong> {selectedChat.botInfo.background}
            </p>
            <p>
              <strong>Quirks:</strong> {selectedChat.botInfo.quirks || "None"}
            </p>
            <p>
              <strong>Favorite Food:</strong> {selectedChat.botInfo.favorite_food || "Unknown"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const styles: { [key: string]: CSSProperties } = {
  container: {
    display: "flex",
    height: "100vh",
    background: "linear-gradient(160deg, #0d0d0d, #1a001a)",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#ff8ac7",
  },
  sidebar: {
    width: "30%",
    borderRight: "1px solid #f0a",
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    gap: "10px",
  },
  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "10px",
  },
  sidebarTitle: {
    margin: 0,
    fontSize: "20px",
  },
  addButton: {
    background: "#f0a",
    color: "#111",
    border: "none",
    borderRadius: "5px",
    width: "auto",
    height: "28px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  chatItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  chatName: {
    fontWeight: "bold",
    fontSize: "14px",
  },
  chatLast: {
    fontSize: "12px",
    opacity: 0.8,
  },
  deleteButton: {
    background: "#f0a",
    color: "#111",
    border: "none",
    borderRadius: "5px",
    width: "auto",
    height: "20px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  chatBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  chatHeader: {
    padding: "14px 50px 14px 14px",
    borderBottom: "1px solid #f0a",
    fontWeight: "bold",
    fontSize: "18px",
    position: "relative", // needed for dot button absolute
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    userSelect: "none",
  },
  dotButton: {
    position: "absolute",
    top: "14px",
    right: "14px",
    background: "transparent",
    border: "none",
    color: "#ff8ac7",
    fontSize: "24px",
    cursor: "pointer",
    userSelect: "none",
    padding: 0,
    lineHeight: 1,
    zIndex: 20,
  },
  messages: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  messageBubble: {
    padding: "10px",
    borderRadius: "12px",
    maxWidth: "70%",
    wordBreak: "break-word",
  },
  inputArea: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #f0a",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "12px",
    border: "1px solid #f0a",
    background: "#220022",
    color: "#ff8ac7",
  },
  sendButton: {
    background: "#f0a",
    color: "#111",
    border: "none",
    borderRadius: "12px",
    padding: "0 16px",
    cursor: "pointer",
  },
  noChat: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.7,
  },
  botInfoBox: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 320,
    backgroundColor: "#440044",
    boxShadow: "-3px 0 10px #aa00aa88",
    padding: 20,
    color: "#ff8ac7",
    fontSize: 14,
    transition: "right 0.4s ease",
    overflowY: "auto",
    userSelect: "text",
    zIndex: 10,
  },
  botInfoContent: {
    marginTop: 10,
  },
};

export default ChatApp;
