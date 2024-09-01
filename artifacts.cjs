const fs = require('node:fs');
const path = require('node:path');
const archiver = require('archiver');
const packageJson = require('./package.json');

const buildDir = 'builds/chrome';
const artifactsDir = 'builds/artifacts';

// Rename Firefox XIP artefacts
fs.readdir(artifactsDir, (err, files) => {
  if (err) throw err;
  const xpiFile = files.find((file) => file.endsWith('.xpi'));
  if (xpiFile) {
    const oldPath = path.join(artifactsDir, xpiFile);
    const newPath = path.join(artifactsDir, xpiFile.replace('.xpi', '_firefox.xpi'));
    fs.rename(oldPath, newPath, (err) => {
      if (err) throw err;
      console.info(`Renamed ${xpiFile} to ${newPath}`);
    });
    return;
  }

  console.warn('No .xpi file found to rename.');
});

// Ensure the artifacts directory exists
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir);
}

// Define the output zip file path
const zipFileName = `f95list_ext-${packageJson.version}_chrome.zip`;
const output = fs.createWriteStream(path.join(artifactsDir, zipFileName));
const archive = archiver('zip', {
  zlib: { level: 9 },
});

output.on('close', () => {
  console.info(`${archive.pointer()} total bytes`);
  console.info('archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(buildDir, false);
archive.finalize();
