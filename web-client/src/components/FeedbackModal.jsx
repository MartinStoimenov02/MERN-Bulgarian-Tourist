import React, { useState, useEffect } from "react";
import "../style/FeedbackModal.css";

const FeedbackModal = ({ isOpen, onClose, setIsModalOpenSuccess }) => {
  const [user, setUser] = useState(null);
  const [feedbackType, setFeedbackType] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [messageAlert, setMessageAlert] = useState("");
  const [success, setSuccess] = useState(false);

  const host = process.env.REACT_APP_HOST;
  const port = process.env.REACT_APP_PORT;

  useEffect(() => {
    const userSession = localStorage.getItem("userSession");
    if (userSession) {
      setUser(JSON.parse(userSession));
    }
  }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!feedbackType) {
            setMessageAlert("Моля, изберете тип обратна връзка!");
            setSuccess(false);
    
            setTimeout(() => {
              setMessageAlert("");
            }, 3000);
            return;
        }

        if (rating===0) {
            setMessageAlert("Моля, изберете рейтинг!");
            setSuccess(false);
    
            setTimeout(() => {
              setMessageAlert("");
            }, 3000);
            return;
        }
    
        const feedbackData = {
            userId: user.id,
            feedbackType,
            message,
            rating,
        };
    
        try {
            const response = await fetch('http://'+host+':'+port+'/feedback/createFeedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData),
            });
    
            const data = await response.json();
    
            if (data.success) {
                setIsModalOpenSuccess(true);
            } else {
              setMessageAlert(data.message);
              setSuccess(false);
      
              setTimeout(() => {
                setMessageAlert("");
              }, 3000);
            }
    
        } catch (error) {
            console.error("Error submitting feedback:", error);
        }    
        setMessage("");
        setRating(0);
        setFeedbackType(""); 
    };

  if (!isOpen) return null;

  return (
    <div className="feedback-modal">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Дайте обратна връзка</h2>
        
        <div className="feedback-type-rating">
            {/* Feedback Type Selection */}
            <label className="block mb-2">
                <select
                className="modal-input"
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                >
                <option value="" disabled>Тип</option>
                <option value="Доклад за грешка">Доклад за грешка</option>
                <option value="Предложение">Предложение</option>
                <option value="Жалба">Жалба</option>
                <option value="Обща обратна връзка">Обща обратна връзка</option>
                <option value="Помощ и въпроси">Помощ и въпроси</option>
                </select>
            </label>

            {/* Rating Stars */}
            <label className="rating-label">
                <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                    key={star}
                    className={`star ${star <= rating ? "active" : ""}`}
                    onClick={() => setRating(star)}
                    >
                    &#9733;
                    </span>
                ))}
                </div>
            </label>
            </div>


        <div>
          <label className="block mb-2">
            Съобщение (незадължително):
            <textarea
              className="description-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </label>
        </div>

        <div className="modal-buttons">
          <button type="submit" className="btn-primary" onClick={handleSubmit}>
            Изпрати
          </button>
          <button type="button" className="btn-cancel" onClick={onClose}>
            Откажи
          </button>
        </div>
      </div>

      {messageAlert && <p className={success ? "success-message" : "error-message"}>{messageAlert}</p>}
    </div>
  );
};

export default FeedbackModal;
