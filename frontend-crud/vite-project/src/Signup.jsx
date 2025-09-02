import { useState } from "react";
import { useNavigate } from "react-router-dom";
  import "./Signup.css";


function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.email.match(/^\S+@\S+\.\S+$/)) {
      errs.email = "Please enter a valid email (e.g. user@example.com)";
    }
    if (form.password.length < 8) {
      errs.password = "Password must be at least 8 characters long";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    // Robust network error handling
    if (!navigator.onLine) {
      setMsg("No internet connection. Please check your network.");
      return;
    }
    const API_URL = import.meta.env.VITE_API_URL;
    let timeoutId;
    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      let data = {};
      try { data = await res.json(); } catch {}
      if (res.ok) {
        setMsg("User successfully registered!");
        setForm({ username: "", email: "", password: "" });
      } else {
        setMsg(data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setMsg("Connection timeout. Please try again.");
      } else if (!navigator.onLine) {
        setMsg("No internet connection. Please check your network.");
      } else {
        setMsg("Server is unreachable. Please try again later.");
      }
    }
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>
      <form className="signup-form" onSubmit={handleSubmit} autoComplete="off">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        {errors.email && <div style={{ color: 'red', fontSize: '0.95em', marginBottom: 8 }}>{errors.email}</div>}
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ width: "100%", paddingRight: "36px" }}
          />
          <span
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              fontSize: 20,
              color: "#6366f1"
            }}
            title={showPassword ? "Hide Password" : "Show Password"}
            aria-label="Show/Hide Password"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(v => !v); }}
          >
            {showPassword ? (
              <svg width="22" height="22" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20C7 20 2.73 16.11 1 12c.74-1.64 2.01-3.54 3.94-5.06M9.88 9.88A3 3 0 0 1 12 9c1.66 0 3 1.34 3 3 0 .41-.08.8-.22 1.16M6.1 6.1l11.8 11.8"/><path d="M1 1l22 22"/></svg>
            ) : (
              <svg width="22" height="22" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="10" ry="7"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </span>
        </div>
        {errors.password && <div style={{ color: 'red', fontSize: '0.95em', marginBottom: 8 }}>{errors.password}</div>}
        <button type="submit">Signup</button>
      </form>
      <div className="signup-msg">{msg}</div>
      {msg === "User successfully registered!" && (
        <button className="signup-goto" onClick={() => navigate("/login")}>Go to Login</button>
      )}
    </div>
  );
}

export default Signup;
