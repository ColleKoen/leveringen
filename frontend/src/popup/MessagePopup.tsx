// frontend/src/popup/MessagePopup.tsx
//
// ============================================================
// HOE TE GEBRUIKEN
// ============================================================
//
// Importeren:
//
// import MessagePopup from '../popup/MessagePopup';
//
//
// ------------------------------------------------------------
// 1. JA / NEE popup
// ------------------------------------------------------------
//
// State:
//
// const [showMessage, setShowMessage] = useState(false);
//
// Openen:
//
// setShowMessage(true); Toewijzen aan een onClick={() => setShowMessage(true)}
//
// Popup:
//
// {showMessage && (
//   <MessagePopup
//     lines={[
//       'Deze bestelling openen in Arnout?'
//     ]}
//     confirmText="Ja"
//     cancelText="Nee"
//     onConfirm={() => {
//       setShowMessage(false);
//
//       // Actie bij Ja toevoegen.
//     }}
//     onCancel={() => setShowMessage(false)}
//   />
// )}
//
//
// ------------------------------------------------------------
// 2. DOORGAAN / ANNULEREN popup
// ------------------------------------------------------------
//
// {showMessage && (
//   <MessagePopup
//     lines={[
//       'Deze bestelling is nog niet volledig geleverd.',
//       'Wil je toch doorgaan?'
//     ]}
//     confirmText="Doorgaan"
//     cancelText="Annuleren"
//     onConfirm={() => {
//       setShowMessage(false);
//
//       // Actie bij Doorgaan toevoegen.
//     }}
//     onCancel={() => setShowMessage(false)}
//   />
// )}
//
//
// ------------------------------------------------------------
// 3. Alleen SLUITEN
// ------------------------------------------------------------
//
// {showMessage && (
//   <MessagePopup
//     lines={[
//       'De bestelling werd opgeslagen.',
//       'Alle gegevens zijn bijgewerkt.'
//     ]}
//     cancelText="Sluiten"
//     onCancel={() => setShowMessage(false)}
//   />
// )}
//
//
// ------------------------------------------------------------
// 4. Meerdere tekstlijnen
// ------------------------------------------------------------
//
// Elke string in "lines" wordt een aparte tekstlijn.
//
// lines={[
//   'Tekstlijn 1',
//   'Tekstlijn 2',
//   'Tekstlijn 3',
//   'Tekstlijn 4'
// ]}
//
//
// De popup past zijn hoogte automatisch aan het aantal regels aan.
// De breedte past zich aan de tekst aan tot de ingestelde
// maximum breedte in messagepopup.css.
//
// ============================================================


import '../css/messagepopup.css';

interface Props {
  lines: string[];

  confirmText?: string;
  cancelText?: string;

  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function MessagePopup({ lines, confirmText, cancelText, onConfirm, onCancel }: Props) {

  return (

    <div className="message-popup-overlay">

      <div className="message-popup">

        {/* Tekst */}
        <div className="message-popup-content">

          {lines.map((line, index) => (
            <div
              key={index}
              className="message-popup-line"
            >
              {line}
            </div>
          ))}

        </div>


        {/* Knoppen */}
        <div className="message-popup-actions">

          {confirmText && (
            <button
              type="button"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          )}

          {cancelText && (
            <button
              type="button"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}

        </div>

      </div>

    </div>

  );
}