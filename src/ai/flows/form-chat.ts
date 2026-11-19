/**
 * @fileOverview Genkit flow for the AI Form Chat Assistant.
 * Answers user questions grounded in the uploaded form context across 6 Indian regional languages.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SupportedLanguages } from './explain-government-form';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const FormChatInputSchema = z.object({
  question: z.string().describe('The user question about the uploaded government form.'),
  language: z.enum(SupportedLanguages).default('English').describe('The language for the response.'),
  formContext: z.object({
    formTitle: z.string(),
    issuingDepartment: z.string(),
    purpose: z.string(),
    applicationType: z.string(),
    explanation: z.string(),
    checklist: z.array(z.string()),
    requiredDocuments: z.array(
      z.object({
        name: z.string(),
        requirementType: z.string(),
        condition: z.string().optional(),
        reason: z.string(),
        acceptableProofs: z.array(z.string()).optional(),
      })
    ),
    formFields: z.array(
      z.object({
        key: z.string(),
        label: z.string(),
        simplifiedExplanation: z.string().optional(),
        required: z.boolean(),
        whereToFind: z.string().optional(),
      })
    ),
    officialPortal: z.string().optional(),
    officialHelpline: z.string().optional(),
    designatedOfficeGuidance: z.object({
      primaryOfficeName: z.string().optional(),
      counterName: z.string().optional(),
      alternativeOffices: z.array(z.string()).optional(),
      actionsAtOffice: z.array(z.string()).optional(),
      officialFees: z.string().optional(),
      appointmentAdvice: z.string().optional(),
      workingHours: z.string().optional(),
      helpline: z.string().optional(),
    }).optional(),
  }),
  history: z.array(ChatMessageSchema).optional(),
});
export type FormChatInput = z.infer<typeof FormChatInputSchema>;

const FormChatOutputSchema = z.object({
  answer: z.string().describe('Accurate, empathetic answer in the requested language, grounded in the form details and official Indian administrative norms.'),
  suggestedFollowUps: z.array(z.string()).optional().describe('2-3 quick follow-up questions the citizen might ask next.'),
});
export type FormChatOutput = z.infer<typeof FormChatOutputSchema>;

export async function askFormChat(input: FormChatInput): Promise<FormChatOutput> {
  return formChatFlow(input);
}

const formChatPrompt = ai.definePrompt({
  name: 'formChatPrompt',
  input: { schema: FormChatInputSchema },
  output: { schema: FormChatOutputSchema },
  prompt: `You are Sahaj AI, an empathetic, expert citizen paperwork assistant in India.
Your task is to answer a citizen's question about the specific government form they uploaded.

RULES:
1. Ground your answer in the form details provided below.
2. If the user asks whether a specific document is mandatory, check the requiredDocuments list and explain clearly if it is mandatory, optional, or conditional (and explain the condition).
3. If the answer cannot be determined strictly from the form itself, provide the official Indian government standard practice (e.g. UIDAI, Income Tax, State Revenue, Post Office rules), mention the official helpline/portal, and advise verifying at the counter.
4. Respond in {{{language}}}. Use polite, plain conversational language. Avoid jargon.
5. Provide 2-3 short, relevant follow-up questions in {{{language}}} under suggestedFollowUps.

FORM DETAILS:
- Title: {{{formContext.formTitle}}}
- Issuing Department: {{{formContext.issuingDepartment}}}
- Application Type: {{{formContext.applicationType}}}
- Purpose: {{{formContext.purpose}}}
- Official Portal: {{{formContext.officialPortal}}}
- Official Helpline: {{{formContext.officialHelpline}}}
{{#if formContext.designatedOfficeGuidance}}
- Designated Submission Office: {{{formContext.designatedOfficeGuidance.primaryOfficeName}}}
- Target Counter / Section: {{{formContext.designatedOfficeGuidance.counterName}}}
- Official Fees: {{{formContext.designatedOfficeGuidance.officialFees}}}
- Appointment Advice: {{{formContext.designatedOfficeGuidance.appointmentAdvice}}} (Timing: {{{formContext.designatedOfficeGuidance.workingHours}}})
{{/if}}

CHECKLIST STEPS:
{{#each formContext.checklist}}
- {{{this}}}
{{/each}}

REQUIRED DOCUMENTS & CONDITIONS:
{{#each formContext.requiredDocuments}}
- {{{this.name}}} [Type: {{{this.requirementType}}}]: {{{this.reason}}} {{#if this.condition}}(Condition: {{{this.condition}}}){{/if}}
{{/each}}

FORM FIELDS:
{{#each formContext.formFields}}
- {{{this.label}}} ({{{this.key}}}): {{{this.simplifiedExplanation}}} [Required: {{{this.required}}}]
{{/each}}

{{#if history}}
CONVERSATION HISTORY:
{{#each history}}
{{{this.role}}}: {{{this.content}}}
{{/each}}
{{/if}}

CITIZEN'S QUESTION:
{{{question}}}
`,
});

const formChatFlow = ai.defineFlow(
  {
    name: 'formChatFlow',
    inputSchema: FormChatInputSchema,
    outputSchema: FormChatOutputSchema,
  },
  async input => {
    const { output } = await formChatPrompt(input);
    if (!output) {
      throw new Error('AI could not generate a response.');
    }
    return output;
  }
);
