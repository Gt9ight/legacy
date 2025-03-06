import React, { useState } from "react";
import { db } from "../utilis/Firebase";
import { doc, getDoc } from "firebase/firestore";

const FleetList = () => {
  const [searchUID, setSearchUID] = useState("");
  const [fleetData, setFleetData] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchUID.trim()) {
      setError("Please enter a valid UID.");
      return;
    }
    setError(null);
    setFleetData(null);
    try {
      const fleetDocRef = doc(db, "fleets", searchUID);
      const fleetSnapshot = await getDoc(fleetDocRef);
      if (fleetSnapshot.exists()) {
        setFleetData(fleetSnapshot.data());
      } else {
        setError("Fleet not found.");
      }
    } catch (err) {
      setError("Error fetching fleet data.");
      console.error("Error: ", err);
    }
  };

  return (
    <div>
      <h2>Search Fleet by UID</h2>
      <input
        type="text"
        value={searchUID}
        onChange={(e) => setSearchUID(e.target.value)}
        placeholder="Enter Fleet UID"
      />
      <button onClick={handleSearch}>Search</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {fleetData && (
        <div>
          <h3>Fleet Details:</h3>
          <pre>{JSON.stringify(fleetData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FleetList;
