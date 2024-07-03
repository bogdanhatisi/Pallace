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
  updateInvoice,
} from "../services/invoiceService";
import LineChart from "../components/LineChart"; // Import the LineChart component

const InvoiceComponent: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<string>("error");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<"SENT" | "RECEIVED">("SENT");

  const convertFilePath = (filePath: string): string => {
    return filePath.replace(/^uploads\\/, "").replace(/\\/g, "/");
  };

  const handleTotalChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    invoice: Invoice
  ) => {
    const newTotal = parseInt(e.target.value, 10);
    const updatedInvoice = { ...invoice, total: newTotal };
    const updatedInvoices = invoices.map((inv) =>
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    );
    setInvoices(updatedInvoices);
  };

  const handleCategoryChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    invoice: Invoice
  ) => {
    const newCategory = e.target.value;
    const updatedInvoice = { ...invoice, category: newCategory };
    const updatedInvoices = invoices.map((inv) =>
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    );
    setInvoices(updatedInvoices);
  };

  const handleDateChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    invoice: Invoice
  ) => {
    const selectedDate = new Date(e.target.value);
    const newDate = new Date(
      Date.UTC(
        selectedDate.getUTCFullYear(),
        selectedDate.getUTCMonth(),
        selectedDate.getUTCDate(),
        0,
        0,
        0
      )
    ).toISOString();
    const updatedInvoice = { ...invoice, createdAt: newDate };
    console.log(updatedInvoice);
    const updatedInvoices = invoices.map((inv) =>
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    );
    setInvoices(updatedInvoices);
  };
  const getDatePart = (isoString: string) => {
    return isoString.split("T")[0];
  };

  const handleUpdateInvoice = async (invoice: Invoice) => {
    updateInvoice(
      invoice.id,
      invoice.total,
      invoice.category,
      invoice.createdAt
    );
    console.log(invoice);
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
      const response = await uploadInvoice(file, activeTab);
      if (response.ok) {
        setMessage("File uploaded successfully.");
        setMessageType("success");
        loadInvoices(); // Fetch the invoices again to update the list
      } else {
        const responseData = await response.json();
        setMessage(responseData.error || "Failed to upload file.");
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
      const data = await fetchInvoices(activeTab);
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const handleDelete = async (invoice: Invoice) => {
    const userId = invoice.filePath.split("\\")[1];
    const fileName = invoice.filePath.split("\\")[2];

    try {
      const response = await deleteInvoice(userId, fileName, activeTab);

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
  }, [activeTab]);

  return (
    <div className="main-invoice-page">
      <Header />
      <div className="invoice-container">
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

          <div className="tabs">
            <button
              className={`tab ${activeTab === "SENT" ? "active" : "inactive"}`}
              onClick={() => setActiveTab("SENT")}
            >
              Sent Invoices
            </button>
            <button
              className={`tab ${
                activeTab === "RECEIVED" ? "active" : "inactive"
              }`}
              onClick={() => setActiveTab("RECEIVED")}
            >
              Received Invoices
            </button>
          </div>

          <h2>Your Invoices</h2>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>File Path</th>
                <th>Total</th>
                <th>Category</th>
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
                  <td>
                    <input
                      type="float"
                      value={invoice.total}
                      onChange={(e) => handleTotalChange(e, invoice)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={invoice.category}
                      onChange={(e) => handleCategoryChange(e, invoice)}
                    />
                  </td>
                  <td>
                    <input
                      type="Date"
                      value={getDatePart(invoice.createdAt)}
                      onChange={(e) => handleDateChange(e, invoice)}
                    />
                  </td>
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
                      <button
                        className="update-button"
                        onClick={() => handleUpdateInvoice(invoice)}
                      >
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
};

export default InvoiceComponent;
