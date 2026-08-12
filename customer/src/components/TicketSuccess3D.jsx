import React from 'react';

export default function TicketSuccess3D() {
  return (
    <div className="g3d-success" aria-hidden="true">
      <span className="g3d-success-ring" />
      <span className="g3d-confetti c1" />
      <span className="g3d-confetti c2" />
      <span className="g3d-confetti c3" />
      <span className="g3d-confetti c4" />
      <span className="g3d-confetti c5" />
      <span className="g3d-confetti c6" />
      <div className="g3d-success-card">
        <div className="g3d-success-inner">
          <div className="guide3d-sway">
            <div className="g3d-success-face">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <strong>Ticket created!</strong>
              <span>Track it anytime</span>
            </div>
          </div>
        </div>
      </div>
      <span className="guide3d-shadow" />
    </div>
  );
}
