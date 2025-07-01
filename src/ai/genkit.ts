import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const googleApiKey = process.env.GOOGLE_API_KEY;

const plugins = [];
if (googleApiKey && !googleApiKey.startsWith('YOUR_')) {
  plugins.push(googleAI({apiKey: googleApiKey}));
} else {
  console.warn(
    'Google API Key is not configured. AI features will be disabled.'
  );
}

export const ai = genkit({
  plugins,
  ...(plugins.length > 0 && {model: 'googleai/gemini-2.0-flash'}),
});
