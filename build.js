// build.js — atualiza index.html com dados frescos do ClickUp
// Uso: node build.js
//
// O que faz:
//   1. Chama API do ClickUp e salva data.json
//   2. Injeta o JSON dentro do index.html (substitui o placeholder /*INJECT_DATA*/null/*END*/)
//   3. Resultado: index.html self-contained, abre direto no browser ou hospeda em qualquer lugar

const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = 'pk_102677809_DOMWP0RIY0ONNLSV1OHKP4CCEFSP64XB';
const WORKSPACE_ID = '90133119220';

const SPACE_NAMES = {
  '901313645915': 'GESTAO',
  '901313715555': 'PRODUCAO',
  '901313646305': 'OPERACIONAL',
  '901313715444': 'COMERCIAL',
  '901313715445': 'Criativo'
};

const PEOPLE = ['BIA', 'LUIS', 'DAVID', 'CAROL', 'MATHEUS', 'THAY', 'HENRIQUE', 'ANA LAURA', 'JOAO', 'JOÃO', 'CAYE'];

function detectPerson(name) {
  const upper = (name || '').toUpperCase();
  for (const p of PEOPLE) {
    if (upper.includes(p)) return p === 'JOÃO' ? 'JOAO' : p;
  }
  return null;
}

function fetchClickUp(path) {
  return new Promise((resolve, reject) => {
    https.get(`https://api.clickup.com/api/v2${path}`, {
      headers: { 'Authorization': TOKEN }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Parse: ' + data.slice(0, 200))); }
      });
    }).on('error', reject);
  });
}

(async () => {
  console.log('1️⃣ Puxando tasks do ClickUp...');
  let allTasks = [];
  for (let page = 0; page < 10; page++) {
    const data = await fetchClickUp(`/team/${WORKSPACE_ID}/task?include_closed=true&subtasks=true&page=${page}`);
    const tasks = data.tasks || [];
    if (tasks.length === 0) break;
    allTasks = allTasks.concat(tasks);
    if (tasks.length < 100) break;
  }
  console.log(`   ✓ ${allTasks.length} tasks recebidas`);

  console.log('2️⃣ Slim down + detect person...');
  const slim = allTasks.map(t => {
    const sp_id = (t.space || {}).id || '';
    return {
      id: t.id,
      name: t.name,
      status: (t.status || {}).status,
      status_type: (t.status || {}).type,
      space_id: sp_id,
      space: SPACE_NAMES[sp_id] || '?',
      folder: (t.folder || {}).name,
      folder_id: (t.folder || {}).id,
      list: (t.list || {}).name,
      priority: t.priority ? (t.priority || {}).priority : null,
      due_date: t.due_date,
      date_updated: t.date_updated,
      person_detected: detectPerson(t.name),
      url: t.url
    };
  });

  const payload = { tasks: slim, fetched_at: new Date().toISOString() };
  const dataPath = path.join(__dirname, 'data.json');
  fs.writeFileSync(dataPath, JSON.stringify(payload, null, 0));
  console.log(`   ✓ data.json salvo (${(fs.statSync(dataPath).size / 1024).toFixed(1)} KB)`);

  console.log('3️⃣ Injetando no index.html...');
  const htmlPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  const injected = html.replace(
    /\/\*INJECT_DATA\*\/[\s\S]*?\/\*END\*\//,
    '/*INJECT_DATA*/' + JSON.stringify(payload) + '/*END*/'
  );
  fs.writeFileSync(htmlPath, injected);
  console.log(`   ✓ index.html atualizado`);

  console.log('');
  console.log('✅ PRONTO! Abra index.html no browser ou faça push pra Vercel/GitHub Pages.');
})().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
