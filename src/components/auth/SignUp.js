import React, { useState } from "react";
import { auth, db } from "../utilis/Firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
  
    const handleSignup = async (e) => {
      e.preventDefault();
      setError("");
  
      try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
  
        // Save user details to Firestore
        await setDoc(doc(db, "users", user.uid), {
          firstName,
          lastName,
          email,
          uid: user.uid,
        });
  
        navigate("/fleetlist"); // Redirect to FleetList after signup
      } catch (err) {
        setError(err.message);
      }
    };
  
    return (
      <div>
        <h2>Sign Up</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Sign Up</button>
        </form>
        <p>
          Already have an account? <button onClick={() => navigate("/login")}>Login</button>
        </p>
      </div>
    );
  };
  
  export default Signup;