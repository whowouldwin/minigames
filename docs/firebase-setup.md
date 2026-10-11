# Firebase setup

1. Create a Firebase project and register a Web app in the [Firebase Console](https://console.firebase.google.com/).
2. In **Authentication → Sign-in method**, enable **Email/Password** and save the change.
3. Copy the web app configuration values into `.env.local` using [.env.example](../.env.example) as a template.

The Firebase client config is read by [src/firebase](../src/firebase/index.ts). The SDK initializes when all required values are present. Keep `.env.local` out of commits; it is ignored by Git.

See the official [Firebase web setup guide](https://firebase.google.com/docs/web/setup) and [password authentication guide](https://firebase.google.com/docs/auth/web/password-auth) for details.
