import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Invoice.css";
import Header from "../pages/Header";

const Invoice: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<string>("error");
  const [userName, setUserName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file to upload.");
      setMessageType("error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://localhost:8000/api/invoices/upload",
        {
          method: "POST",
          body: formData,
          credentials: "include", // Include cookies in the request
        }
      );
      console.log(response);
      if (response.ok) {
        setMessage("File uploaded successfully.");
        setMessageType("success");
      } else {
        setMessage("Failed to upload file.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file.");
      setMessageType("error");
    }
  };

  return (
    <div className="invoice-container">
      <Header userName={userName} />
      <main className="invoice-main">
        <h2>Upload Financial Statement</h2>
        <form className="upload-form" onSubmit={handleSubmit}>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          <button type="submit">Upload</button>
        </form>
        {message && <div className={`message ${messageType}`}>{message}</div>}
      </main>
    </div>
  );
};

export default Invoice;
