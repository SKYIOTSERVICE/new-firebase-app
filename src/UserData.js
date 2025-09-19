import React, { useEffect, useState } from "react";
import { database, auth } from "./firebaseConfig";
import { ref, onValue, set } from "firebase/database";
import { signOut } from "firebase/auth";
import "./styles.css";

export default function UserData({ user, onLogout }) {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [saveStatus, setSaveStatus] = useState("");
  const [motorLog, setMotorLog] = useState(null);
  const [heartbeat, setHeartbeat] = useState(null);
  const [pzem, setPzem] = useState(null); // 🔌 Voltage/Current/Power
  const [isOnline, setIsOnline] = useState(false);

  // const [isRunning, setIsRunning] = useState(false);
  // const [countdown, setCountdown] = useState(null);
  // const [motorDuration, setMotorDuration] = useState(30);

  // Load user profile from realtime db
  useEffect(() => {
    const userRef = ref(database, `user/${user.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        data.id = "01";
        data.name = "Salgare";

        setUserData(data);
        setFormData(data);
      } else {
        console.warn("No data found for user:", user.uid);
      }
    });
    return () => unsubscribe();
  }, [user.uid]);

  // Fetch heartbeat, motor log, and pzem
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(
          "https://anupam-32ea7-default-rtdb.firebaseio.com/user/uid/1001.json"
        );
        const data = await res.json();

        if (data.motorStatusLog) setMotorLog(data.motorStatusLog);
        if (data.heartbeat) setHeartbeat(data.heartbeat);
        if (data.pzem) setPzem(data.pzem);

        if (data.heartbeat?.last_active) {
          const lastActive = new Date(data.heartbeat.last_active);
          const now = new Date();
          const diffMin = (now - lastActive) / (1000 * 60);

          setIsOnline(diffMin <= 3);
        }
      } catch (err) {
        console.error("Error fetching motor log + heartbeat + pzem:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedules = [...formData.motorSchedule.schedules];
    updatedSchedules[index] = {
      ...updatedSchedules[index],
      [field]: Number(value),
    };

    setFormData((prev) => ({
      ...prev,
      motorSchedule: {
        ...prev.motorSchedule,
        schedules: updatedSchedules,
      },
    }));
  };

  const handleSave = async () => {
    if (!isOnline) return;

    const userRef = ref(database, `user/${user.uid}`);
    const dataToSave = { ...formData, id: "01", name: "Salgare" };

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

  const displayFields = ["id", "name"];
  const otherFields = Object.keys(userData).filter(
    (key) =>
      !displayFields.includes(key) &&
      key !== "email" &&
      key !== "motorSchedule" 
  );

  return (
    <div className="container" style={{ position: "relative" }}>
<div className="live-dashboard">

  <div className="grid-3col">
    <div className="metric">
      
      <span className="label">Voltage : </span>
      <span className="value">{pzem ? `${pzem.voltage} V` : "N/A"}</span>
    </div>

    <div className="metric">
      
      <span className="label">Current : </span>
      <span className="value">{pzem ? `${pzem.current} A` : "N/A"}</span>
    </div>

    <div className="metric">
   
      <span className="label">Power : </span>
      <span className="value">{pzem ? `${pzem.power} W` : "N/A"}</span>
    </div>
  </div>
</div>



      <h3>Your Data</h3>

      <div className="inline-fields">
        {displayFields.map((key) => (
          <div key={key} className="inline-field">
            <label>
              {key}:
              <input name={key} value={formData[key] || ""} readOnly disabled />
            </label>
          </div>
        ))}

        {formData.motorSchedule?.schedules &&
          formData.motorSchedule.schedules.slice(0, 2).map((schedule, index) => (
            <div key={index} className="schedule-inline-block">
              <div className="schedule-title">
                <h4>{index === 0 ? "Morning" : "Night"}</h4>
              </div>
              <div className="schedule-fields">
                <label>
                  Start Hour:
                  <input
                    type="number"
                    value={schedule.startHour}
                    disabled={!isOnline}
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
                    disabled={!isOnline}
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
                    disabled={!isOnline}
                    onChange={(e) =>
                      handleScheduleChange(index, "duration", e.target.value)
                    }
                  />
                </label>
              </div>
            </div>
          ))}
      </div>

      {!isOnline && <p className="warning">Device is offline</p>}

      {otherFields.map((key) => (
        <div key={key}>
          <label>
            {key}:
            <input
              name={key}
              value={formData[key]}
              onChange={handleChange}
              type={typeof userData[key] === "number" ? "number" : "text"}
            />
          </label>
        </div>
      ))}

      <button onClick={handleSave} disabled={!isOnline}>
        Save
      </button>
      {saveStatus && (
        <p className={saveStatus.includes("Saved") ? "success" : "error"}>
          {saveStatus}
        </p>
      )}

      <div className="status-container">
        {heartbeat && (
          <div className="heartbeat">
            <h4>Device Status</h4>
            <p>
              Status:{" "}
              <span className={isOnline ? "status-online" : "status-offline"}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </p>
            <p>Last Active: {heartbeat.last_active}</p>
          </div>
        )}

        {motorLog && (
          <div className="motor-log">
            <h4>Motor Status Log</h4>
            <p>
              Status:{" "}
              <span
                className={
                  motorLog.motor_status === 1
                    ? "status-running"
                    : "status-stopped"
                }
              >
                {motorLog.motor_status === 1 ? "Running" : "Stopped"}
              </span>
            </p>
            <p>Time: {motorLog.timestamp}</p>
          </div>
        )}
      </div>

      <hr />
      <button onClick={handleLogout} className="logout">
        Logout
      </button>
    </div>
  );
}
