// Local stub — in production this import is replaced by @cloudflare/next-on-pages build tool
function getRequestContext() {
  throw new Error('Not in Cloudflare runtime');
}

module.exports = { getRequestContext };
