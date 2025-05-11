import React, { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { db, storage } from "../utilis/Firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Dropzone from "react-dropzone";
import { useNavigate } from "react-router-dom";

import './fleetform.css'



const FleetForm = () => {
  const [unitType, setUnitType] = useState("");
  const [urgency, setUrgency] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [fleetDate, setFleetDate] = useState(null);
  const [units, setUnits] = useState([]);
  const [unitSpecifics, setUnitSpecifics] = useState({});
  const [unitImages, setUnitImages] = useState({});
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [fleetId, setFleetId] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);

      const getUserDetails = async () => {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(`${data.firstName} ${data.lastName}`);
        }
      };

      getUserDetails();
    }
  }, []);

  const handleAddUnit = () => {
    if (!unitType || !unitNumber || !urgency) {
      alert("Please fill in all fields");
      return;
    }

    const date = new Date().toLocaleDateString();
    if (!fleetDate) setFleetDate(date);

    setUnits([
      ...units,
      {
        unitType,
        unitNumber,
        urgency,
        date,
      },
    ]);

    setUnitType("");
    setUnitNumber("");
    setUrgency("");
  };

  const handleDeleteUnit = (index) => {
    setUnits(units.filter((_, i) => i !== index));
    const updated = { ...unitSpecifics };
    delete updated[index];
    setUnitSpecifics(updated);
  };

  const handleSubmitFleet = async () => {
    if (!userId || units.length === 0) {
      alert("Please login and add units");
      return;
    }

    try {
      const fleetRef = collection(db, "fleets");
      const q = query(fleetRef, where("fleetDate", "==", fleetDate), where("userId", "==", userId));
      const snapshot = await getDocs(q);

      const formattedUnits = units.map((unit, i) => ({
        ...unit,
        specifics: unitSpecifics[i] || [],
        imageUrl: unitImages[i] || [],
      }));

      if (!snapshot.empty) {
        const fleetDoc = snapshot.docs[0];
        await updateDoc(doc(db, "fleets", fleetDoc.id), {
          units: [...fleetDoc.data().units, ...formattedUnits],
        });
        setFleetId(fleetDoc.id); 
      } else {
        const docRef = await addDoc(fleetRef, {
          userId,
          fleetDate,
          units: formattedUnits,
          timestamp: new Date(),
        });
        setFleetId(docRef.id);
        
      }

      setUnits([]);
      setUnitSpecifics({});
      setUnitImages({});
      setFleetDate(null);
    } catch (err) {
      console.error(err);
      alert("Error submitting fleet");
    }
  };

  const handleSpecificsDone = (specifics) => {
    if (selectedUnitIndex !== null) {
      setUnitSpecifics({ ...unitSpecifics, [selectedUnitIndex]: specifics });
    }
    setModalOpen(false);
  };

  const handleDrop = async (acceptedFiles, index) => {
    const file = acceptedFiles[0];
    const storageRef = ref(storage, `unitImages/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      null,
      (error) => {
        console.error(error);
        alert("Upload failed");
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setUnitImages((prev) => {
          const newImages = { ...prev };
          if (newImages[index]) {
            newImages[index].push(url);
          } else {
            newImages[index] = [url];
          }
          return newImages;
        });
      }
    );
  };

  const handleDeleteImage = (unitIndex, imgIndex) => {
    const updatedImages = { ...unitImages };
    updatedImages[unitIndex].splice(imgIndex, 1);
    setUnitImages(updatedImages);
  };

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        window.location.reload(); // Reload or redirect to login
      })
      .catch((error) => {
        console.error("Error signing out:", error);
        alert("Error signing out");
      });
  };
  

  return (
<div className="fleetform-container">
<div className="top-buttons">
  <button className="search-button" onClick={() => navigate("/fleetlist")}>
    Search Fleets
  </button>
  <button className="logout-button" onClick={handleLogout}>
    Logout
  </button>
</div>

  <h2 className="fleetform-heading">Welcome, {userName}</h2>
  <h3 className="fleetform-subheading">Fleet Date: {fleetDate || "Not Set"}</h3>

  <div className="fleetform-form-group">
    <label htmlFor="unitType">Unit Type</label>
    <select id="unitType" value={unitType} onChange={(e) => setUnitType(e.target.value)} className="fleetform-select">
      <option value="">Select Unit Type</option>
      <option value="Truck">Truck</option>
      <option value="Trailer">Trailer</option>
    </select>
  </div>

  <div className="fleetform-form-group-unit-number">
    <label htmlFor="unitNumber">Unit Number</label>
    <input
      type="text"
      id="unitNumber"
      className="fleetform-input"
      placeholder="Unit Number"
      value={unitNumber}
      onChange={(e) => setUnitNumber(e.target.value)}
    />
  </div>

  <div className="fleetform-form-group">
    <label htmlFor="urgency">Urgency</label>
    <select id="urgency" value={urgency} onChange={(e) => setUrgency(e.target.value)} className="fleetform-select">
      <option value="">Select Urgency</option>
      <option value="Emergency">Emergency</option>
      <option value="Urgent">Urgent</option>
      <option value="Non-Urgent">Non-Urgent</option>
    </select>
  </div>

  <button className="fleetform-add-unit-button" onClick={handleAddUnit}>Add Unit</button>

  <div className="fleetform-units-list">
    {units.map((unit, index) => (
      <div key={index} className="fleetform-unit-card">
        <button
  className="fleetform-x-button"
  onClick={() => handleDeleteUnit(index)}
  title="Delete Unit"
>
  &times;
</button>
        <p className="fleetform-unit-info">{unit.unitType} #{unit.unitNumber}</p>
        <p className="fleetform-unit-urgency">Urgency: {unit.urgency}</p>

        {unitSpecifics[index] && (
          <div className="fleetform-unit-specifics">
            <strong>Specifics:</strong>
            {unitSpecifics[index].map((s, i) => (
              <p key={i}>
                {s.position} - {s.ServiceType} - {s.treadDepth} - {s.selectedTire}
              </p>
            ))}
          </div>
        )}

        <Dropzone onDrop={(files) => handleDrop(files, index)}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} className="fleetform-dropzone">
              <input {...getInputProps()} />
              <p>Upload Image</p>
            </div>
          )}
        </Dropzone>

        <div className="fleetform-unit-card__image-preview">
          {(unitImages[index] || []).map((url, i) => (
            <div key={i} className="fleetform-image-preview-item" style={{ position: "relative" }}>
  <img src={url} alt="unit" />
  <button
    className="fleetform-remove-image-button"
    onClick={() => handleDeleteImage(index, i)}
  >
    &times;
  </button>
</div>
          ))}
        </div>

        <button
          className="fleetform-add-specifics-button"
          onClick={() => {
            setSelectedUnitIndex(index);
            setModalOpen(true);
          }}
        >
          Add Specifics
        </button>
      </div>
    ))}
  </div>

  <button className="fleetform-submit-button" onClick={handleSubmitFleet}>Submit Fleet</button>
  {fleetId && (
  <div className="fleetform-fleet-id-display">
    <p><strong>Fleet ID:</strong> {fleetId}</p>
    <button
      className="fleetform-copy-button"
      onClick={() => {
        navigator.clipboard.writeText(fleetId);
        alert("Fleet ID copied to clipboard!");
      }}
    >
      Copy Fleet ID
    </button>
    <button
      className="fleetform-send-button"
    >
      Send Fleet ID
    </button>
  </div>
)}
</div>

  );
};

export default FleetForm;
