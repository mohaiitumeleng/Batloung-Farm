// Creates a local administrator password hash and token signing secret.
// Keeps all existing database settings and never stores the raw password.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const readline = require('node:readline');
const file = path.resolve(__dirname,'../.env');
if (!fs.existsSync(file)) {console.error('Create backend/.env from .env.example first.');process.exit(1);}
function prompt(question,hidden=false) {
  return new Promise((resolve,reject)=>{
    process.stdout.write(question);
    let answer='';
    if (hidden && process.stdin.isTTY && typeof process.stdin.setRawMode==='function') {
      process.stdin.setRawMode(true);process.stdin.resume();process.stdin.setEncoding('utf8');
      const onData=key=>{
        if (key==='\r' || key==='\n') {process.stdin.off('data',onData);process.stdin.setRawMode(false);process.stdout.write('\n');resolve(answer);}
        else if (key==='\u0003') {process.stdin.setRawMode(false);process.stdout.write('\n');process.exit(130);}
        else if (key==='\b'||key==='\u007f') {answer=answer.slice(0,-1);}
        else if (key.length===1&&key>=' ') answer+=key;
      };process.stdin.on('data',onData);
    } else {
      const rl=readline.createInterface({input:process.stdin,output:process.stdout});
      rl.question('',v=>{rl.close();resolve(v);});
    }
  });
}
function put(text,key,value) {
  const line=key+'='+value;
  const re=new RegExp('^'+key+'=.*$','m');
  return re.test(text)?text.replace(re,line):text.replace(/\s*$/,'')+'\n'+line+'\n';
}
(async()=>{
  const username=(await prompt('Administrator username: ')).trim();
  if(!/^[a-zA-Z0-9_.-]{3,40}$/.test(username))throw Error('Username must be 3-40 letters, digits, underscore, dash, or dot.');
  const password=await prompt('Password (input hidden when terminal supports it): ',true);
  if(password.length<12)throw Error('Use at least 12 characters for the password.');
  const confirmation=await prompt('Confirm password: ',true);
  if(password!==confirmation)throw Error('Passwords do not match.');
  const salt=crypto.randomBytes(16).toString('hex');
  const hash=crypto.scryptSync(password,salt,64).toString('hex');
  let env=fs.readFileSync(file,'utf8');
  env=put(env,'ADMIN_USERNAME',username);
  env=put(env,'ADMIN_PASSWORD_HASH',salt+':'+hash);
  env=put(env,'AUTH_SECRET',crypto.randomBytes(48).toString('hex'));
  fs.writeFileSync(file,env,{mode:0o600});
  console.log('Administrator configured. Restart backend with npm run dev.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
