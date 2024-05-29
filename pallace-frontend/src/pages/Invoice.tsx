import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Invoice.css";
import Header from "../pages/Header";
import {
  Invoice,
  uploadInvoice,
  fetchInvoices,
  deleteInvoice,
  processInvoice,
} from "../services/invoiceService";

const InvoiceComponent: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<string>("error");
  const [userName, setUserName] = useState<string>("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const convertFilePath = (filePath: string): string => {
    return filePath.replace(/^uploads\\/, "").replace(/\\/g, "/");
  };

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

    try {
      const response = await uploadInvoice(file);

      if (response.ok) {
        setMessage("File uploaded successfully.");
        setMessageType("success");
        loadInvoices(); // Fetch the invoices again to update the list
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

  const loadInvoices = async () => {
    try {
      const data = await fetchInvoices();
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const handleDelete = async (invoice: Invoice) => {
    const userId = invoice.filePath.split("\\")[1];
    const fileName = invoice.filePath.split("\\")[2];

    try {
      const response = await deleteInvoice(userId, fileName);

      if (response.ok) {
        setMessage("File deleted successfully.");
        setMessageType("success");
        loadInvoices(); // Fetch the invoices again to update the list
      } else {
        setMessage("Failed to delete file.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      setMessage("Error deleting file.");
      setMessageType("error");
    }
  };

  const handleProcess = async (invoice: Invoice) => {
    const userId = invoice.filePath.split("\\")[1];
    const fileName = invoice.filePath.split("\\")[2];

    try {
      const response = await processInvoice(userId, fileName);

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setMessage("File processed successfully.");
        setMessageType("success");
        loadInvoices(); // Fetch the invoices again to update the list
      } else {
        setMessage("Failed to process file.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      setMessage("Error processing file.");
      setMessageType("error");
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

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

        <h2>Your Invoices</h2>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>NAME</th>
              <th>File Path</th>
              <th>Total</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.filePath.split("\\")[2]}</td>
                <td>
                  <a
                    href={`http://localhost:8000/api/storage/${convertFilePath(
                      invoice.filePath
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View File
                  </a>
                </td>
                <td>{invoice.total}</td>
                <td>{new Date(invoice.createdAt).toLocaleString()}</td>
                <td>{new Date(invoice.updatedAt).toLocaleString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(invoice)}
                    >
                      Delete
                    </button>
                    <button
                      className="process-button"
                      onClick={() => handleProcess(invoice)}
                    >
                      Process
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default InvoiceComponent;
