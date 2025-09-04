import React, { useEffect, useState } from "react";
import { database, auth } from "./firebaseConfig";
import { ref, onValue, set } from "firebase/database";
import { signOut } from "firebase/auth";
import "./styles.css";

export default function UserData({ user, onLogout }) {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    const userRef = ref(database, `user/${user.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        // Override id and name as requested
        data.id = "01";
        data.name = "rajesh";

        setUserData(data);
        setFormData(data);
      } else {
        console.warn("No data found for user:", user.uid);
      }
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedules = [...formData.motorSchedule.schedules];
    updatedSchedules[index][field] = Number(value);

    setFormData((prev) => ({
      ...prev,
      motorSchedule: {
        ...prev.motorSchedule,
        schedules: updatedSchedules,
      },
    }));
  };

  const handleSave = async () => {
    const userRef = ref(database, `user/${user.uid}`);

    // Ensure id and name are always fixed before saving
    const dataToSave = { ...formData, id: "01", name: "rajesh" };

    try {
      await set(userRef, dataToSave);
      setSaveStatus("Saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err) {
      console.error("Firebase save error:", err);
      setSaveStatus("Failed to save.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };

  if (!userData) return <p>Loading...</p>;

  // Display only id and name as read-only, exclude email
  const displayFields = ["id", "name"];

  // Editable fields excluding id, name, email, and motorSchedule
  const otherFields = Object.keys(userData).filter(
    (key) => !displayFields.includes(key) && key !== "email" && key !== "motorSchedule"
  );

  return (
    <div className="container">
      <h3>Your Data</h3>

      {/* Read-only fixed fields */}
      {displayFields.map((key) => (
        <div key={key}>
          <label>
            {key}:{" "}
            <input
              name={key}
              value={formData[key] || ""}
              readOnly
              disabled
              type="text"
            />
          </label>
        </div>
      ))}

      {/* Editable other fields */}
      {otherFields.map((key) => (
        <div key={key}>
          <label>
            {key}:{" "}
            <input
              name={key}
              value={formData[key]}
              onChange={handleChange}
              type={typeof userData[key] === "number" ? "number" : "text"}
            />
          </label>
        </div>
      ))}

      {/* Editable motor schedules */}
      {formData.motorSchedule?.schedules && (
        <div>
          <h4>Motor Schedules</h4>
          {formData.motorSchedule.schedules.map((schedule, index) => (
            <div key={index} className="schedule-block">
              <label>
                Start Hour:
                <input
                  type="number"
                  value={schedule.startHour}
                  onChange={(e) =>
                    handleScheduleChange(index, "startHour", e.target.value)
                  }
                />
              </label>
              <label>
                Start Minute:
                <input
                  type="number"
                  value={schedule.startMin}
                  onChange={(e) =>
                    handleScheduleChange(index, "startMin", e.target.value)
                  }
                />
              </label>
              <label>
                Duration:
                <input
                  type="number"
                  value={schedule.duration}
                  onChange={(e) =>
                    handleScheduleChange(index, "duration", e.target.value)
                  }
                />
              </label>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleSave}>Save</button>
      {saveStatus && (
        <p className={saveStatus.includes("Saved") ? "success" : "error"}>
          {saveStatus}
        </p>
      )}

      <hr />
      <button onClick={handleLogout} className="logout">
        Logout
      </button>
    </div>
  );
}
