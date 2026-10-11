// frontend/src/App.tsx

import {
  useEffect,
  useState
} from 'react';

import { API_URL } from './config';

import LoginPage from './pages/LoginPage';
import BestellijstPage from './pages/BestellijstPage';


function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);


  useEffect(() => {

    async function checkSession() {

      const sessionId =
        localStorage.getItem('sessionId');

      // Geen sessie aanwezig.
      if (!sessionId) {
        setLoggedIn(false);
        setCheckingSession(false);
        return;
      }

      try {

        const response = await fetch(
          `${API_URL}/api/session`,
          {
            method: 'GET',

            headers: {
              Authorization: `Bearer ${sessionId}`
            }
          }
        );

        // Sessie bestaat niet meer.
        if (!response.ok) {

          localStorage.removeItem(
            'sessionId'
          );

          setLoggedIn(false);
          return;
        }

        // Sessie is geldig.
        setLoggedIn(true);

      }
      catch (err) {

        console.error(
          'Sessiecontrole fout:',
          err
        );

        setLoggedIn(false);

      }
      finally {

        setCheckingSession(false);

      }
    }


    checkSession();

  }, []);


  // Eerst sessie controleren.
  if (checkingSession) {
    return null;
  }


  // Niet ingelogd.
  if (!loggedIn) {
    return (
      <LoginPage
        onLogin={() => setLoggedIn(true)}
      />
    );
  }


  // Ingelogd.
  return (
    <BestellijstPage
      onLogout={() => setLoggedIn(false)}
    />
  );
}


export default App;