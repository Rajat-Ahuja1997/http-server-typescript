import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';

const PORT = 4221;
const HOST = 'localhost';

const directory = process.argv[3];

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

const handleIncomingRequest = (request: string): string => {
  const requestLine = request.split('\r\n')[0];
  const [method, url, httpVersion] = requestLine.split(' ');
  const hostLine = request.split('\r\n')[1]; // Unused
  const userAgentLine = request.split('\r\n')[2];

  const body = request.split('\r\n')[5];

  switch (method) {
    case 'GET':
      if (url === '/') {
        return _formatHttpResponse(200);
      } else if (url.startsWith('/echo')) {
        const echo = url.split('/')[2];
        return _formatHttpResponse(200, echo);
      } else if (url.startsWith('/user-agent')) {
        const userAgent = userAgentLine.split(': ')[1];
        return _formatHttpResponse(200, userAgent);
      } else if (url.startsWith('/files')) {
        const file = url.split('/')[2];
        try {
          const filePath = path.join(directory, file);
          const contents = fs.readFileSync(filePath, 'utf-8');
          return _formatHttpResponse(200, contents, 'application/octet-stream');
        } catch (err) {
          return _formatHttpResponse(404);
        }
      } else {
        return _formatHttpResponse(404);
      }
    case 'POST':
      if (url.startsWith('/files')) {
        const fileToWrite = url.split('/')[2];
        fs.writeFileSync(path.join(directory, fileToWrite), body);
      }
      return _formatHttpResponse(201);
    default:
      return _formatHttpResponse(500);
  }
};

const _formatHttpResponse = (status: number, body?: string, type?: string) => {
  const contentType = type || 'text/plain';
  let baseResponse = `HTTP/1.1`;
  switch (status) {
    case 200:
      if (!body) {
        return `${baseResponse} 200 OK\r\n\r\n`;
      } else {
        return `${baseResponse} 200 OK\r\nContent-Type: ${contentType}\r\nContent-Length: ${body.length}\r\n\r\n${body}`;
      }
    case 201:
      return `${baseResponse} 201 Created\r\n\r\n`;
    case 404:
      return `${baseResponse} 404 Not Found\r\n\r\n`;
    default:
      return `${baseResponse} 500 Unhandled Request\r\n\r\n`;
  }
};

server.listen(PORT, HOST);
