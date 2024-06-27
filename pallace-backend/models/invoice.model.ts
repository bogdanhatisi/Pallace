// models/invoice.model.ts

import { z } from 'zod';

const invoiceTypeSchema = z.enum(['SENT', 'RECEIVED']);

const uploadInvoiceBodySchema = z.object({
  file: z.instanceof(File),
  type: invoiceTypeSchema
});
export interface Invoice {
  id: string;
  filePath: string;
  total: number;
  category?: string;
  date?: string;
  createdAt: string;
  updatedAt: string;
  type: InvoiceType;
}

export interface UpdateInvoiceBodyType {
  id: string;
  total: number;
  category?: string;
  createdAt?: string;
  type: InvoiceType;
}

export type UploadInvoiceBodyType = z.infer<typeof uploadInvoiceBodySchema>;
export type InvoiceType = z.infer<typeof invoiceTypeSchema>;
