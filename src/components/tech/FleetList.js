import React, { useState } from "react";
import { db } from "../utilis/Firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./fleetLIst.css";

const FleetList = () => {
  const [searchUID, setSearchUID] = useState("");
  const [fleetData, setFleetData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFleet, setSelectedFleet] = useState(null);

  const handleSearch = async () => {
    if (!searchUID.trim()) {
      setError("Please enter a valid UID.");
      return;
    }
    setError(null);
    setFleetData(null);
    setSelectedFleet(null);
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

  const markUnitComplete = async (unitIndex) => {
    if (!fleetData || !selectedFleet) return;
    try {
      const updatedUnits = [...selectedFleet.units];
      
      // Toggle completion status
      updatedUnits[unitIndex] = { 
        ...updatedUnits[unitIndex], 
        completed: !updatedUnits[unitIndex].completed 
      };
  
      // Update state immediately
      setFleetData((prev) => ({
        ...prev,
        units: updatedUnits,
      }));
  
      setSelectedFleet((prev) => ({
        ...prev,
        units: updatedUnits,
      }));
  
      // Update Firestore
      const fleetDocRef = doc(db, "fleets", searchUID);
      await updateDoc(fleetDocRef, { units: updatedUnits });
    } catch (err) {
      console.error("Error updating unit: ", err);
    }
  };
  
  
  
  
  return (
    <div className="fleet-container">
      <div className="fleet-card">
        <h2 className="fleet-title">Search Fleet by UID</h2>
        <div className="fleet-input-group">
          <input
            type="text"
            value={searchUID}
            onChange={(e) => setSearchUID(e.target.value)}
            placeholder="Enter Fleet UID"
            className="fleet-input"
          />
          <button onClick={handleSearch} className="fleet-button">
            Search
          </button>
        </div>
        {error && <p className="fleet-error">{error}</p>}
        {fleetData && !selectedFleet && (
          <div
            className="fleet-summary-card"
            onClick={() => setSelectedFleet(fleetData)}
          >
            <h3>{fleetData.fleetDate}</h3>
            <p><strong>Units:</strong> {fleetData.units.length}</p>
            <p className="click-to-view">Click to view details</p>
          </div>
        )}
        {selectedFleet && (
          <div className="fleet-details">
            <h3 className="fleet-details-title">Fleet Details:</h3>
            <p><strong>Date:</strong> {selectedFleet.fleetDate}</p>
            <h4>Units:</h4>
            <div className="fleet-units-container">
              {selectedFleet.units.map((unit, index) => (
                <div
  key={index}
  className={`fleet-unit-card ${unit.completed ? 'unit-completed' : ''}`} // Conditionally add the completed class
>
  <h5 className="unit-title">Unit {unit.unitNumber}</h5>
  <p><strong>Type:</strong> {unit.unitType}</p>
  <p><strong>Urgency:</strong> <span className={`urgency-${unit.urgency.toLowerCase()}`}>{unit.urgency}</span></p>
  <h6>Services:</h6>
  <ul className="service-list">
    {unit.specifics.map((service, sIndex) => (
      <li key={sIndex} className="service-item">
        {service.ServiceType} - {service.position} - {service.selectedTire} ({service.treadDepth})
      </li>
    ))}
  </ul>
  {unit.imageUrl && unit.imageUrl.length > 0 && (
    <div className="fleet-images">
      {unit.imageUrl.map((url, imgIndex) => (
        <img key={imgIndex} src={url} alt={`Unit ${unit.unitNumber}`} className="fleet-image" />
      ))}
    </div>
  )}
<button 
  onClick={() => markUnitComplete(index)} 
  className="complete-button"
>
  {unit.completed ? "Unmark Complete" : "Mark as Complete"}
</button>

</div>


              ))}
            </div>

          </div>
        )}
        <p>Once done simply close the page</p>
      </div>
      
    </div>
  );
};

export default FleetList;
