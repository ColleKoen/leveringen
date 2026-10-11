// frontend/src/pages/LoginPage.tsx

import { useState } from 'react';
import { API_URL } from '../config';

import '../css/loginpage.css';

interface Props {
  onLogin: () => void;
}

// Loginpagina component.
export default function LoginPage({ onLogin }: Props) {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login afhandelen.
  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {

    event.preventDefault();

    setLoading(true);
    setError('');

    try {

      // FileMaker login request naar de server sturen.
      const response = await fetch(`${API_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || 'Aanmelden mislukt');
        return;
      }

      // Eigen sessie-ID bewaren.
      localStorage.setItem('sessionId', data.sessionId);

      // Aan App melden dat de login gelukt is.
      onLogin();

    }
    catch (err) {

      console.error('Login fout:', err);
      setError('Kan geen verbinding maken met de server');

    }
    finally {

      setLoading(false);

    }
  }

  // Render de loginpagina.
  return (
    <div className="login-page">

      <form className="login-form" onSubmit={handleLogin}>

        <div className="login-header">
          <img src="/img/alter-expo.png" alt="Alter Expo" className="login-logo" />

          <div className="login-subtitle">
            {"LEVERINGEN MAGAZIJN".split("").map((letter, index) => (
              <span key={index}>
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </div>
        </div>

        <input
          type="text"
          placeholder="Gebruikersnaam"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
        />

        <div className="login-password">

          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Wachtwoord"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />

          <button
            type="button"
            className="login-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            <img src={showPassword ? '/img/eye-close.svg' : '/img/eye-open.svg'} alt="" />
          </button>

        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Aanmelden...' : 'Aanmelden'}
        </button>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

      </form>

    </div>
  );
}