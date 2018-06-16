import fs from 'fs';

/**
 * Read the content of a file
 * @param filepath {String} File to the file to read
 * @returns {Promise}
 */
const readFile = filepath => new Promise((resolve, reject) => {
  fs.readFile(filepath, 'utf-8', (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });
});

const getMockfilePath = file => `${__dirname}/assets/${file}`;

const server = app => {
  const BACKEND_PATH_PREFIX = '/api';

  app.get(`${BACKEND_PATH_PREFIX}/flux-models`, (req, res) => {
    const filepath = getMockfilePath('fluxModels.json');
    readFile(filepath)
      .then(data => res.json(JSON.parse(data)));
  });

  app.get(`${BACKEND_PATH_PREFIX}/config`, (req, res) => {
    const filepath = getMockfilePath('config.json');
    readFile(filepath)
      .then(data => res.json(JSON.parse(data)));
  });
};

export default server;