/**
 * @fileOverview Genkit flow for translating form explanations and breakdowns across 6 regional languages.
 *
 * Supported Languages: English, Hindi, Bengali, Marathi, Gujarati, Tamil.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SupportedLanguages, type SupportedLanguage } from './explain-government-form';

const DocumentItemSchema = z.object({
  name: z.string(),
  reason: z.string(),
  condition: z.string().optional(),
  category: z.string().optional(),
});

const FieldItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  technicalTerm: z.string().optional(),
  simplifiedExplanation: z.string().optional(),
  whereToFind: z.string().optional(),
});

const TranslateFormExplanationInputSchema = z.object({
  formTitle: z.string().optional(),
  issuingDepartment: z.string().optional(),
  purpose: z.string().optional(),
  applicationType: z.string().optional(),
  explanation: z.string().describe('The explanation of the government form to be translated.'),
  checklist: z.array(z.string()).describe('The checklist of steps to be translated.'),
  requiredDocuments: z.array(DocumentItemSchema).optional().describe('Supporting documents to translate.'),
  formFields: z.array(FieldItemSchema).optional().describe('Form fields to translate.'),
  language: z.enum(SupportedLanguages).describe('The target language for the translation.'),
});
export type TranslateFormExplanationInput = z.infer<typeof TranslateFormExplanationInputSchema>;

const TranslatedDocumentItemSchema = z.object({
  name: z.string(),
  reason: z.string(),
  condition: z.string().optional(),
  category: z.string().optional(),
});

const TranslatedFieldItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  technicalTerm: z.string().optional(),
  simplifiedExplanation: z.string().optional(),
  whereToFind: z.string().optional(),
});

const TranslateFormExplanationOutputSchema = z.object({
  translatedTitle: z.string().optional(),
  translatedDepartment: z.string().optional(),
  translatedPurpose: z.string().optional(),
  translatedApplicationType: z.string().optional(),
  translatedExplanation: z.string().describe('The translated explanation of the government form.'),
  translatedChecklist: z.array(z.string()).describe('The translated checklist of steps.'),
  translatedDocuments: z.array(TranslatedDocumentItemSchema).optional(),
  translatedFields: z.array(TranslatedFieldItemSchema).optional(),
});
export type TranslateFormExplanationOutput = z.infer<typeof TranslateFormExplanationOutputSchema>;

export async function translateFormExplanation(input: TranslateFormExplanationInput): Promise<TranslateFormExplanationOutput> {
  return translateFormExplanationFlow(input);
}

const translateFormExplanationPrompt = ai.definePrompt({
  name: 'translateFormExplanationPrompt',
  input: { schema: TranslateFormExplanationInputSchema },
  output: { schema: TranslateFormExplanationOutputSchema },
  prompt: `You are an expert multilingual government communications translator in India.
Translate the following government form explanation, purpose, department, checklist, document requirements, and field explanations accurately and naturally into {{{language}}}.
Use respectful, simple conversational language appropriate for citizens.

Target Language: {{{language}}}

Form Title: {{{formTitle}}}
Issuing Department: {{{issuingDepartment}}}
Application Type: {{{applicationType}}}
Purpose: {{{purpose}}}

Explanation:
{{{explanation}}}

Checklist:
{{#each checklist}}
- {{{this}}}
{{/each}}

{{#if requiredDocuments}}
Required Documents:
{{#each requiredDocuments}}
- Name: {{{this.name}}} | Reason: {{{this.reason}}} | Condition: {{{this.condition}}}
{{/each}}
{{/if}}

{{#if formFields}}
Form Fields:
{{#each formFields}}
- Key: {{{this.key}}} | Label: {{{this.label}}} | Simplified: {{{this.simplifiedExplanation}}} | Where: {{{this.whereToFind}}}
{{/each}}
{{/if}}
`,
});

const translateFormExplanationFlow = ai.defineFlow(
  {
    name: 'translateFormExplanationFlow',
    inputSchema: TranslateFormExplanationInputSchema,
    outputSchema: TranslateFormExplanationOutputSchema,
  },
  async input => {
    // If target is English and input is already English, pass through
    if (input.language === 'English') {
      return {
        translatedTitle: input.formTitle,
        translatedDepartment: input.issuingDepartment,
        translatedPurpose: input.purpose,
        translatedApplicationType: input.applicationType,
        translatedExplanation: input.explanation,
        translatedChecklist: input.checklist,
        translatedDocuments: input.requiredDocuments,
        translatedFields: input.formFields,
      };
    }

    try {
      const { output } = await translateFormExplanationPrompt(input);
      if (output) return output;
    } catch (e) {
      console.warn('translateFormExplanationPrompt error, using fallback:', e);
    }

    return {
      translatedTitle: input.formTitle,
      translatedDepartment: input.issuingDepartment,
      translatedPurpose: input.purpose,
      translatedApplicationType: input.applicationType,
      translatedExplanation: input.explanation,
      translatedChecklist: input.checklist,
      translatedDocuments: input.requiredDocuments,
      translatedFields: input.formFields,
    };
  }
);
