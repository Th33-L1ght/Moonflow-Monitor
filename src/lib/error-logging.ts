'use client';

import { analytics } from './firebase/client';
import { logEvent } from 'firebase/analytics';

interface ErrorContext {
    location: string;
    [key: string]: any;
}

export const logError = (error: any, context: ErrorContext) => {
    console.error(`[Error in ${context.location}]:`, error, 'Context:', context);

    if (analytics) {
        try {
            logEvent(analytics, 'app_error', {
                error_location: context.location,
                error_message: error.message || 'Unknown error',
                error_code: error.code || 'N/A',
                ...context
            });
        } catch (analyticsError) {
            console.error("Failed to log error to Analytics:", analyticsError);
        }
    }
};
