import React, { useState } from "react";

const ChatbotForm: React.FC = () => {
  const [personality, setPersonality] = useState("");
  const [gender, setGender] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [characterData, setCharacterData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async () => {
    if (!personality || !gender) {
      setGeneratedText("Please select both personality and gender.");
      return;
    }
    setLoading(true);
    setSaved(false);
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch("http://localhost:8000/api/chatbot/generate_character/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ personality, gender }),
      });

      if (!res.ok) throw new Error("Failed to fetch character");

      const data = await res.json();
      setCharacterData(data);
      setGeneratedText(
        `Name: ${data.name}\nFavorite Food: ${data.favorite_food}\nBackground: ${data.background}`
      );
    } catch (err) {
      console.error(err);
      setGeneratedText("Error generating character.");
      setCharacterData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    if (!characterData) return;
    setLoading(true);
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch("http://localhost:8000/api/chatbot/save_character/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...characterData,
          personality,
          gender,
        }),
      });

      if (!res.ok) throw new Error("Failed to save character");

      const result = await res.json();
      if (result.success) {
        setSaved(true);
        alert("Character saved successfully!");
      } else {
        alert("Failed to save character");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving character.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fullscreen-container">
      <div className="form-container">
        <h2>Create Your Chatbot</h2>

        {/* Personality Dropdown */}
        <label>Personality</label>
        <select
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
        >
          <option value="">Select Personality</option>
          <option value="tsundere">Tsundere</option>
          <option value="kuudere">Kuudere</option>
          <option value="deredere">Deredere</option>
          <option value="yandere">Yandere</option>
        </select>

        {/* Gender Dropdown */}
        <label>Gender</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">Select Gender</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>

        {/* Generate / Regenerate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !personality || !gender}
          style={{ marginTop: "15px" }}
        >
          {loading ? "Generating..." : characterData ? "Regenerate" : "Generate"}
        </button>

        {/* AI Generated Text Box */}
        <label style={{ marginTop: "15px" }}>AI Generated Text</label>
        <textarea value={generatedText} readOnly />

        {/* OK Button at bottom */}
        <button
          onClick={handleOk}
          disabled={!characterData || loading || generatedText.includes("Please select")}
          style={{ marginTop: "30px" }}
        >
          OK
        </button>
      </div>

      <style>{`
        .fullscreen-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          width: 100vw;
          background: linear-gradient(160deg, #0d0d0d, #1a001a);
        }
        .form-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 400px;
          background: linear-gradient(160deg, #0d0d0d, #1a001a);
          border-radius: 20px;
          padding: 20px;
          color: #ff8ac7;
          font-family: "Segoe UI", sans-serif;
          box-shadow: 0 0 20px rgba(255, 0, 150, 0.5);
        }
        h2 {
          margin: 0 0 10px 0;
          font-size: 20px;
          text-align: center;
        }
        label {
          font-size: 14px;
          opacity: 0.9;
        }
        select, textarea {
          background: #220022;
          border: 1px solid #f0a;
          border-radius: 12px;
          padding: 10px;
          color: #ff8ac7;
          font-size: 14px;
        }
        select:focus, textarea:focus {
          outline: none;
          border-color: #ff4fa3;
          box-shadow: 0 0 6px #ff4fa3;
        }
        textarea {
          min-height: 100px;
          resize: none;
        }
        button {
          background: #f0a;
          color: #111;
          border: none;
          border-radius: 12px;
          font-weight: bold;
          font-size: 14px;
          padding: 10px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        button:hover:not(:disabled) {
          background: #ff4fa3;
          color: white;
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ChatbotForm;
