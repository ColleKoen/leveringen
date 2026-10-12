// frontend/src/popup/BestellingPopup.tsx

import '../css/bestellingpopup.css';
import { API_URL } from '../config';
import { useEffect, useRef, useState } from 'react';

import type { Bestellijst, Bestellijn } from '../types/frontend.types';

interface Props {
  bestelling: Bestellijst;
  onClose: () => void;
  onApplied: (recordId: string, volledigGeleverd: boolean) => void;
}

export default function BestellingPopup({ bestelling, onClose, onApplied }: Props) {

  // Popup positie en verslepen.
  const [position, setPosition] = useState({ x: 120, y: 120 });
  const [dragging, setDragging] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const offset = useRef({ x: 0, y: 0 });

  // Verslepen starten.
  function handleMouseDown(e: React.MouseEvent) {
    setDragging(true);
    offset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  }

  // Popup verslepen.
  function handleMouseMove(e: MouseEvent) {
    if (!dragging || !popupRef.current) return;
    const rect = popupRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - offset.current.x, window.innerWidth - rect.width));
    const y = Math.max(0, Math.min(e.clientY - offset.current.y, window.innerHeight - rect.height));
    setPosition({ x, y });
  }

  // Verslepen stoppen.
  function handleMouseUp() { setDragging(false); }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

  }, [dragging]);

  // Bestellijnen.
  const [volledigGeleverd, setVolledigGeleverd] = useState(bestelling.volledigGeleverd);
  const [bestellijnen, setBestellijnen] = useState<Bestellijn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Bestellijnen ophalen.
  useEffect(() => {

    async function loadBestellijnen() {

      try {

        setLoading(true);
        setError('');

        const sessionId = localStorage.getItem('sessionId');
        const response = await fetch(`${API_URL}/api/bestellijn?bestelLijnenId=${encodeURIComponent(bestelling.bestelLijnenId)}`, { method: 'GET', headers: { Authorization: `Bearer ${sessionId}` } });


        if (!response.ok) throw new Error('Bestellijnen konden niet worden opgehaald.');
        const data = await response.json();

        setBestellijnen(data.bestellijnen || []);
      }
      catch (err) {
        console.error('Bestellijnen fout:', err);
        setError('Bestellijnen konden niet worden opgehaald.');
      }
      finally {
        setLoading(false);
      }
    }

    loadBestellijnen();

  }, [bestelling.bestelLijnenId]);

  // Volledig geleverd aan- of uitvinken.
  function handleVolledigGeleverd(checked: boolean) {
    setVolledigGeleverd(checked);
    setBestellijnen((current) => current.map((bestellijn) => ({ ...bestellijn, geleverd: checked })));
  }

  // Eén bestellijn aan- of uitvinken.
  function handleBestellijnGeleverd(recordId: string, checked: boolean) {
    setBestellijnen((current) => {
      const updated = current.map((bestellijn) => bestellijn.recordId === recordId ? { ...bestellijn, geleverd: checked } : bestellijn);

      // Volledig geleverd is alleen actief wanneer alle bestellijnen geleverd zijn.
      setVolledigGeleverd(updated.length > 0 && updated.every((bestellijn) => bestellijn.geleverd));
      return updated;
    });
  }

  // Bestelling aanpassen naar de server sturen.
  async function handleApply() {

    try {

      setLoading(true);
      setError('');

      const sessionId = localStorage.getItem('sessionId');

      const payload = {
        bestellingRecordId: bestelling.recordId, volledigGeleverd,
        bestellijnen: bestellijnen.map((bestellijn) => ({ recordId: bestellijn.recordId, geleverd: bestellijn.geleverd }))
      };

      const response = await fetch(`${API_URL}/api/update`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionId}` }, body: JSON.stringify(payload) });

      if (!response.ok) {
        const data = await response.json();
        console.error('Apply update response:', data);
        throw new Error(data.error || 'Bestelling kon niet worden aangepast.');
      }

      onApplied(bestelling.recordId, volledigGeleverd);
      onClose();
    }
    catch (err) {
      console.error('Bestelling aanpassen fout:', err);
      setError(err instanceof Error ? err.message : 'Bestelling kon niet worden aangepast.');
    }
    finally {
      setLoading(false);
    }
  }

  // Render de popup.
  return (
    <div className="bestelling-popup-overlay">

      {!loading && (
        <div ref={popupRef} className="bestelling-popup" style={{ left: position.x, top: position.y }}>

          {/* Titelbalk */}
          <div className="bestelling-popup-header" onMouseDown={handleMouseDown}>
            <div className="bestelling-popup-title">Leveringen magazijn</div>
            <button type="button" className="bestelling-popup-close" onMouseDown={(e) => e.stopPropagation()} onClick={onClose}>✕</button>
          </div>

          {/* Inhoud */}
          <div className="bestelling-popup-content">

            {/* Dossier */}
            <div className="bestelling-popup-dossier">
              {bestelling.dossiernaam}
            </div>

            {/* Bestelling informatie */}
            <div className="bestelling-popup-info">

              {/* Rij 1 */}
              <div className="bestelling-popup-info-label">Bestelbon : </div>
              <div className="bestelling-popup-info-value">{bestelling.bestelNummerId}</div>

              <div className="bestelling-popup-info-label">Besteld door : </div>
              <div className="bestelling-popup-info-value">{bestelling.besteldDoor}</div>

              {/* Rij 2 */}
              <div className="bestelling-popup-info-label">Leverancier : </div>
              <div className="bestelling-popup-info-value">{bestelling.leverancier}</div>

              <div></div>
              <div></div>

            </div>

            {/* Volledig geleverd */}
            <div className="bestelling-popup-volledig">

              <div className="bestelling-popup-volledig-label">volledig geleverd</div>

              <div className="bestelling-popup-volledig-checkbox">
                <input
                  type="checkbox"
                  checked={volledigGeleverd}
                  onChange={(e) => handleVolledigGeleverd(e.target.checked)}
                />
              </div>

            </div>

            {/* Bestellijnen */}

            {error && (<div className="bestelling-popup-message"> {error} </div>)}

            {!loading && !error && (

              <div className="bestelling-popup-table-wrapper">

                <table className="bestelling-popup-table">

                  <colgroup>
                    <col />
                    <col style={{ width: '70px' }} />
                    <col style={{ width: '70px' }} />
                  </colgroup>

                  <thead>
                    <tr>
                      <th>omschrijving</th>
                      <th>aantal</th>
                      <th>geleverd</th>
                    </tr>
                  </thead>

                  <tbody>

                    {bestellijnen.map((bestellijn) => (

                      <tr key={bestellijn.recordId}>
                        <td>{bestellijn.omschrijving}</td>
                        <td className="bestelling-popup-aantal">{bestellijn.aantal}</td>
                        <td className="bestelling-popup-geleverd">
                          <input
                            type="checkbox"
                            checked={bestellijn.geleverd}
                            onChange={(e) => handleBestellijnGeleverd(bestellijn.recordId, e.target.checked)}
                          />
                        </td>
                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

            {/* Onderste rij */}
            {!loading && !error && (
              <div className="bestelling-popup-footer">
                <div className="bestelling-popup-id">{bestelling.bestelLijnenId}</div>
                <div className="bestelling-popup-actions">
                  <button type="button" onClick={handleApply}>Toepassen</button>
                  <button type="button" onClick={onClose}>Annuleren</button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}