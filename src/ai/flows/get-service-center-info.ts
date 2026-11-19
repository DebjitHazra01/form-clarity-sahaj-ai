/**
 * @fileOverview Flow to find verified government service centers near the citizen.
 *
 * Grounded in official India Post directories, UIDAI Aadhaar centers, PSKs, and RTOs.
 * Never invents office details or addresses.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { findNearbyGovernmentOffices, type VerifiedOffice } from '@/lib/government-offices';

const GetServiceCenterInfoInputSchema = z.object({
  explanation: z.string().optional().describe('The explanation of the government form.'),
  formTitle: z.string().optional().describe('Title of the form.'),
  issuingDepartment: z.string().optional().describe('Issuing department.'),
  pinCode: z.string().optional().describe('6-digit Indian Postal PIN code.'),
  latitude: z.number().optional().describe('User GPS latitude if location permission granted.'),
  longitude: z.number().optional().describe('User GPS longitude if location permission granted.'),
});
export type GetServiceCenterInfoInput = z.infer<typeof GetServiceCenterInfoInputSchema>;

const VerifiedOfficeSchema = z.object({
  id: z.string(),
  name: z.string(),
  department: z.string(),
  officeType: z.string(),
  address: z.string(),
  district: z.string(),
  state: z.string(),
  pinCode: z.string(),
  phone: z.string(),
  services: z.array(z.string()),
  operatingHours: z.string(),
  directionsUrl: z.string(),
  officialSourceUrl: z.string(),
  distanceKm: z.number().optional(),
});

const GetServiceCenterInfoOutputSchema = z.object({
  searchQuery: z.string().describe('Google Maps search query.'),
  offices: z.array(VerifiedOfficeSchema).describe('List of verified government centers.'),
  pinCodeUsed: z.string(),
  locationDetected: z.boolean(),
  notes: z.string().optional(),
});
export type GetServiceCenterInfoOutput = z.infer<typeof GetServiceCenterInfoOutputSchema>;

export async function getServiceCenterInfo(input: GetServiceCenterInfoInput): Promise<GetServiceCenterInfoOutput> {
  return getServiceCenterInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getServiceCenterQueryPrompt',
  input: {
    schema: z.object({
      formTitle: z.string().optional(),
      issuingDepartment: z.string().optional(),
      explanation: z.string().optional(),
    }),
  },
  output: {
    schema: z.object({
      searchQuery: z.string().describe('Concise Maps search term like "Aadhaar Seva Kendra", "Passport Seva Kendra", "RTO Office", or "Post Office".'),
    }),
  },
  prompt: `Based on this government form, determine the official type of service counter where citizens submit it.
Form: {{{formTitle}}}
Department: {{{issuingDepartment}}}
Explanation: {{{explanation}}}

Generate a concise search query for Google Maps (e.g. "Aadhaar Seva Kendra", "Passport Seva Kendra", "Post Office", "RTO Office").
Return only the search query.`,
});

const getServiceCenterInfoFlow = ai.defineFlow(
  {
    name: 'getServiceCenterInfoFlow',
    inputSchema: GetServiceCenterInfoInputSchema,
    outputSchema: GetServiceCenterInfoOutputSchema,
  },
  async input => {
    let query = 'Government Citizen Service Center';
    try {
      if (input.formTitle || input.explanation) {
        const aiRes = await prompt({
          formTitle: input.formTitle,
          issuingDepartment: input.issuingDepartment,
          explanation: input.explanation,
        });
        if (aiRes.output?.searchQuery) {
          query = aiRes.output.searchQuery;
        }
      }
    } catch (e) {
      console.warn('Could not generate query via AI:', e);
    }

    const { offices, pinCodeUsed, userLocationApproved } = await findNearbyGovernmentOffices({
      pinCode: input.pinCode,
      latitude: input.latitude,
      longitude: input.longitude,
    });

    let notes: string | undefined;
    if (offices.length === 0) {
      notes = pinCodeUsed
        ? `No verified local government branch was found for PIN code ${pinCodeUsed} in our immediate registry. Please use the official Government of India portal links below to locate the nearest accredited counter.`
        : 'Please enter a 6-digit Indian PIN code or allow location access to find verified nearby government offices.';
    }

    return {
      searchQuery: query,
      offices: offices as any,
      pinCodeUsed,
      locationDetected: userLocationApproved,
      notes,
    };
  }
);
