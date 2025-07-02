'use client';

// Firebase Analytics has been temporarily disabled to prevent issues with ad-blockers.
// import { analytics } from './firebase/client';
// import { logEvent } from 'firebase/analytics';

interface ErrorContext {
    location: string;
    [key: string]: any;
}

export const logError = (error: any, context: ErrorContext) => {
    console.error(`[Error in ${context.location}]:`, error, 'Context:', context);

    // The analytics logging was disabled to prevent browser ad-blockers from
    // showing a `net::ERR_BLOCKED_BY_CLIENT` error in the console, which
    // can be confusing during development. To re-enable, uncomment the imports
    // above and the code block below.
    /*
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
    */
};
