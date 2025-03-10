import React, { useState } from "react";
import { auth } from "../utilis/Firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import './Login.css'; // Import the new CSS file

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/fleetlist"); // Redirect to FleetList after login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h2 className="title">Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin} className="form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input"
        />
        <button type="submit" className="button">Login</button>
      </form>
      <p className="signup-text">
        Don't have an account? 
        <button onClick={() => navigate("/signup")} className="signup-button">Sign Up</button>
      </p>
    </div>
  );
};

export default Login;
