const express = require('express');
const http = require('http');
const path = require('path');
const app = express();

const googlePlacesApiPath = '/maps/api/place/textsearch/json';

app.use(cors());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  app.use(googlePlacesApiPath, (req, res) => {
    const options = {
      hostname: 'maps.googleapis.com',
      port: 443,
      path: req.url,
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    // Przeproś żądanie do API Google Places
  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);

    proxyRes.on('data', (chunk) => {
      res.write(chunk);
    });

    proxyRes.on('end', () => {
      res.end();
    });
  });

  req.on('data', (chunk) => {
    proxy.write(chunk);
  });

  req.on('end', () => {
    proxy.end();
  });

  proxy.on('error', (err) => {
    console.error(err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  });
});

// Serwuj statyczne pliki Angulara
app.use(express.static(path.join(__dirname, 'dist/WeatherApp')));

// Ustaw port serwera Express
const port = process.env.PORT || 3000;
app.set('port', port);

// Utwórz serwer HTTP i nasłuchuj na określonym porcie
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});