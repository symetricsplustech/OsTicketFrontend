import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/index.js';

export default function Home() {
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({ open: 0, closed: 0 });

  useEffect(() => {
    api.get('/kb/announcements').then(({ data }) => setAnnouncements(data.items)).catch(() => {});
    api.get('/tickets/open-form').then(({ data }) => setStats(data.settings || {})).catch(() => {});
  }, []);

  return (
    <>
      <div className="box">
        <div className="box-header"><h1>Welcome to the Support Center</h1></div>
        <p>
          Need help? Our support team is here for you. You can <Link to="/open"><strong>open a new ticket</strong></Link> with
          a few clicks, or browse the <Link to="/kb"><strong>knowledgebase</strong></Link> for instant answers.
        </p>
        <div className="stat-cards">
          <div className="stat-card"><div className="num">24/7</div><div className="lbl">Support</div></div>
          <div className="stat-card"><div className="num">KB</div><div className="lbl">Self-Service</div></div>
          <div className="stat-card"><div className="num">SLA</div><div className="lbl">Guaranteed Response</div></div>
          <div className="stat-card"><div className="num">Team</div><div className="lbl">Dedicated Agents</div></div>
        </div>
        <div className="buttons">
          <Link className="btn" to="/open">Open New Ticket</Link>
          <Link className="btn secondary" to="/status">Check Ticket Status</Link>
        </div>
      </div>

      {announcements.length > 0 && (
        <div className="box">
          <div className="box-header"><h1>Announcements</h1></div>
          {announcements.map((a) => (
            <div className="announcement" key={a._id}>
              <h3>{a.title}</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{a.body}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
