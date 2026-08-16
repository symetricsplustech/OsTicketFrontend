import { useEffect, useState } from 'react';
import { customerEn } from '../lib/enterprise.js';

export default function CsatDialog({ ticketNumber, onClose }) {
  const [surveys, setSurveys] = useState([]);
  const [score, setScore] = useState(null);
  const [comment, setComment] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ticketNumber) return;
    customerEn.surveysForTicket(ticketNumber)
      .then((d) => setSurveys(d.items || []))
      .catch((e) => setError(e.message));
  }, [ticketNumber]);

  if (!ticketNumber || surveys.length === 0) return null;

  const submit = async () => {
    try {
      await customerEn.submitCsat({ surveyId: surveys[0]._id, ticketNumber, rating: score, comment });
      setSaved(true);
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{saved ? 'Thank You!' : 'How did we do?'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert error">{error}</div>}
          {saved ? (
            <p>Your feedback on ticket #{ticketNumber} has been recorded. We appreciate it!</p>
          ) : (
            <>
              <p><b>{surveys[0].question || `How satisfied were you with the resolution of ticket #${ticketNumber}?`}</b></p>
              <div className="form-row" style={{ justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} className="stat-card" style={{ cursor: 'pointer', borderColor: score === n ? 'var(--blue)' : undefined, width: 64, padding: 10 }}
                    onClick={() => setScore(n)}>
                    <div className="num" style={{ fontSize: 22 }}>{n}</div>
                  </button>
                ))}
              </div>
              <div className="field mt-10">
                <textarea rows={3} placeholder="Any additional comments? (optional)" value={comment}
                  onChange={(e) => setComment(e.target.value)} />
              </div>
            </>
          )}
        </div>
        {!saved && (
          <div className="modal-footer">
            <button className="btn" onClick={submit} disabled={score == null}>Submit Rating</button>
          </div>
        )}
      </div>
    </div>
  );
}