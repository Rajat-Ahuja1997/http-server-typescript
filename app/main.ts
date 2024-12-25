import * as net from 'net';

const PORT = 4221;
const HOST = 'localhost';

// request: GET /echo/abc HTTP/1.1\r\nHost: localhost:4221\r\nUser-Agent: curl/7.64.1\r\nAccept: */*\r\n\r\n
// response: HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 3\r\n\r\nabc

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log('Logs from your program will appear here!');

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const request = data.toString();
    const response = handleIncomingRequest(request);
    socket.write(response);
  });

  socket.on('close', () => {
    socket.end();
  });
});

const handleIncomingRequest = (request: string) => {
  const requestLine = request.split('\r\n')[0];
  const [method, url, httpVersion] = requestLine.split(' ');
  if (method === 'GET') {
    if (url === '/') {
      return _formatHttpResponse(200);
    } else if (url.startsWith('/echo')) {
      const echo = url.split('/')[2];
      return _formatHttpResponse(200, echo);
    } else {
      return _formatHttpResponse(404);
    }
  }
};

const _formatHttpResponse = (status: number, body?: string) => {
  let baseResponse = `HTTP/1.1`;
  switch (status) {
    case 200:
      if (!body) {
        return `${baseResponse} 200 OK\r\n\r\n`;
      } else {
        return `${baseResponse} 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${body.length}\r\n\r\n${body}`;
      }
    case 404:
      return `${baseResponse} 404 Not Found\r\n\r\n`;
    default:
      return `${baseResponse} 500 Unhandled Request\r\n\r\n`;
  }
};

server.listen(PORT, HOST);
