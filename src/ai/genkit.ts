import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';

// This enables sending telemetry to Google Cloud Trace and other services.
// See https://firebase.google.com/docs/genkit/observability for more details.
enableFirebaseTelemetry();

// This initializes Genkit with the Google AI plugin, which is necessary for the AI features to work.
// It will automatically use the GOOGLE_GENAI_API_KEY from your environment variables.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});