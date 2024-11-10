import React, { useEffect } from "react";
import "./App.css";

function App() {
  const [eventType, setEventType] = React.useState("");
  const [eventName, setEventName] = React.useState("");
  const [eventDescription, setEventDescription] = React.useState("");

  useEffect(() => {
    if (typeof parent !== undefined) {
      parent?.postMessage?.({ pluginMessage: "hello" }, "*");
    }
  }, []);

  const handleSubmit = () => {
    parent?.postMessage?.(
      { 
        pluginMessage: {
          type: "create-sticker",
          eventType,
          eventName,
          eventDescription
        }
      },
      "*"
    );
  };

  return (
    <div className="App">
      <h2>Add Tracking Label</h2>
      <select 
        value={eventType} 
        onChange={(e) => setEventType(e.target.value)}
      >
        <option value="">Select event type</option>
        <option value="Click">Click</option>
        <option value="View">View</option>
        <option value="Completed">Completed</option>
      </select>
      
      <input
        placeholder="Event Name"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
      />
      
      <textarea
        placeholder="Event Description"
        value={eventDescription}
        onChange={(e) => setEventDescription(e.target.value)}
      />

      <button onClick={handleSubmit}>Add Label</button>
      <button
        onClick={() => {
          parent?.postMessage?.({ pluginMessage: "close" }, "*");
        }}
      >
        Close
      </button>
    </div>
  );
}

export default App;
