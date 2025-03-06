declare let process: {
  env: {
    NG_APP_FIREBASE_PROJECT_ID: string;
    NG_APP_FIREBASE_PRIVATE_KEY_ID: string;
    NG_APP_FIREBASE_PRIVATE_KEY: string;
    NG_APP_FIREBASE_CLIENT_EMAIL: string;
    NG_APP_FIREBASE_CLIENT_ID: string;
    NG_APP_FIREBASE_CLIENT_CERT_URL: string;
    NG_APP_FIREBASE_API_KEY: string;
    NG_APP_FIREBASE_AUTH_DOMAIN: string;
    NG_APP_FIREBASE_STORAGE_BUCKET: string;
    NG_APP_FIREBASE_MESSAGING_SENDER_ID: string;
    NG_APP_FIREBASE_MESSAGING_APP_ID: string;
    NG_APP_CHECKLYHQ_ID: string;
    NG_APP_CHECKLYHQ_TOKEN: string;
    NG_APP_CHECKLYHQ_ACCOUNT: string;
    NG_APP_OFD_AGGREGATOR_URL: string;
    NG_APP_OFD_AGGREGATOR_HOST: string;
    [key: string]: string;
  };
};

declare module 'process' {
  const process: unknown;
  export = process;
}
