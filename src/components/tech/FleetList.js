import React, { useEffect, useState } from 'react';
import { db, storage } from '../utilis/Firebase';
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './fleetLIst.css';
import imageCompression from 'browser-image-compression';


const FleetList = () => {
  const [fleetData, setFleetData] = useState([]);
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [enlargedImage, setEnlargedImage] = useState(null); // For storing enlarged image
  const [isModalOpen, setIsModalOpen] = useState(false); // For controlling modal visibility

  useEffect(() => {
    const fetchFleetData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'fleets'));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Include the document ID
          ...doc.data(),
        }));

        // Group fleets by fleetName and avoid duplication of units
        const groupedFleets = data.reduce((acc, fleet) => {
          const existingFleet = acc.find((f) => f.fleetName === fleet.fleetName);
          if (existingFleet) {
            // Avoid duplicate units by checking their unitNumber or some unique identifier
            fleet.units.forEach(unit => {
              if (!existingFleet.units.some(existingUnit => existingUnit.unitNumber === unit.unitNumber)) {
                existingFleet.units.push(unit);
              }
            });
          } else {
            acc.push(fleet);
          }
          return acc;
        }, []);

        // Fetch and update image URLs for all units
        const updatedData = await Promise.all(groupedFleets.map(async (fleet) => {
          const updatedUnits = await Promise.all(fleet.units.map(async (unit) => {
            const updatedImages = await Promise.all(unit.images.map(async (image) => {
              try {
                const imageRef = ref(storage, image.uri);
                const imageUrl = await getDownloadURL(imageRef);
                return { ...image, uri: imageUrl };
              } catch (error) {
                console.error("Error fetching image URL: ", error);
                return image;
              }
            }));
            return { ...unit, images: updatedImages };
          }));
          return { ...fleet, units: updatedUnits };
        }));

        setFleetData(updatedData);
      } catch (error) {
        console.error("Error fetching fleet data: ", error);
      }
    };

    fetchFleetData();
  }, []);

  const handleFleetClick = (fleet) => {
    if (selectedFleet === fleet.fleetName) {
      setSelectedFleet(null);
    } else {
      setSelectedFleet(fleet.fleetName);
    }
  };

  // Handle image click to enlarge
  const handleImageClick = (imageUri) => {
    setEnlargedImage(imageUri); // Set the clicked image URL
    setIsModalOpen(true); // Open the modal
  };

  // Handle closing the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEnlargedImage(null);
  };

  const handleDone = async (fleetId, unitIndex) => {
    try {
      const fleetIndex = fleetData.findIndex((f) => f.id === fleetId);
      if (fleetIndex === -1) {
        throw new Error('Fleet ID not found in fleetData');
      }

      const updatedFleetData = [...fleetData];
      const unit = updatedFleetData[fleetIndex].units[unitIndex];
      if (!unit) {
        throw new Error('Unit not found');
      }

      // Toggle the done state
      unit.done = !unit.done;

      // Update the state
      setFleetData(updatedFleetData);

      // Update Firebase
      const fleetRef = doc(db, 'fleets', fleetId);
      await updateDoc(fleetRef, { units: updatedFleetData[fleetIndex].units });
    } catch (error) {
      console.error('Error updating unit status:', error);
    }
  };

  // Calculate the completed units count and display as "completedUnits/totalUnits"
  const getCompletedUnitsCount = (units) => {
    const totalUnits = units.length;
    const completedUnits = units.filter(unit => unit.done).length;
    return `${completedUnits}/${totalUnits} units complete`;
  };

  // Calculate the progress percentage
  const calculateProgress = (units) => {
    const totalUnits = units.length;
    const completedUnits = units.filter(unit => unit.done).length;
    return (completedUnits / totalUnits) * 100;
  };

  return (
    <div className="fleet-list-container">
      <h1 className="fleet-list-title">Fleet Data</h1>
      
      {fleetData.length === 0 ? (
        <p className="no-data-message">No fleet data available.</p>
      ) : (
        <div className="fleet-list">
          {fleetData.map((fleet, fleetIndex) => {
            const completedUnitsCount = getCompletedUnitsCount(fleet.units); // Get completed units count
            const progress = calculateProgress(fleet.units); // Calculate progress
            return (
              <div key={fleetIndex} className="fleet-card">
                <button className="fleet-card-button" onClick={() => handleFleetClick(fleet)}>
                  <h2 className="fleet-name">{fleet.fleetName}</h2>
                  <p className="fleet-info">{completedUnitsCount}</p> {/* Display completed units count */}
                  <div className="progress-bar-container">
                    <div className="progress-bar-background">
                      <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="progress-text">{Math.round(progress)}% Completed</p>
                  </div>
                </button>

                {selectedFleet === fleet.fleetName && (
                  <div className="fleet-details">
                    <ul className="unit-list">
                      {fleet.units.map((unit, unitIndex) => (
                        <li
                          key={unitIndex}
                          className={`unit-card ${unit.done ? 'unit-done' : ''}`}
                        >
                          <div className="unit-header">
                            <h3>Unit {unit.unitNumber}</h3>
                            <p><strong>Type:</strong> {unit.unitType}</p>
                            <p><strong>Status:</strong> {unit.emergency}</p>
                          </div>

                          <div className="unit-specifics">
                            <h4>Specifics</h4>
                            {unit.specifics.length > 0 ? (
                              <ul>
                                {unit.specifics.map((specific, i) => (
                                  <li key={i}>
                                    <p><strong>Service:</strong> {specific.serviceNeeded}</p>
                                    <p><strong>Tread Depth:</strong> {specific.treadDepth}</p>
                                    <p><strong>Tire Needed:</strong> {specific.tireNeeded}</p>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>No specifics added</p>
                            )}
                          </div>

                          <div className="image-gallery">
                            {unit.images.length > 0 ? (
                              unit.images.map((image, i) => (
                                <div key={i} className="image-item" onClick={() => handleImageClick(image.uri)}>
                                  <img src={image.uri} alt={image.label} className="unit-image" />
                                  <p>{image.label}</p>
                                </div>
                              ))
                            ) : (
                              <p>No images uploaded</p>
                            )}
                          </div>
                          <button
                            className="done-button"
                            onClick={() => handleDone(fleet.id, unitIndex)}
                          >
                            {unit.done ? 'Undo' : 'Done'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Enlarged Image */}
      {isModalOpen && (
        <div className="image-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={enlargedImage} alt="Enlarged" className="enlarged-image" />
            <button className="close-modal" onClick={closeModal}>X</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetList;