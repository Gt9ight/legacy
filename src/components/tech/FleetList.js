import React, { useEffect, useState } from 'react';
import { db } from '../utilis/Firebase';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import './fleetLIst.css';

const FleetList = () => {
  const [fleets, setFleets] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFleet, setSelectedFleet] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "fleets"), (snapshot) => {
      const fleetData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFleets(groupByDate(fleetData));
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Group fleets by date
  const groupByDate = (fleets) => {
    return fleets.reduce((acc, fleet) => {
      const { fleetDate } = fleet;
      if (!acc[fleetDate]) {
        acc[fleetDate] = [];
      }
      acc[fleetDate].push(fleet);
      return acc;
    }, {});
  };

  // Toggle unit completion in Firebase
  const toggleUnitCompletion = async (fleetId, unitIndex) => {
    try {
      const fleetRef = doc(db, "fleets", fleetId);
      const updatedUnits = selectedFleet.map((fleet) => {
        return {
          ...fleet,
          units: fleet.units.map((unit, index) =>
            index === unitIndex ? { ...unit, completed: !unit.completed } : unit
          ),
        };
      });

      await updateDoc(fleetRef, { units: updatedUnits[0].units }); // Update units in Firebase
      setSelectedFleet(updatedUnits); // Update local state for UI sync
    } catch (error) {
      console.error("Error toggling unit completion:", error);
    }
  };

  // Calculate completion percentage
  const getCompletionPercentage = (fleet) => {
    const totalUnits = fleet.reduce((sum, f) => sum + (f.units?.length || 0), 0);
    const completedUnits = fleet.reduce(
      (sum, f) => sum + (f.units?.filter((unit) => unit.completed).length || 0),
      0
    );
    return totalUnits === 0 ? 0 : Math.round((completedUnits / totalUnits) * 100);
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <div className="fleet-report">
      <h2>Fleet List</h2>
      {Object.keys(fleets).length === 0 ? (
        <p>No fleets available.</p>
      ) : (
        <div className="fleet-list">
          {Object.keys(fleets).map((fleetDate) => {
            const completionPercentage = getCompletionPercentage(fleets[fleetDate]);
            return (
              <div key={fleetDate} className="fleet-card" onClick={() => setSelectedFleet(fleets[fleetDate])}>
                <p><strong>Fleet Date:</strong> {fleetDate}</p>
                <p><strong>Units:</strong> {fleets[fleetDate].reduce((sum, fleet) => sum + (fleet.units?.length || 0), 0)}</p>
                
                {/* Progress Bar */}
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${completionPercentage}%` }}></div>
                </div>
                <p className="progress-text">{completionPercentage}% Completed</p>
              </div>
            );
          })}
        </div>
      )}

      {selectedFleet && (
        <div className="modal">
          <div className="modal-content">
            <h3>Fleet Details</h3>
            <div className="unit-list">
              {selectedFleet.map((fleet) => (
                <div key={fleet.id}>
                  {fleet.units.map((unit, unitIndex) => (
                    <div key={unitIndex} className={`unit-card ${unit.completed ? "completed" : ""}`}>
                      <h4>{unit.unitType} {unit.unitNumber}</h4>
                      <p><strong>Urgency:</strong> {unit.urgency}</p>
                      {unit.specifics?.length > 0 && (
                        <div className="specifics-container">
                          <strong>Specifics:</strong>
                          {unit.specifics.map((specific, i) => (
                            <p key={i} className="specific-text">
                              {specific.position} - {specific.ServiceType} - {specific.treadDepth} - {specific.selectedTire}
                            </p>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => toggleUnitCompletion(fleet.id, unitIndex)}
                        className={`complete-button ${unit.completed ? "completed" : ""}`}
                      >
                        {unit.completed ? "Completed" : "Mark as Complete"}
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedFleet(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetList;
