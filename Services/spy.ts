import * as Sentry from "@sentry/browser";

// Code to force typescript allow Intercom function
declare global {
  interface Window { Intercom: any; }
}
window.Intercom = window.Intercom || {};

interface user {
  name: string;
  email: string;
  _id: string;
};

export class Spy {

  startIntercom (user:user) {
    window.Intercom('boot', {
      app_id: 'sz0pojg8',
      name: user.name, // Full name
      email: user.email, // Email address
      user_id: user._id, // Email address
      // created_at: “<%= current_user.created_at.to_i %>” // Signup date as a Unix timestamp
    });
  }

  startSentry (sentryKey:string) {
    Sentry.init({
      dsn: sentryKey
    });
  }

  track (event:string, options?:Object) {
    window.Intercom('trackEvent', event, options);
  }

}