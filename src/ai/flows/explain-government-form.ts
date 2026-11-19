/**
 * @fileOverview An AI agent to explain government forms in simple language across 6 languages.
 *
 * - explainGovernmentForm - A function that handles the explanation process.
 * - ExplainGovernmentFormInput - The input type for the explainGovernmentForm function.
 * - ExplainGovernmentFormOutput - The return type for the explainGovernmentForm function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFormDesignatedOfficeGuidance, type DesignatedOfficeGuidance as PureDesignatedOfficeGuidance } from '@/lib/designated-offices';

export { getFormDesignatedOfficeGuidance };

export const SupportedLanguages = [
  'English',
  'Hindi',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Tamil',
] as const;

export type SupportedLanguage = (typeof SupportedLanguages)[number];

const ExplainGovernmentFormInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      'The government form document as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' +
      ' Supports PDF, JPG, JPEG, and PNG.'
    ),
  language: z.enum(SupportedLanguages).default('English').describe('The primary language to explain the form in.'),
  fileName: z.string().optional().describe('Original file name of the uploaded document.'),
});
export type ExplainGovernmentFormInput = z.infer<typeof ExplainGovernmentFormInputSchema>;

export const RequiredDocumentSchema = z.object({
  name: z.string().describe('The document name in English (e.g. Proof of Identity, Aadhaar Card, Electricity Bill).'),
  nameHi: z.string().optional().describe('Document name in Hindi (हिंदी).'),
  nameBn: z.string().optional().describe('Document name in Bengali (বাংলা).'),
  requirementType: z
    .enum(['mandatory', 'optional', 'conditional'])
    .default('mandatory')
    .describe('Whether this document is mandatory for all applicants, optional, or conditional based on circumstance.'),
  condition: z
    .string()
    .optional()
    .describe('If conditional, clear explanation of the circumstance when this document is required (e.g. "Required only if changing name after marriage" or "Required only if applying for minor").'),
  reason: z.string().describe('Why this document is needed in English.'),
  reasonHi: z.string().optional().describe('Why this document is needed in Hindi (हिंदी).'),
  reasonBn: z.string().optional().describe('Why this document is needed in Bengali (বাংলা).'),
  acceptableProofs: z
    .array(z.string())
    .optional()
    .describe('List of acceptable proof documents that satisfy this requirement (e.g. ["Voter ID", "Passport", "Ration Card"]).'),
  category: z.string().optional().describe('Category such as Identity Proof, Address Proof, Photo, Date of Birth Proof, Income Certificate.'),
});
export type RequiredDocument = z.infer<typeof RequiredDocumentSchema>;

export const FormFieldSchema = z.object({
  key: z.string().describe('A stable lower_snake_case identifier for this field (e.g. full_name, dob, gender, mobile_number, address, pin_code).'),
  label: z.string().describe('The official label printed on the form in English.'),
  labelHi: z.string().optional().describe('The label in Hindi (हिंदी).'),
  labelBn: z.string().optional().describe('The label in Bengali (বাংলা).'),
  technicalTerm: z.string().optional().describe('The original legal or administrative jargon term on the form (e.g. "Demographic Update", "Care of", "Gross Emoluments").'),
  simplifiedExplanation: z.string().optional().describe('Simple plain-language explanation of what this field asks for in everyday words.'),
  required: z.boolean().describe('Whether the form requires this field.'),
  expectedFormat: z.string().optional().describe('Expected format or input guidelines (e.g. "DD/MM/YYYY", "10-digit number", "Capital Letters").'),
  whereToFind: z.string().optional().describe('A clear note on where the citizen can find this value or what document proves it.'),
  hint: z.string().describe('A short tip for the applicant.'),
  category: z.string().optional().describe('Section category such as Personal Details, Identity, Address, Financial, Declaration.'),
});
export type FormField = z.infer<typeof FormFieldSchema>;

export const DesignatedOfficeGuidanceSchema = z.object({
  primaryOfficeName: z.string().describe('The primary physical government office or center the citizen must visit (e.g. "UIDAI Aadhaar Seva Kendra (ASK) or Designated India Post Office").'),
  primaryOfficeNameHi: z.string().optional().describe('Primary office name in Hindi (हिंदी).'),
  primaryOfficeNameBn: z.string().optional().describe('Primary office name in Bengali (বাংলা).'),
  counterName: z.string().describe('The specific desk, counter, or section inside the office (e.g. "Aadhaar Enrolment & Update Counter", "Passport Verification Counter A").'),
  alternativeOffices: z.array(z.string()).describe('Alternative authorized locations where this form can also be submitted (e.g. ["Authorized Public Sector Bank Branches", "Common Service Centers (CSC) Digital Seva"]).'),
  actionsAtOffice: z.array(z.string()).describe('List of specific steps the citizen will undergo at the office (e.g. ["Original document verification", "Biometric capture", "Acknowledgment slip with tracking ID"]).'),
  officialFees: z.string().describe('Official statutory government fee schedule or "Free of Cost" note (e.g. "New Enrolment: Free | Demographic Update: Rs 50 | Biometric Update: Rs 100").'),
  appointmentAdvice: z.string().describe('Guidance on whether walk-in is accepted or prior online appointment booking is mandatory/recommended.'),
  workingHours: z.string().optional().describe('Standard operating timings (e.g. "Monday to Saturday: 9:30 AM - 5:30 PM").'),
  helpline: z.string().optional().describe('Toll-free citizen helpline phone number.'),
});
export type DesignatedOfficeGuidance = z.infer<typeof DesignatedOfficeGuidanceSchema>;

const ExplainGovernmentFormOutputSchema = z.object({
  formTitle: z.string().describe('The official name or title of this government form in English (e.g. "Aadhaar Enrolment / Update Form", "Form 49A PAN Application").'),
  formTitleHi: z.string().optional().describe('Form title in Hindi (हिंदी).'),
  formTitleBn: z.string().optional().describe('Form title in Bengali (বাংলা).'),
  
  issuingDepartment: z.string().describe('The verified issuing government ministry, department, or statutory authority (e.g. "Unique Identification Authority of India (UIDAI), Ministry of Electronics & IT", "Income Tax Department, Ministry of Finance").'),
  issuingDepartmentHi: z.string().optional().describe('Issuing department in Hindi (हिंदी).'),
  issuingDepartmentBn: z.string().optional().describe('Issuing department in Bengali (বাংলা).'),

  applicationType: z.string().describe('The type of application this form represents (e.g. "New Enrolment", "Demographic / Biometric Update", "Correction", "Renewal", "Duplicate Certificate").'),
  applicationTypeHi: z.string().optional().describe('Application type in Hindi (हिंदी).'),
  applicationTypeBn: z.string().optional().describe('Application type in Bengali (বাংলা).'),

  purpose: z.string().describe('A concise 1-2 sentence plain-language summary of what this form is used for in English.'),
  purposeHi: z.string().optional().describe('Purpose summary in Hindi (हिंदी).'),
  purposeBn: z.string().optional().describe('Purpose summary in Bengali (বাংলা).'),
  
  explanation: z.string().describe('A simplified, citizen-friendly explanation of the government form.'),
  checklist: z.array(z.string()).describe('A checklist of actionable steps to correctly fill and submit the form.'),

  explanations: z.object({
    en: z.string().describe('Clear, simplified explanation in English explaining what the form is, who must submit it, and key steps.'),
    hi: z.string().describe('Clear, simplified explanation translated naturally into simple conversational Hindi (हिंदी).'),
    bn: z.string().describe('Clear, simplified explanation translated naturally into simple conversational Bengali (বাংলা).'),
    mr: z.string().optional().describe('Explanation in Marathi (मराठी).'),
    gu: z.string().optional().describe('Explanation in Gujarati (ગુજરાતી).'),
    ta: z.string().optional().describe('Explanation in Tamil (தமிழ்).'),
  }).optional().describe('Multilingual explanations.'),

  checklists: z.object({
    en: z.array(z.string()).describe('Actionable step-by-step checklist in English.'),
    hi: z.array(z.string()).describe('Actionable step-by-step checklist in Hindi (हिंदी).'),
    bn: z.array(z.string()).describe('Actionable step-by-step checklist in Bengali (বাংলা).'),
    mr: z.array(z.string()).optional().describe('Checklist in Marathi (मराठी).'),
    gu: z.array(z.string()).optional().describe('Checklist in Gujarati (ગુજરાતી).'),
    ta: z.array(z.string()).optional().describe('Checklist in Tamil (தமிழ்).'),
  }).optional().describe('Multilingual checklists.'),

  requiredDocuments: z.array(RequiredDocumentSchema).describe('Supporting documents needed to complete this form, clearly distinguishing mandatory, optional, and conditional.'),
  formFields: z.array(FormFieldSchema).describe('Extracted fields with technical terms compared to simplified explanations in plain language.'),

  designatedOfficeGuidance: DesignatedOfficeGuidanceSchema.optional().describe('Official guidance on exactly which government office, center, or counter the citizen must visit for submission and assistance.'),

  officialPortal: z.string().optional().describe('The official government website URL where this service or form can be verified or filed online.'),
  officialHelpline: z.string().optional().describe('The official toll-free citizen helpline number (e.g. "1947", "1800-180-1961").'),
  submissionMode: z.string().optional().describe('How to submit: "Online", "In-Person at Designated Center", or "Both Online & Offline".'),
});
export type ExplainGovernmentFormOutput = z.infer<typeof ExplainGovernmentFormOutputSchema>;

export async function explainGovernmentForm(input: ExplainGovernmentFormInput): Promise<ExplainGovernmentFormOutput> {
  return explainGovernmentFormFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainGovernmentFormPrompt',
  input: { schema: ExplainGovernmentFormInputSchema },
  output: { schema: ExplainGovernmentFormOutputSchema },
  prompt: `You are an empathetic, authoritative citizen assistance AI named Sahaj AI in India. Your mission is to demystify complex government forms and paperwork for everyday citizens, rural applicants, non-English speakers, and senior citizens.

Carefully examine the uploaded government form document (PDF or image). Accurately identify and extract:
1. formTitle: The official name/title of the form printed on the document.
2. issuingDepartment: The official Indian government department, ministry, or authority (e.g. "Unique Identification Authority of India (UIDAI), Ministry of Electronics & IT", "Department of Revenue", "Election Commission of India", "Income Tax Department", "Ministry of Road Transport and Highways").
3. applicationType: The specific category of application (e.g. "New Application / Enrolment", "Correction / Update", "Renewal", "Duplicate Certificate", "Transfer").
4. purpose: A crystal-clear 1-2 sentence explanation of why a citizen needs to fill this form and what it achieves.
5. explanation: A simple, friendly, easy-to-understand explanation of the form in plain language without bureaucratic jargon.
6. checklist: Step-by-step actionable instructions for completing and submitting this form.
7. requiredDocuments: A thorough list of supporting documents needed.
   CRITICAL REQUIREMENT: For EVERY document, explicitly classify requirementType as one of:
   - "mandatory": Absolutely required for all applicants.
   - "optional": Helpful or alternative, but application proceeds without it.
   - "conditional": Required ONLY under specific circumstances. For ANY conditional document, you MUST provide a detailed "condition" field explaining exactly when it is needed (e.g. "Mandatory only if you are updating your residential address", "Mandatory only if the applicant is a minor under 18 years", "Mandatory only if claiming name change after marriage").
   Also list 2-4 acceptableProofs for each document requirement.
8. formFields: Extract key fields from the form. For each field:
   - Provide "technicalTerm" (the formal phrase on the form, e.g. "Demographic Details Update", "Care of (C/o)", "Gross Total Income").
   - Provide "simplifiedExplanation" (plain-spoken explanation of what the citizen should actually write).
   - "expectedFormat" (e.g. "DD/MM/YYYY", "10-digit mobile number", "BLOCK LETTERS").
   - "whereToFind" (e.g. "From your Voter ID", "Found on page 1 of bank passbook").
   - Set "required" to true or false.
9. designatedOfficeGuidance: AUTOMATIC FORM-TO-OFFICE MAPPING FOR CITIZEN ASSISTANCE:
   Accurately detect and determine the exact physical government office, center, and counter the citizen must visit for submission and in-person help for this form:
   - primaryOfficeName: The primary physical government office or center (e.g. "UIDAI Aadhaar Seva Kendra (ASK) or Designated Head Post Office", "Passport Seva Kendra (PSK) / Post Office PSK", "Regional Transport Office (RTO)", "Protean (NSDL) TIN-Facilitation Center / UTIITSL Center", "Block Development Office (BDO) / Municipal Borough Office", "Electoral Registration Office (ERO)").
   - counterName: Specific section or desk (e.g. "Aadhaar Enrolment / Update Counter", "Driving License Biometric Counter", "Document Scrutiny Counter A").
   - alternativeOffices: 2-3 authorized alternative locations (e.g. "Designated Public Sector Bank Branches (SBI, PNB)", "Common Service Centers (CSC) Digital Seva", "Duare Sarkar Camps").
   - actionsAtOffice: 2-4 exact steps the citizen will undergo at the office (e.g. original document verification, biometric capture, payment of official fee, collection of acknowledgment slip).
   - officialFees: Statutory government fee schedule or "Free of Cost" note (e.g. "Fresh Enrolment: Free | Demographic Update: ₹50 | Biometric: ₹100").
   - appointmentAdvice: Explain if walk-in is accepted or online appointment slot booking is required.
   - workingHours: Official working hours (e.g. "Monday to Saturday: 9:30 AM - 5:30 PM (except gazetted holidays)").
10. officialPortal, officialHelpline, submissionMode: Provide verified official Indian government portals and helplines.

Generate explanations and checklists in {{{language}}}.

Primary requested language: {{{language}}}

Form Document: {{media url=documentDataUri}}`,
});

const explainGovernmentFormFlow = ai.defineFlow(
  {
    name: 'explainGovernmentFormFlow',
    inputSchema: ExplainGovernmentFormInputSchema,
    outputSchema: ExplainGovernmentFormOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI could not analyze the document.');
    }

    const enExp = output.explanations?.en || output.explanation || 'Government form simplified explanation.';
    const hiExp = output.explanations?.hi || output.explanation || enExp;
    const bnExp = output.explanations?.bn || output.explanation || enExp;

    const enCheck = output.checklists?.en || output.checklist || [];
    const hiCheck = output.checklists?.hi || output.checklist || enCheck;
    const bnCheck = output.checklists?.bn || output.checklist || enCheck;

    let defaultExp = output.explanation || enExp;
    let defaultCheck = output.checklist || enCheck;
    if (input.language === 'Bengali' && bnExp) {
      defaultExp = bnExp;
      defaultCheck = bnCheck;
    } else if (input.language === 'Hindi' && hiExp) {
      defaultExp = hiExp;
      defaultCheck = hiCheck;
    }

    return {
      ...output,
      formTitle: output.formTitle || 'Government Application Form',
      formTitleHi: output.formTitleHi || output.formTitle || 'सरकारी आवेदन फॉर्म',
      formTitleBn: output.formTitleBn || output.formTitle || 'সরকারি আবেদন ফর্ম',
      issuingDepartment: output.issuingDepartment || 'Government Authority of India',
      issuingDepartmentHi: output.issuingDepartmentHi || output.issuingDepartment,
      issuingDepartmentBn: output.issuingDepartmentBn || output.issuingDepartment,
      applicationType: output.applicationType || 'Standard Application',
      applicationTypeHi: output.applicationTypeHi || output.applicationType,
      applicationTypeBn: output.applicationTypeBn || output.applicationType,
      purpose: output.purpose || 'Official application form for citizen services.',
      purposeHi: output.purposeHi || output.purpose,
      purposeBn: output.purposeBn || output.purpose,
      explanation: defaultExp,
      checklist: defaultCheck,
      explanations: {
        en: enExp,
        hi: hiExp,
        bn: bnExp,
        ...(output.explanations || {}),
      },
      checklists: {
        en: enCheck,
        hi: hiCheck,
        bn: bnCheck,
        ...(output.checklists || {}),
      },
      requiredDocuments: (output.requiredDocuments || []).map(doc => ({
        name: doc.name,
        nameHi: doc.nameHi || doc.name,
        nameBn: doc.nameBn || doc.name,
        requirementType: doc.requirementType || 'mandatory',
        condition: doc.condition || (doc.requirementType === 'conditional' ? 'Required under specific conditions' : undefined),
        reason: doc.reason,
        reasonHi: doc.reasonHi || doc.reason,
        reasonBn: doc.reasonBn || doc.reason,
        acceptableProofs: doc.acceptableProofs || [],
        category: doc.category || 'Supporting Document',
      })),
      formFields: (output.formFields || []).map(field => ({
        key: field.key,
        label: field.label,
        labelHi: field.labelHi || field.label,
        labelBn: field.labelBn || field.label,
        technicalTerm: field.technicalTerm || field.label,
        simplifiedExplanation: field.simplifiedExplanation || field.hint || `Enter your ${field.label.toLowerCase()}`,
        required: field.required ?? true,
        expectedFormat: field.expectedFormat || 'Standard format',
        whereToFind: field.whereToFind || field.hint || 'Check your official documents',
        hint: field.hint || 'Check your supporting documents',
        category: field.category || 'General',
      })),
      designatedOfficeGuidance: getFormDesignatedOfficeGuidance(
        output.formTitle || '',
        output.issuingDepartment || '',
        output.designatedOfficeGuidance
      ),
      officialPortal: output.officialPortal || 'https://www.india.gov.in/',
      officialHelpline: output.officialHelpline || '1800-11-4000',
      submissionMode: output.submissionMode || 'Online & In-person at Designated Center',
    };
  }
);
