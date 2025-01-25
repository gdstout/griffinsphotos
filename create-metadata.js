const fs = require('fs');
const path = require('path');

const photosDir = path.join(__dirname, 'photos');
const metadataFile = path.join(__dirname, 'metadata.json');

/**
 * requires a directory called /photos
 */
fs.readdir(photosDir, (err, files) => {
  if (err) {
    return console.error('Unable to scan directory:', err);
  }

  const metadata = {};

  files.forEach(file => {
    metadata[file] = {
      title: "",
      description: ""
    };
  });

  fs.writeFile(metadataFile, JSON.stringify(metadata, null, 2), (err) => {
    if (err) {
      return console.error('Error writing metadata file:', err);
    }
    console.log('Metadata file has been created successfully.');
  });
});