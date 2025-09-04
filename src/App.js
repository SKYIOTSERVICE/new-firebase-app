// src/App.js
import React, { useState } from "react";
import LoginPage from "./LoginPage";
import UserData from "./UserData";

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      {!user ? (
        <LoginPage onLogin={setUser} />
      ) : (
        <UserData user={user} onLogout={() => setUser(null)} />
      )}
    </div>
  );
}
