const BACKEND_URL = 'https://simranspetvilla-production.up.railway.app';
const ping = async () => {
  try {
    await fetch(`${BACKEND_URL}/api/health`);
  } catch (err) {}
};
// Wait 30s after page load before first ping
setTimeout(ping, 30000);
setInterval(ping, 5 * 60 * 1000);
