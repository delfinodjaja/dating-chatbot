import React, { useState } from "react";
import ChatBox from "./components/ChatBox";
import Preference from "./components/Preference";

const App: React.FC = () => {
  const [behavior, setBehavior] = useState<string>("friendly");

  return (
    <div className="app-container">
      <header>
        <h1>Dating Chatbot</h1>
      </header>

      <main>
        <Preference onChange={setBehavior} />
        <ChatBox behavior={behavior} />
      </main>

      <style>{`
        .app-container {
          background-color: #111;
          color: #f0a;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }
        header {
          margin-bottom: 32px;
        }
        h1 {
          font-size: 2.5rem;
          font-weight: 700;
          text-shadow: 0 0 8px #ff69b4;
        }
        main {
          display: flex;
          flex-direction: column;
          gap: 32px;
          width: 100%;
          max-width: 700px;
        }
      `}</style>
    </div>
  );
};

export default App;
