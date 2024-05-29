import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Invoice.css";
import Header from "../pages/Header";

interface Invoice {
  id: string;
  filePath: string;
  total: number;
  createdAt: string;
  updatedAt: string;
}

const Invoice: React.FC = () => {
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

    const formData = new FormData();
    formData.append("file", file, encodeURIComponent(file.name));

    try {
      const response = await fetch(
        "http://localhost:8000/api/invoices/upload",
        {
          method: "POST",
          body: formData,
          credentials: "include", // Include cookies in the request
        }
      );

      if (response.ok) {
        setMessage("File uploaded successfully.");
        setMessageType("success");
        fetchInvoices(); // Fetch the invoices again to update the list
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

  const fetchInvoices = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/invoices/allUserInvoices",
        {
          method: "GET",
          credentials: "include", // Include cookies in the request
        }
      );

      if (response.ok) {
        const data: Invoice[] = await response.json();
        setInvoices(data);
      } else {
        console.error("Failed to fetch invoices");
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
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
              <th>ID</th>
              <th>File Path</th>
              <th>Total</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default Invoice;
