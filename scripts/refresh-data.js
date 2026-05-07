// scripts/refresh-data.js
// Atualiza public/data.json com dados frescos do ClickUp.
// Uso: npm run refresh   (ou: node scripts/refresh-data.js)
//
// Roda local OU no GitHub Action (cron).

const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.CLICKUP_TOKEN || 'pk_102677809_DOMWP0RIY0ONNLSV1OHKP4CCEFSP64XB';
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

function fetchClickUp(p) {
  return new Promise((resolve, reject) => {
    https.get(`https://api.clickup.com/api/v2${p}`, {
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
  console.log('1️⃣  Puxando tasks do ClickUp...');
  let allTasks = [];
  for (let page = 0; page < 10; page++) {
    const data = await fetchClickUp(`/team/${WORKSPACE_ID}/task?include_closed=true&subtasks=true&page=${page}`);
    const tasks = data.tasks || [];
    if (tasks.length === 0) break;
    allTasks = allTasks.concat(tasks);
    if (tasks.length < 100) break;
  }
  console.log(`   ✓ ${allTasks.length} tasks recebidas`);

  console.log('2️⃣  Slim down + detect person...');
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
  const dataPath = path.join(__dirname, '..', 'public', 'data.json');
  fs.writeFileSync(dataPath, JSON.stringify(payload));
  console.log(`   ✓ public/data.json salvo (${(fs.statSync(dataPath).size / 1024).toFixed(1)} KB)`);
  console.log('');
  console.log('✅ Refresh completo. Pra deploy: git add public/data.json && git commit -m "refresh data" && git push');
})().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
