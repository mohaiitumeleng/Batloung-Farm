const crypto = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(crypto.scrypt);
const attempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const TOKEN_MS = 4 * 60 * 60 * 1000;

function configured() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD_HASH && process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32);
}
function sign(payload) {
  return crypto.createHmac('sha256', process.env.AUTH_SECRET).update(payload).digest('base64url');
}
function createToken(username) {
  const payload = Buffer.from(JSON.stringify({sub:username,exp:Date.now()+TOKEN_MS})).toString('base64url');
  return payload + '.' + sign(payload);
}
function verifyToken(token) {
  if (!configured() || !token || typeof token !== 'string') return false;
  const pieces = token.split('.');
  if (pieces.length !== 2 || !pieces[0] || !pieces[1]) return false;
  const actual = Buffer.from(pieces[1]);
  const expected = Buffer.from(sign(pieces[0]));
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual,expected)) return false;
  try {
    const data = JSON.parse(Buffer.from(pieces[0],'base64url').toString('utf8'));
    return data.sub === process.env.ADMIN_USERNAME && Number.isFinite(data.exp) && data.exp > Date.now();
  } catch { return false; }
}
async function authenticate(username,password) {
  if (!configured()) return false;
  if (username !== process.env.ADMIN_USERNAME || typeof password !== 'string') return false;
  const [salt,hash] = process.env.ADMIN_PASSWORD_HASH.split(':');
  if (!salt || !hash) return false;
  try {
    const derived = await scrypt(password,salt,64);
    const expected = Buffer.from(hash,'hex');
    return derived.length === expected.length && crypto.timingSafeEqual(derived,expected);
  } catch { return false; }
}
function login(req,res,next) {
  if (!configured()) return res.status(503).json({error:'Administrator account not configured. Run npm run setup-admin inside backend.'});
  const ip = req.ip || req.socket.remoteAddress || 'local';
  const now = Date.now();
  let state = attempts.get(ip);
  if (!state || now - state.since > WINDOW_MS) state = {since:now,count:0};
  if (state.count >= MAX_ATTEMPTS) return res.status(429).json({error:'Too many login attempts. Try again in 15 minutes.'});
  const {username,password} = req.body || {};
  authenticate(username,password).then(ok=>{
    if (!ok) {
      state.count++;
      attempts.set(ip,state);
      return res.status(401).json({error:'Invalid username or password.'});
    }
    attempts.delete(ip);
    res.json({token:createToken(username),username,expires_in_seconds:TOKEN_MS/1000});
  }).catch(next);
}
function requireAuth(req,res,next) {
  if (!configured()) return res.status(503).json({error:'Administrator account not configured. Run npm run setup-admin inside backend.'});
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ') || !verifyToken(header.slice(7))) return res.status(401).json({error:'Please log in again.'});
  next();
}
module.exports={login,requireAuth,configured};
