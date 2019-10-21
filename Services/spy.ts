import * as Sentry from "@sentry/browser";


// Code to force typescript allow Intercom function
declare global {
    interface Window { Intercom: any; }
}

export class Spy {

    engine: 'NB' | 'NF' | 'NS';

    setEngine(engine: 'NB' | 'NF' | 'NS') {
        this.engine = engine;
    }

    startIntercom(user: any) {
        // We don't load intercom when local
        if (!window.Intercom) return;
        window.Intercom('boot', {
            app_id: 'sz0pojg8',
            name: user.name, // Full name
            email: user.email, // Email address
            user_id: user.id, // Email address
            // created_at: “<%= current_user.created_at.to_i %>” // Signup date as a Unix timestamp
        });
    }

    startSentry(sentryKey: string) {
        Sentry.init({
            dsn: sentryKey
        });
    }

    track(event: string, options?: Object) {
        if (this.engine) event = this.engine + ' ' + event;
        if (window.Intercom) window.Intercom('trackEvent', event, options);
    }
}