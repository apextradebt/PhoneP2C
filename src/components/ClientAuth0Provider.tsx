"use client";

import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';

export default function ClientAuth0Provider({ children }: { children: React.ReactNode }) {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || '';
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || '';

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
      }}
    >
      {children}
    </Auth0Provider>
  );
}
