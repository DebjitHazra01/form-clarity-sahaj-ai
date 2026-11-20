# Sahaj AI

> Upload a government form. Get a plain-language explanation, a submission checklist, and audio narration — in your language.

**🌐 Live demo:** https://www.indra-dev.xyz
**🎥 Video walkthrough:** *(link coming soon)*

![Sahaj AI demo](docs/screenshot.png)

Sahaj AI demystifies complex government forms. Upload a document (PDF, JPG, or PNG) and the app's AI pipeline explains what the form is asking, turns the requirements into a step-by-step checklist, translates everything into your language, and reads it aloud.

## Features

- **Document Analysis** — Upload government forms as PDF, JPG, or PNG (up to 10 MB).
- **Simplified Explanations** — Clear, jargon-free explanations of the form's purpose and requirements.
- **Actionable Checklists** — A generated step-by-step checklist so nothing gets missed at submission.
- **Multi-Language Support** — English, Hindi, Bengali, Marathi, Gujarati, and Tamil.
- **Voice Narration** — Listen to the explanation in your selected language with AI text-to-speech.

## How It Works

Every upload runs through a five-stage pipeline:

1. **Ingest** — The document is uploaded and parsed (PDF, JPG, PNG).
2. **Explain** — The `explainGovernmentForm` flow produces a simplified explanation plus a submission checklist.
3. **Check** — Requirements are turned into an actionable checklist the user can work through.
4. **Translate** — The `translateFormExplanation` flow renders the explanation and checklist in the user's language.
5. **Narrate** — The `textToSpeech` flow converts the explanation to natural-sounding audio.

Flow implementations live in [`src/ai/flows/`](src/ai/flows/).

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 15 (App Router)
- **UI:** [React](https://react.dev/) 19, [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **AI:** [Firebase Genkit](https://firebase.google.com/docs/genkit) with Google Gemini models
- **Auth & Data:** Firebase (Auth, Firestore)
- **Deployment:** [Vercel](https://vercel.com)

## Getting Started

### Prerequisites

Node.js v18+ and npm (or yarn).

### Installation

```bash
git clone https://github.com/Indra-dev404/form-clarity-sahaj-ai.git
cd form-clarity-sahaj-ai
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=<your-key>
```

Get a key from [Google AI Studio](https://aistudio.google.com/app/apikey). Firebase config uses placeholder values in `src/firebase/config.ts` — add your own project credentials to run auth/firestore locally.

### Running the App

```bash
# Terminal 1 — Genkit developer UI (optional, for debugging AI flows)
npm run genkit:watch   # http://localhost:4000

# Terminal 2 — Next.js dev server
npm run dev            # http://localhost:9002
```

## Roadmap

- No-login demo mode with preloaded sample documents.
- Health-benefit form focus: guided help for scheme enrollment and claim paperwork.
- Page-level source citations on every explanation.

## Limitations

- Sahaj AI **explains and prepares** — it does not determine eligibility, provide legal advice, or submit forms on anyone's behalf.
- Explanations are AI-generated: always verify critical details against the issuing authority's official guidance.
- Translation and narration quality varies by language; core flows are tested most heavily in English and Hindi.

## Contributing

Issues and pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

## License

[MIT](LICENSE)
