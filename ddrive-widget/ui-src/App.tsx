import React, { useEffect } from "react";
import "./App.css";

interface EventProperty {
  name: string;
  type: string;
  description: string;
}

function App() {
  const [eventName, setEventName] = React.useState("");
  const [properties, setProperties] = React.useState<EventProperty[]>([]);
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);

  useEffect(() => {
    if (typeof parent !== undefined) {
      parent?.postMessage?.({ pluginMessage: "hello" }, "*");

      // Listen for edit messages
      window.onmessage = (event) => {
        const msg = event.data.pluginMessage;
        if (msg.type === "edit-tracking-plan") {
          const { data } = msg;
          setEventName(data.eventName);
          setProperties(data.properties);
          setCurrentStatus(data.status);
          setIsEditing(true);
        }
      };
    }
  }, []);

  const addProperty = () => {
    setProperties([...properties, { name: "", type: "", description: "" }]);
  };

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const updateProperty = (index: number, field: keyof EventProperty, value: string) => {
    const newProperties = [...properties];
    newProperties[index] = { ...newProperties[index], [field]: value };
    setProperties(newProperties);
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!eventName || !currentStatus) {
      alert("Please fill in all required fields");
      return;
    }

    // Send data to the plugin
    parent?.postMessage?.(
      { 
        pluginMessage: {
          type: "create-tracking-plan",
          eventName,
          properties,
          currentStatus
        }
      },
      "*"
    );

    // Close the widget UI
    parent?.postMessage?.({ pluginMessage: { type: "close" } }, "*");
  };

  return (
    <div className="App">
      <h2>{isEditing ? 'Edit' : 'Create'} Tracking Plan</h2>
      
      <div className="section">
        <h3>Event Name</h3>
        <input
          placeholder="Enter event name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />
      </div>

      <div className="section">
        <h3>Event Properties</h3>
        {properties.map((property, index) => (
          <div key={index} className="property-card">
            <div className="property-row">
              <div>
                <label>Name</label>
                <input
                  placeholder="Property name"
                  value={property.name}
                  onChange={(e) => updateProperty(index, "name", e.target.value)}
                />
              </div>
              <div>
                <label>Type</label>
                <input
                  placeholder="Property type"
                  value={property.type}
                  onChange={(e) => updateProperty(index, "type", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label>Description</label>
              <textarea
                placeholder="Describe the property"
                value={property.description}
                onChange={(e) => updateProperty(index, "description", e.target.value)}
              />
            </div>
            <button className="remove-btn" onClick={() => removeProperty(index)}>
              <span className="icon">🗑</span> Remove Property
            </button>
          </div>
        ))}
        <button className="add-btn" onClick={addProperty}>
          <span className="icon">+</span> Add Property
        </button>
      </div>

      <div className="section">
        <h3>Current Status</h3>
        <select 
          value={currentStatus} 
          onChange={(e) => setCurrentStatus(e.target.value)}
        >
          <option value="">Select status</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <button className="submit-btn" onClick={handleSubmit}>
        {isEditing ? 'Save Changes' : 'Create Tracking Plan'}
      </button>
    </div>
  );
}

export default App;
