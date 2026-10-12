// frontend/src/pages/BestellijstPage.tsx

import '../css/bestellijstpage.css';

import BestellingPopup from '../popup/BestellingPopup';

import { API_URL } from '../config';
import { useEffect, useRef, useState } from 'react';
import { parseFMDate, formatDate } from '../utils/date.utils';
import { getBestellingStatus } from '../utils/bestellijst.utils';

import type { Bestellijst } from '../types/frontend.types';

interface Props {
  onLogout: () => void;
}

export default function BestellijstPage({ onLogout }: Props) {

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dossierFilter, setDossierFilter] = useState('');
  const [leverancierFilter, setLeverancierFilter] = useState('');
  const [besteldDoorFilter, setBesteldDoorFilter] = useState('');
  const [bestellingen, setBestellingen] = useState<Bestellijst[]>([]);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [confirmBestelbon, setConfirmBestelbon] = useState<string | null>(null);
  const [selectedBestelling, setSelectedBestelling] = useState<Bestellijst | null>(null);

  // Laad de bestellingen bij het laden van de pagina.
  useEffect(() => {

    async function loadBestellingen() {

      try {

        setLoading(true);
        setError('');

        // Haal de sessionId op uit localStorage.
        const sessionId = localStorage.getItem('sessionId');
        // Haal de bestellijst op van de server.
        const response = await fetch(`${API_URL}/api/bestellijst`, { method: 'GET', headers: { Authorization: `Bearer ${sessionId}` } });

        if (!response.ok) throw new Error('Bestellijst kon niet worden opgehaald.');

        const data = await response.json();

        // Sorteer de bestellingen op leveringsdatum (nieuwste eerst).
        const sortedBestellingen: Bestellijst[] =
          (data.bestellingen || []).sort(
            (a: Bestellijst, b: Bestellijst) =>
              parseFMDate(b.leveringsdatum).getTime() -
              parseFMDate(a.leveringsdatum).getTime()
          );

        setBestellingen(sortedBestellingen);
      }
      catch (err) {
        console.error('Bestellijst fout:', err);
        setError('Bestellijst kon niet worden opgehaald.');
      }
      finally {
        setLoading(false);
      }
    }

    loadBestellingen();

  }, []);

  if (error) return (<div className="bestellijst-page">{error}</div>);

  // Afmelden van de gebruiker.
  async function handleLogout() {

    const sessionId = localStorage.getItem('sessionId');

    try {
      if (sessionId) await fetch(`${API_URL}/api/logout`, { method: 'POST', headers: { Authorization: `Bearer ${sessionId}` } });
    }
    catch (err) {
      console.error('Logout fout:', err);
    }
    finally {
      localStorage.removeItem('sessionId');
      onLogout();
    }
  }

  // Klik op de status van een bestelling.
  function handleStatusClick(bestelling: Bestellijst) {

    // Eventuele vorige click-timer verwijderen.
    if (clickTimer.current) clearTimeout(clickTimer.current);

    clickTimer.current = setTimeout(() => {
      setSelectedBestelling(bestelling);
      clickTimer.current = null;
    }, 300);
  }

  // Dubbele klik op de status van een bestelling.
  function handleStatusDoubleClick(bestelling: Bestellijst) {

    // Enkele klik annuleren.
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }

    // Bevestigingspopup openen.
    setConfirmBestelbon(bestelling.bestelNummerId);
  }

  // Update de status tekst van de button na een succesvolle aanpassing.
  function handleBestellingApplied(recordId: string, volledigGeleverd: boolean) {
    setBestellingen((current) =>
      current.map((bestelling) => bestelling.recordId === recordId ? { ...bestelling, volledigGeleverd } : bestelling)
    );
  }

  // Filter de bestellingen op basis van de zoekcriteria.
  const filteredBestellingen = bestellingen.filter((bestelling) => {

    const dossierMatch = bestelling.dossiernaam.toLowerCase().includes(dossierFilter.toLowerCase());
    const leverancierMatch = bestelling.leverancier.toLowerCase().includes(leverancierFilter.toLowerCase());
    const statusMatch = !statusFilter || getBestellingStatus(bestelling) === statusFilter;
    const besteldDoorMatch = bestelling.besteldDoor.toLowerCase().includes(besteldDoorFilter.toLowerCase());

    return (dossierMatch && leverancierMatch && statusMatch && besteldDoorMatch);
  });

  // Render the component.
  return (
    <div className="bestellijst-page">

      <div className="bestellijst-header">

        {/* Rij 1 */}
        <div className="bestellijst-header-row1">

          <div className="bestellijst-header-logo">
            <img src="/img/alter-expo.png" alt="Alter Expo" />
          </div>

          <div></div>

          <div></div>

          <div></div>

          <div className="bestellijst-header-actions">

            <button title="vernieuwen" disabled={loading} onClick={() => window.location.reload()}>
              <img src="/img/refresh-24.png" alt="" />
            </button>

            <button title="afmelden" disabled={loading} onClick={handleLogout}>
              <img src="/img/logout-24.png" alt="" />
            </button>

          </div>

        </div>


        {/* Rij 2 */}
        <div className="bestellijst-header-row2">

          <div className="bestellijst-filter">
            <input
              type="text"
              placeholder="dossiernaam zoeken"
              value={dossierFilter}
              onChange={(e) => setDossierFilter(e.target.value)}
            />
          </div>

          <div className="bestellijst-filter">
            <input
              type="text"
              placeholder="leverancier zoeken"
              value={leverancierFilter}
              onChange={(e) => setLeverancierFilter(e.target.value)}
            />
          </div>

          <div className="bestellijst-status-filter">

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value=""></option>
              <option value="besteld">besteld</option>
              <option value="geleverd">geleverd</option>
              <option value="te laat">te laat</option>
              <option value="vandaag">vandaag</option>
            </select>

          </div>

          <div>Levering</div>

          <div className="bestellijst-filter">
            <input
              type="text"
              placeholder="besteld door zoeken"
              value={besteldDoorFilter}
              onChange={(e) => setBesteldDoorFilter(e.target.value)}
            />
          </div>

        </div>

      </div>

      { /* TABEL */}
      <table className="bestellijst-table">

        <colgroup>
          <col style={{ width: '39%' }} />
          <col style={{ width: '22%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '18%' }} />
        </colgroup>

        <thead>
          <tr>
            <th>Dossier</th>
            <th>Leverancier</th>
            <th>Status</th>
            <th>datum</th>
            <th>Besteld door</th>
          </tr>
        </thead>

        <tbody>

          {filteredBestellingen.map((bestelling) => {

            const status = getBestellingStatus(bestelling);

            return (

              <tr key={bestelling.recordId}>

                <td>{bestelling.dossiernaam}</td>

                <td>{bestelling.leverancier}</td>

                <td>
                  <button
                    type="button"
                    className={`bestellijst-status-button bestellijst-status-${status.replace(' ', '-')}`}
                    onClick={() => handleStatusClick(bestelling)}
                    onDoubleClick={() => handleStatusDoubleClick(bestelling)}
                  >
                    {status}
                  </button>
                </td>

                <td>{formatDate(parseFMDate(bestelling.leveringsdatum))}</td>

                <td>{bestelling.besteldDoor}</td>

              </tr>

            );

          })}

        </tbody>

      </table>

      {/* BESTELLING POPUP */}
      {selectedBestelling && (
        <BestellingPopup
          bestelling={selectedBestelling}
          onApplied={handleBestellingApplied}
          onClose={() => setSelectedBestelling(null)}
        />
      )}

      {/* BESTELBON OPENEN IN ARNOUT */}
      {confirmBestelbon && (
        <div className="confirm-overlay">

          <div className="confirm-box">

            <div className="confirm-title">Deze bestelling openen in Arnout?</div>

            <div className="confirm-actions">

              <button
                onClick={() => {
                  const url = `fmp://fms.alterexpo.be/Arnout.fmp12?script=Web.003_Open_bestelbon&$bestelID=${encodeURIComponent(confirmBestelbon)}`;
                  window.location.href = url;
                  setConfirmBestelbon(null);
                }}
              >
                Ja
              </button>

              <button onClick={() => setConfirmBestelbon(null)}>Nee</button>

            </div>

          </div>

        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="bestellijst-loading-overlay">
          <img src="/img/ae_large.gif" alt="loading..." />
        </div>
      )}

    </div>
  );
}