import React from 'react';

const STEPS = [
  {
    num: 1,
    title: 'Fill the form',
    desc: 'Enter your details and describe your issue clearly.',
  },
  {
    num: 2,
    title: 'Create your ticket',
    desc: 'Click "Create Ticket" — you get a unique ticket number instantly.',
  },
  {
    num: 3,
    title: 'Track & get help',
    desc: 'Check status anytime, reply to your agent, or browse the knowledgebase.',
  },
];

export default function TicketGuide3D() {
  return (
    <div className="guide3d box">
      <div className="guide3d-head">
        <span className="guide3d-badge">How it works</span>
        <h2>Create a ticket in 3 easy steps</h2>
      </div>

      <div className="guide3d-scene" aria-hidden="true">
        <span className="guide3d-orb o1" />
        <span className="guide3d-orb o2" />
        <span className="guide3d-orb o3" />
        <span className="guide3d-orb o4" />
        <span className="guide3d-orb o5" />
        <div className="guide3d-card3d">
          <div className="guide3d-hover3d">
            <div className="guide3d-sway">
              <div className="guide3d-face front">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zM13 7.5h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
                </svg>
                <strong>We&apos;re here to help</strong>
                <span>Fill the form to start</span>
              </div>
            </div>
          </div>
        </div>
        <span className="guide3d-shadow" />
        <span className="guide3d-hint">Hover the ticket</span>
      </div>

      <div className="guide3d-steps">
        {STEPS.map((s) => (
          <div className="guide3d-step" key={s.num}>
            <span className="guide3d-num">{s.num}</span>
            <div className="guide3d-step-body">
              <strong>{s.title}</strong>
              <span>{s.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
