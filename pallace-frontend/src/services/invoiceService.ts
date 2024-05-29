// src/services/invoiceService.ts

export interface Invoice {
  id: string;
  filePath: string;
  total: number;
  createdAt: string;
  updatedAt: string;
}

const BASE_URL_INVOICES = "http://localhost:8000/api/invoices";
const BASE_URL_STORAGE = "http://localhost:8000/api/storage";

export const uploadInvoice = async (file: File): Promise<Response> => {
  const formData = new FormData();
  formData.append("file", file, encodeURIComponent(file.name)); // Encode the file name

  const response = await fetch(`${BASE_URL_INVOICES}/upload`, {
    method: "POST",
    body: formData,
    credentials: "include", // Include cookies in the request
  });

  return response;
};

export const fetchInvoices = async (): Promise<Invoice[]> => {
  const response = await fetch(`${BASE_URL_INVOICES}/allUserInvoices`, {
    method: "GET",
    credentials: "include", // Include cookies in the request
  });

  if (response.ok) {
    const data: Invoice[] = await response.json();
    return data;
  } else {
    throw new Error("Failed to fetch invoices");
  }
};

export const deleteInvoice = async (
  userId: string,
  fileName: string
): Promise<Response> => {
  const fileNameEncoded = encodeURIComponent(fileName);
  const response = await fetch(
    `${BASE_URL_STORAGE}/${userId}/${fileNameEncoded}`,
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
