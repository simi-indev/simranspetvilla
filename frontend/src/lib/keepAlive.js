// keepAlive.js — pings Railway backend every 5 minutes to prevent cold starts
const BACKEND_URL = 'https://simranspetvilla-production.up.railway.app';

const ping = async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`);
    console.log('[KeepAlive]', new Date().toISOString(), 'Status:', res.status);
  } catch (err) {
    console.error('[KeepAlive] Failed:', err.message);
  }
};

ping();
setInterval(ping, 5 * 60 * 1000);

export default ping;
