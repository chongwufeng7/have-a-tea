'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const game = path.join(root, 'minigame');
const evidence = path.join(root, 'artifacts', 'minigame-v0.15');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const normal = value => value.replace(/\r\n/g, '\n');

function lockReviewControls(source) {
  return source + '\n;(() => {\n' +
    '  const ReviewPlatform = module.exports.Platform;\n' +
    '  Object.defineProperty(ReviewPlatform.prototype, "testMode", {\n' +
    '    get() { return false; }, set(_value) {}, configurable: false\n' +
    '  });\n' +
    '})();\n';
}

function fortifiedPlatform(source, map, fortified) {
  if (map.sourcesContent?.length !== 1) throw Error('Expected one fortified source');
  const current = normal(source), base = normal(map.sourcesContent[0]);
  if (base === current) return fortified;
  // Reuse the verified fortified base only when the sole addition is the sharing method.
  // Future changes to storage/environment handling must be fortified again.
  const sharing = current.match(/\n  enableSharing\(\) \{([\s\S]*?)\n  \}\n(?=  read\(\))/);
  if (!sharing || current.replace(sharing[0], '\n') !== base) {
    throw Error('Fortified platform.js does not match the current readable source');
  }
  return fortified + '\nmodule.exports.Platform.prototype.enableSharing = function () {' + sharing[1] + '\n};\n';
}

function build(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw Error('Expected semantic version');
  const source = fs.readFileSync(path.join(game, 'js', 'platform.js'), 'utf8');
  const map = JSON.parse(fs.readFileSync(path.join(evidence, 'platform.js.map'), 'utf8'));
  const fortified = fs.readFileSync(path.join(evidence, 'platform.fortified.uploaded.js'), 'utf8');
  const compatible = fortifiedPlatform(source, map, fortified);
  const out = path.join(root, '.cache', 'review-build-' + version);
  if (fs.existsSync(out)) throw Error('Review build already exists: ' + out);
  fs.cpSync(game, out, { recursive: true, filter: item => {
    const name = path.basename(item);
    return name !== 'project.private.config.json' && name !== 'code.fortify.config.json' && !name.endsWith('.map');
  }});
  const reviewPlatform = lockReviewControls(compatible);
  fs.writeFileSync(path.join(out, 'js', 'platform.js'), reviewPlatform);
  const manifest = { version, appid: JSON.parse(fs.readFileSync(path.join(out, 'project.config.json'))).appid,
    originalSourceSha256: hash(normal(source)), fortifiedBaseSha256: hash(fortified),
    sharingExtension: compatible !== fortified,
    protection: 'verified previously fortified platform base; readable sharing adapter and review lock',
    reviewPlatformSha256: hash(reviewPlatform), reviewControls: 'disabled-for-all-env-versions',
    testProject: game, reviewProject: out };
  const proof = path.join(root, 'artifacts', 'review-v' + version);
  fs.mkdirSync(proof, { recursive: true });
  fs.writeFileSync(path.join(proof, 'review-build-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

if (require.main === module) console.log(JSON.stringify(build(process.argv[2] || ''), null, 2));
module.exports = { build, lockReviewControls, fortifiedPlatform };
