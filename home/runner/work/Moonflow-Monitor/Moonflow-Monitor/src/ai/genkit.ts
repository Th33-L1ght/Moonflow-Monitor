
'use server';
/**
 * @fileoverview This file initializes the Genkit AI instance.
 * It is used by all flows to access Genkit functionality.
 */
import { configureGenkit, ai } from '@google-ai/genkit';
import { googleAI } from '@google-ai/genkit/googleai';
import { firebase } from '@google-cloud/genkit-firebase';

// Initialize Genkit with the Google AI plugin and Firebase plugin.
// The `firebase()` plugin is used to manage flow state and traces.
configureGenkit({
  plugins: [
    googleAI(),
    firebase(), // Manages flow state and traces
  ],
  // Log transactional events to the console and Firebase.
  logSinks: ['firebase'],
  // In development, write traces to a local file and Firebase.
  traceSinks: ['firebase'],
  // Define required APIs. This helps deployments ensure the APIs are enabled.
  requiredApis: ['cloudbuild.googleapis.com', 'artifactregistry.googleapis.com'],
});

// Export the AI instance for use in other files.
export {ai};
