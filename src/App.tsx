import { HashRouter, Routes, Route } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { CatalogProvider } from './lib/CatalogContext';
import LayoutContent from './components/LayoutContent';
import Home from './pages/Home';
import Connexion from './pages/Connexion';
import Devis from './pages/Devis';
import Catalogue from './pages/Catalogue';
import Marche from './pages/Marche';
import Settings from './pages/Settings';
import LogistiqueIndex from './pages/logistique/Index';

export default function App() {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN || '';
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || '';

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin + import.meta.env.BASE_URL,
      }}
    >
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
            </Routes>
          </LayoutContent>
        </HashRouter>
      </CatalogProvider>
    </Auth0Provider>
  );
}
