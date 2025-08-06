import React, { useState } from "react";

type PreferenceProps = {
  onChange: (behavior: string) => void;
};

const behaviors = [
  { id: "tsundere", label: "Tsundere" },
  { id: "kuudere", label: "kuudere" },
  { id: "deredere", label: "Deredere" },
  { id: "yandere", label: "Yandere" },
];

const Preference: React.FC<PreferenceProps> = ({ onChange }) => {
  const [selected, setSelected] = useState<string>(behaviors[0].id);

  const handleSelect = (id: string) => {
    setSelected(id);
    onChange(id);
  };

  return (
    <div className="preference-container">
      <h2>Choose Chatbot Behavior</h2>
      <ul>
        {behaviors.map(({ id, label }) => (
          <li key={id}>
            <button
              className={id === selected ? "selected" : ""}
              onClick={() => handleSelect(id)}
              aria-pressed={id === selected}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      <style>{`
        .preference-container {
          background: #111;
          color: #f0a;
          padding: 20px;
          border-radius: 12px;
          max-width: 360px;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          box-shadow: 0 0 10px #f0a;
        }
        h2 {
          margin-bottom: 16px;
          font-weight: 700;
          font-size: 1.5rem;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        li + li {
          margin-top: 12px;
        }
        button {
          width: 100%;
          background: #220022;
          border: 2px solid #f0a;
          color: #f0a;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        button:hover {
          background: #ff69b4;
          border-color: #ff69b4;
          color: #111;
        }
        button.selected {
          background: #ff69b4;
          border-color: #ff69b4;
          color: #111;
          cursor: default;
        }
      `}</style>
    </div>
  );
};

export default Preference;
