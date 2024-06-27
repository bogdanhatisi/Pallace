// src/services/invoiceService.ts

export interface Invoice {
  id: string;
  filePath: string;
  total: number;
  category?: string;
  date?: string;
  createdAt: string;
  updatedAt: string;
  type: "SENT" | "RECEIVED"; // Add the type field to Invoice interface
}

const BASE_URL_INVOICES = "http://localhost:8000/api/invoices";
const BASE_URL_STORAGE = "http://localhost:8000/api/storage";

export const uploadInvoice = async (
  file: File,
  activeTab: "SENT" | "RECEIVED"
): Promise<Response> => {
  const formData = new FormData();
  formData.append("file", file, encodeURIComponent(file.name)); // Encode the file name
  formData.append("type", activeTab); // Include the type in the form data

  const response = await fetch(`${BASE_URL_INVOICES}/upload/${activeTab}`, {
    method: "POST",
    body: formData,
    credentials: "include", // Include cookies in the request
  });

  return response;
};

export const fetchInvoices = async (
  activeTab: "SENT" | "RECEIVED"
): Promise<Invoice[]> => {
  const response = await fetch(
    `${BASE_URL_INVOICES}/allUserInvoices/${activeTab}`,
    {
      method: "GET",
      credentials: "include", // Include cookies in the request
    }
  );

  if (response.ok) {
    const data: Invoice[] = await response.json();
    // Decode the file paths
    const decodedData = data.map((invoice) => ({
      ...invoice,
      filePath: decodeURIComponent(invoice.filePath),
    }));
    return decodedData;
  } else {
    throw new Error("Failed to fetch invoices");
  }
};

export const deleteInvoice = async (
  userId: string,
  fileName: string,
  activeTab: "SENT" | "RECEIVED"
): Promise<Response> => {
  const fileNameEncoded = encodeURIComponent(fileName);
  const response = await fetch(
    `${BASE_URL_STORAGE}/${userId}/${fileNameEncoded}/${activeTab}`,
    {
      method: "DELETE",
      credentials: "include", // Include cookies in the request
    }
  );

  return response;
};

export const processInvoice = async (
  userId: string,
  fileName: string
): Promise<Response> => {
  const fileNameEncoded = encodeURIComponent(fileName);
  const response = await fetch(
    `${BASE_URL_STORAGE}/${userId}/${fileNameEncoded}/process`,
    {
      method: "GET",
      credentials: "include", // Include cookies in the request
    }
  );

  return response;
};

export const updateInvoice = async (
  id: string,
  total: number,
  category?: string,
  createdAt?: string,
  type?: "SENT" | "RECEIVED"
): Promise<Invoice> => {
  const response = await fetch(`${BASE_URL_INVOICES}/updateInvoice`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include cookies in the request
    body: JSON.stringify({ id, total, category, createdAt, type }),
  });

  if (response.ok) {
    const updatedInvoice: Invoice = await response.json();
    return updatedInvoice;
  } else {
    throw new Error("Failed to update invoice");
  }
};
