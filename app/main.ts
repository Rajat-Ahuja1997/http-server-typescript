import * as net from 'net';

const PORT = 4221;
const HOST = 'localhost';

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log('Logs from your program will appear here!');

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    socket.write(_formatHttpResponse(200));
  });
  socket.on('close', () => {
    socket.end();
  });
});

const _formatHttpResponse = (status: number) => {
  let baseResponse = `HTTP/1.1 `;
  switch (status) {
    case 200:
      return `${baseResponse}200 OK`;
    default:
      return `${baseResponse}500 Unhandled Request`;
  }
};

server.listen(PORT, HOST);
