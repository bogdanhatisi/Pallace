import { z } from 'zod';
const invoiceTypeSchema = z.enum(['SENT', 'RECEIVED']);

const uploadInvoiceBodySchema = z.object({
  file: z.instanceof(File),
  type: invoiceTypeSchema
});

export type UploadInvoiceBodyType = z.infer<typeof uploadInvoiceBodySchema>;
export type InvoiceType = z.infer<typeof invoiceTypeSchema>;
