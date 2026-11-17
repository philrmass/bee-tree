const https = require('https')

async function get(hostname, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      path,
      method: 'GET'
    }

    const request = https.request(options, result => {
      result.on('data', data => {
        resolve(data.toString('utf8'));
      });
    });

    request.on('error', (error) => reject(error));

    request.end();
  });
}

exports.get = get;
