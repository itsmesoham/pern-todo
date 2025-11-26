import React, { useState } from "react";

export default function SendEmailModal({ selectedTodo, closeModal }) {
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendEmail = async () => {
    if (!emailInput) {
      alert("Please enter an email.");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending todo_id:", selectedTodo.todo_id);

      const response = await fetch("http://localhost:5000/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          to: emailInput,
          subject: "Your Todo PDF",
          message: `Your Todo PDF with todo_id: ${selectedTodo.todo_id}`,
          todo_id: selectedTodo.todo_id
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Email sent successfully!");
        closeModal();
      } else {
        alert(data.error || "Failed to send email");
      }
    } catch (err) {
      console.error("Email Error:", err);
      alert("Failed to send email");
    }

    setLoading(false);
  };

  return (
    <>
      <style>
        {`
          .modal-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
          }

          .modal-box {
            background: white;
            padding: 20px;
            border-radius: 10px;
            width: 320px;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            text-align: center;
          }

          .modal-box input {
            width: 100%;
            padding: 10px;
            margin: 12px 0;
            border: 1px solid #ccc;
            border-radius: 6px;
            font-size: 16px;
          }

          .modal-box button {
            padding: 10px 15px;
            margin: 5px;
            border: none;
            border-radius: 6px;
            font-size: 15px;
            cursor: pointer;
          }

          .modal-box button:first-of-type {
            background: #007bff;
            color: white;
          }

          .modal-box button:last-of-type {
            background: #ccc;
          }

          .disabled-btn {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}
      </style>

      <div className="modal-container">
        <div className="modal-box">
          <h3>Send PDF to Email</h3>

          <input
            type="email"
            placeholder="Enter recipient email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendEmail();
              }
            }}
          />

          <button
            onClick={sendEmail}
            disabled={loading}
            className={loading ? "disabled-btn" : ""}
          >
            {loading ? "Sending..." : "Send"}
          </button>

          <button onClick={closeModal}>Cancel</button>
        </div>
      </div>
    </>
  );
}