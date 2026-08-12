import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div>© {new Date().getFullYear()} My Support Center — All rights reserved.</div>
      <div className="powered">Powered by <strong>SymetricsIt</strong> — Open Source Support Ticket System</div>
    </footer>
  );
}
