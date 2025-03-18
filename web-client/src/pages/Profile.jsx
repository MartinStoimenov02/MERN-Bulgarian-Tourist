import React, { useState } from "react";
import FeedbackModal from "../components/FeedbackModal";

const Profile = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCloseModalSuccess = () => {
    setIsFeedbackOpen(false); 
    setMessage("Благодарим Ви за обратната връзка!");
    setSuccess(true);
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <div>
      <h1>My Profile</h1>
      <button
        onClick={() => setIsFeedbackOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Give Feedback
      </button>

      {/* Pass correct onClose handler */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        setIsModalOpenSuccess={handleCloseModalSuccess}
      />

      {message && <p className={success ? "success-message" : "error-message"}>{message}</p>}
    </div>
  );
};

export default Profile;
