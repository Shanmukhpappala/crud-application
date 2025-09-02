

import Crud from "./Crud";
import "./Home.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const username = localStorage.getItem("username") || "";
  const email = localStorage.getItem("email") || "";
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="profile-btn-mobile"
        style={{ position: 'fixed', top: 10, left: 10, zIndex: 2000, background: '#fff', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 8, fontSize: 28, border: 'none', cursor: 'pointer' }}
        title="Profile"
        onClick={() => setShowProfile((v) => !v)}
      >
        <span role="img" aria-label="profile">👤</span>
      </button>
      {showProfile && (
        <div style={{
          position: 'fixed',
          left: 10,
          top: 54,
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 10,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          padding: '18px 24px',
          minWidth: 220,
          zIndex: 3000
        }}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>{username}</div>
          <div style={{ color: '#64748b', fontSize: 15, marginBottom: 16 }}>{email || 'No email'}</div>
          <button
            onClick={handleLogout}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 15,
              marginTop: 10
            }}
          >
            Log Out
          </button>
        </div>
      )}
      <div className="home-container">
        <div className="home-title">
          Welcome, {username ? username : "User"} <span role="img" aria-label="rocket">🚀</span>
        </div>
        <Crud />
      </div>
    </div>
  );
}

export default Home
