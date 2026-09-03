import { HashRouter, Routes, Route } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import LayoutContent from './components/LayoutContent';
import Home from './pages/Home';
import Connexion from './pages/Connexion';
import Devis from './pages/Devis';
import Catalogue from './pages/Catalogue';
import Marche from './pages/Marche';
import Settings from './pages/Settings';
import LogistiqueIndex from './pages/logistique/Index';
import LogistiqueCommandes from './pages/logistique/Commandes';
import LogistiqueNotifications from './pages/logistique/Notifications';

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
            <Route path="/logistique/commandes" element={<LogistiqueCommandes />} />
            <Route path="/logistique/notifications" element={<LogistiqueNotifications />} />
          </Routes>
        </LayoutContent>
      </HashRouter>
    </Auth0Provider>
  );
}
