
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!navigator.onLine) {
      setMsg("No internet connection. Please check your network.");
      return;
    }
    setLoading(true);
    setMsg("");
    const API_URL = import.meta.env.VITE_API_URL;
    let timeoutId;
    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      let data = {};
      try { data = await res.json(); } catch {}
      if (res.ok) {
        localStorage.setItem("token", data.token);
        if (data.username) {
          localStorage.setItem("username", data.username);
        }
        setMsg("Login Successful ✅");
        setTimeout(() => navigate("/home"), 600);
      } else {
        setMsg(data.error || data.message || "Invalid credentials ❌");
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e0e7ef] px-2 font-sans">
      <div className="w-[92vw] max-w-md bg-white/90 rounded-2xl shadow-2xl p-7 md:p-10 flex flex-col gap-7 border border-gray-100">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-indigo-600 mb-2 tracking-tight drop-shadow-sm">Login</h2>
        <form className="flex flex-col gap-5" onSubmit={handleLogin} autoComplete="off">
          <div className="flex flex-col gap-2">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-base bg-white/80 placeholder-gray-400 shadow-sm transition-all"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 text-base bg-white/80 placeholder-gray-400 shadow-sm pr-12 transition-all"
            />
            <button
              type="button"
              tabIndex={0}
              aria-label={showPassword ? "Hide Password" : "Show Password"}
              title={showPassword ? "Hide Password" : "Show Password"}
              onClick={() => setShowPassword(v => !v)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(v => !v); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-purple-500 focus:outline-none"
              style={{ padding: 0, background: 'none' }}
            >
              {showPassword ? (
                <svg width="22" height="22" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20C7 20 2.73 16.11 1 12c.74-1.64 2.01-3.54 3.94-5.06M9.88 9.88A3 3 0 0 1 12 9c1.66 0 3 1.34 3 3 0 .41-.08.8-.22 1.16M6.1 6.1l11.8 11.8"/><path d="M1 1l22 22"/></svg>
              ) : (
                <svg width="22" height="22" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="10" ry="7"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed text-lg tracking-wide"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className={
          msg
            ? "text-center text-base font-medium " + (msg.includes("Success") ? "text-green-600" : "text-red-500")
            : "hidden"
        }>
          {msg}
        </div>
        <div className="text-center text-sm text-gray-400 mt-2">
          New User? <Link to="/signup" className="text-blue-500 hover:text-purple-500 hover:underline font-semibold">Signup</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
