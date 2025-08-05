import React from "react";
import Chatbox from "../components/ChatBox";
import Preference from "../components/Preference";

const Chatbot: React.FC = () => {
  const [behavior, setBehavior] = React.useState("default");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1a202c", // dark gray background
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "1.5rem",
          backgroundColor: "#2d3748", // slightly lighter gray container
          padding: "2rem",
          borderRadius: "0.5rem",
          maxWidth: "960px",
          width: "100%",
        }}
      >
        <div style={{ width: "300px" }}>
          <Preference onChange={setBehavior} />
        </div>
        <div style={{ flex: 1 }}>
          <Chatbox behavior={behavior} />
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
