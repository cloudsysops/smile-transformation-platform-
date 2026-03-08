import { z } from "zod";

const UuidSchema = z.string().uuid();

export const LeadCreateSchema = z.object({
  first_name: z.string().min(1).max(200),
  last_name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
  country: z.string().max(100).optional(),
  package_slug: z.string().max(100).optional(),
  message: z.string().max(2000).optional(),
  /** Specialists the patient would like to consult (IDs). */
  specialist_ids: z.array(UuidSchema).max(20).optional().default([]),
  /** Experiences the patient is interested in (IDs). */
  experience_ids: z.array(UuidSchema).max(20).optional().default([]),
  /** Curated network: specialty names of interest. */
  selected_specialties: z.array(z.string()).max(20).optional().default([]),
  /** Curated network: experience categories of interest. */
  selected_experience_categories: z.array(z.string()).max(20).optional().default([]),
  /** Curated network: experience IDs of interest (alias/supplement to experience_ids). */
  selected_experience_ids: z.array(UuidSchema).max(30).optional().default([]),
  travel_companions: z.string().max(200).optional(),
  budget_range: z.string().max(100).optional(),
  utm_source: z.string().max(200).optional(),
  utm_medium: z.string().max(200).optional(),
  utm_campaign: z.string().max(200).optional(),
  /** Honeypot: allow values and silently drop bot-like submissions in handler. */
  company_website: z.string().max(500).optional(),
});

export type LeadCreate = z.infer<typeof LeadCreateSchema>;
