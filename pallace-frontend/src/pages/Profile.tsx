// Profile.tsx
import React, { useState, useEffect } from "react";
import "./Profile.css";
import { updateUserProfile } from "../services/userService";

interface ProfileProps {
  onClose: () => void;
  onProfileUpdate: () => void; // Add this prop
  userName: string;
}

const Profile: React.FC<ProfileProps> = ({
  onClose,
  onProfileUpdate,
  userName,
}) => {
  const [profileName, setProfileName] = useState(userName);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setProfileName(userName);
  }, [userName]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileName(e.target.value);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmNewPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmNewPassword(e.target.value);
  };

  const handleSave = async () => {
    if (newPassword && newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    setError("");
    try {
      await updateUserProfile({ name: profileName, password: newPassword });
      onProfileUpdate(); // Call the callback to refresh user data
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="profile-modal">
        <button className="close-button" onClick={onClose}>
          X
        </button>
        <h2>Edit Profile</h2>
        <div className="input-container">
          <label>
            Name:
            <input
              type="text"
              value={profileName}
              onChange={handleNameChange}
            />
          </label>
        </div>
        <div className="input-container">
          <label>
            New Password:
            <input
              type="password"
              value={newPassword}
              onChange={handleNewPasswordChange}
            />
          </label>
        </div>
        <div className="input-container">
          <label>
            Confirm New Password:
            <input
              type="password"
              value={confirmNewPassword}
              onChange={handleConfirmNewPasswordChange}
            />
          </label>
        </div>
        {error && <p className="error-message">{error}</p>}
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default Profile;
