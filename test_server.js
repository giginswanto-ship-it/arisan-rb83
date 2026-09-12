const http = require('http');
const { spawn } = require('child_process');

console.log("Memulai server lokal...");
const child = spawn('node', ['server.js']);

child.stdout.on('data', (data) => {
  console.log(`Server stdout: ${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`Server stderr: ${data}`);
});

setTimeout(() => {
  console.log("Mengirim HTTP GET ke http://localhost:3000 ...");
  http.get('http://localhost:3000', (res) => {
    console.log(`STATUS RES: ${res.statusCode}`);
    let body = '';
    res.on('data', chunk => { body += chunk; });
    res.on('end', () => {
      console.log(`Panjang respon: ${body.length} karakter`);
      if (body.includes('ARISAN RUMAH BOLON')) {
        console.log("✔ Verifikasi berhasil: Aplikasi HTML ARISAN RUMAH BOLON tersaji sempurna!");
      } else {
        console.log("❌ Kata kunci ARISAN RUMAH BOLON tidak ditemukan.");
      }
      child.kill();
      process.exit(0);
    });
  }).on('error', (err) => {
    console.error("Gagal terhubung ke server:", err);
    child.kill();
    process.exit(1);
  });
}, 1500);
