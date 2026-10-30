const https = require('https');
const fs = require('fs');
const path = require('path');

const token = process.env.GITHUB_TOKEN;

function graphql(query) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query });
    const req = https.request({
      hostname: 'api.github.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'User-Agent': 'Node.js',
        'Authorization': 'bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function renderStatsSvg(stats) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="450" height="195" viewBox="0 0 450 195" fill="none" role="img">
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #00D2FF; animation: fadeInAnimation 0.8s ease-in-out forwards; }
    .stat { font: 600 14px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: #ffffff; }
    .label { font: 400 14px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: #9e9e9e; }
    .bold { font-weight: 700; }
    .icon { fill: #8A2BE2; }
    @keyframes fadeInAnimation { from { opacity: 0; } to { opacity: 1; } }
  </style>
  <rect data-testid="card-bg" x="0.5" y="0.5" rx="8" height="99%" width="449" fill="#0d1117" stroke="#30363d" stroke-opacity="0.6"/>
  <g transform="translate(25, 35)">
    <g transform="translate(0, 0)">
      <text x="0" y="0" class="header">SatanMerde's GitHub Stats</text>
    </g>
  </g>
  <g transform="translate(25, 60)">
    <!-- Stars -->
    <g transform="translate(0, 15)">
      <svg class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
        <path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
      </svg>
      <text class="label" x="25" y="13">Total Stars Earned:</text>
      <text class="stat bold" x="220" y="13">${stats.totalStars}</text>
    </g>
    <!-- Commits -->
    <g transform="translate(0, 40)">
      <svg class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
        <path fill-rule="evenodd" d="M10.5 7.75a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm1.43.75a4.002 4.002 0 01-7.86 0H.75a.75.75 0 110-1.5h3.32a4.002 4.002 0 017.86 0h3.32a.75.75 0 110 1.5h-3.32z"/>
      </svg>
      <text class="label" x="25" y="13">Total Commits:</text>
      <text class="stat bold" x="220" y="13">${stats.totalCommits}</text>
    </g>
    <!-- Total Contributions -->
    <g transform="translate(0, 65)">
      <svg class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
        <path fill-rule="evenodd" d="M1 2.5A2.5 2.5 0 013.5 0h8.75a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V1.5h-8a1 1 0 00-1 1v6.708A2.492 2.492 0 013.5 9h3.25a.75.75 0 010 1.5H3.5a1 1 0 00-1 1v1.5a1 1 0 001 1h8.75a.75.75 0 010 1.5H3.5A2.5 2.5 0 011 13V2.5zm11.5 6a.75.75 0 01.75-.75h2a.75.75 0 010 1.5h-2a.75.75 0 01-.75-.75zm-3.5 3a.75.75 0 01.75-.75h5.5a.75.75 0 010 1.5h-5.5a.75.75 0 01-.75-.75z"/>
      </svg>
      <text class="label" x="25" y="13">Total Contributions:</text>
      <text class="stat bold" x="220" y="13">${stats.totalContributions}</text>
    </g>
    <!-- Repositories -->
    <g transform="translate(0, 90)">
      <svg class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
        <path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
      </svg>
      <text class="label" x="25" y="13">Total Repositories:</text>
      <text class="stat bold" x="220" y="13">${stats.totalRepos}</text>
    </g>
  </g>
</svg>`;
}

function renderTopLangsSvg(langs) {
  const totalSize = langs.reduce((acc, l) => acc + l.size, 0);
  let progressX = 0;
  const progressBars = langs.slice(0, 5).map(l => {
    const width = ((l.size / totalSize) * 250).toFixed(1);
    const rect = `<rect x="${progressX}" y="0" width="${width}" height="8" fill="${l.color || '#3178c6'}" rx="2"/>`;
    progressX += parseFloat(width);
    return rect;
  }).join('');

  const langItems = langs.slice(0, 5).map((l, idx) => {
    const percent = ((l.size / totalSize) * 100).toFixed(1);
    const y = idx * 22;
    return `
    <g transform="translate(0, ${y})">
      <circle cx="5" cy="6" r="5" fill="${l.color || '#3178c6'}"/>
      <text class="lang-name" x="18" y="10">${l.name}</text>
      <text class="lang-percent" x="140" y="10">${percent}%</text>
    </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="195" viewBox="0 0 300 195" fill="none" role="img">
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #00D2FF; }
    .lang-name { font: 600 13px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: #ffffff; }
    .lang-percent { font: 400 13px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: #9e9e9e; text-anchor: end; }
  </style>
  <rect data-testid="card-bg" x="0.5" y="0.5" rx="8" height="99%" width="299" fill="#0d1117" stroke="#30363d" stroke-opacity="0.6"/>
  <g transform="translate(25, 35)">
    <text x="0" y="0" class="header">Top Languages</text>
  </g>
  <g transform="translate(25, 52)">
    <mask id="bar-mask">
      <rect x="0" y="0" width="250" height="8" rx="4" fill="white"/>
    </mask>
    <g mask="url(#bar-mask)">
      ${progressBars}
    </g>
  </g>
  <g transform="translate(25, 75)">
    ${langItems}
  </g>
</svg>`;
}

(async () => {
  const query = `
    query {
      user(login: "SatanMerde") {
        repositories(first: 100, ownerAffiliations: OWNER) {
          totalCount
          nodes {
            stargazerCount
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                  color
                }
              }
            }
          }
        }
        contributionsCollection {
          totalCommitContributions
        }
      }
    }
  `;

  const qRes = await graphql(query);
  const u = qRes.data.user;

  let totalStars = 0;
  const langMap = {};

  u.repositories.nodes.forEach(repo => {
    totalStars += repo.stargazerCount;
    if (repo.languages && repo.languages.edges) {
      repo.languages.edges.forEach(edge => {
        const name = edge.node.name;
        if (!langMap[name]) {
          langMap[name] = { name: name, color: edge.node.color, size: 0 };
        }
        langMap[name].size += edge.size;
      });
    }
  });

  const sortedLangs = Object.values(langMap).sort((a, b) => b.size - a.size);

  const stats = {
    totalStars: totalStars,
    totalCommits: '244+',
    totalContributions: '276',
    totalRepos: u.repositories.totalCount
  };

  const assetsDir = path.join(__dirname, '..', 'profile-assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  fs.writeFileSync(path.join(assetsDir, 'github-stats.svg'), renderStatsSvg(stats), 'utf8');
  fs.writeFileSync(path.join(assetsDir, 'top-langs.svg'), renderTopLangsSvg(sortedLangs), 'utf8');
  console.log('Successfully updated profile stats SVGs.');
})();
