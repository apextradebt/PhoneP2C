import { HashRouter, Routes, Route } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { CatalogProvider } from './lib/CatalogContext';
import { ThemeProvider } from './lib/ThemeProvider';
import { UserProvider } from './lib/UserContext';
import { NotificationProvider } from './lib/NotificationContext';
import LayoutContent from './components/LayoutContent';
import Home from './pages/Home';
import Connexion from './pages/Connexion';
import Devis from './pages/Devis';
import Catalogue from './pages/Catalogue';
import Marche from './pages/Marche';
import Settings from './pages/Settings';
import LogistiqueIndex from './pages/logistique/Index';
import Users from './pages/Users';

export default function App() {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN || '';
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || '';

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin + import.meta.env.BASE_URL,
        audience: import.meta.env.VITE_AUTH0_IDENTIFIER,
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <UserProvider>
        <NotificationProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <CatalogProvider>
              <HashRouter>
                <LayoutContent>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/connexion" element={<Connexion />} />
                    <Route path="/devis" element={<Devis />} />
                    <Route path="/catalogue" element={<Catalogue />} />
                    <Route path="/marche" element={<Marche />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/logistique" element={<LogistiqueIndex />} />
                    <Route path="/users" element={<Users />} />
                  </Routes>
                </LayoutContent>
              </HashRouter>
            </CatalogProvider>
          </ThemeProvider>
        </NotificationProvider>
      </UserProvider>
    </Auth0Provider>
  );
}

