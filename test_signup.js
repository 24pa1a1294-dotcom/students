const http = require('http');
const querystring = require('querystring');

const postData = querystring.stringify({
  name: 'Test User',
  email: 'test@example.com',
  password: 'secret123'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Body length:', data.length);
    // Print a short snippet of the body for debugging
    console.log(data.slice(0, 400));
  });
});

req.on('error', (e) => {
  console.error('Request error', e.message);
});

req.write(postData);
req.end();
