import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';
import { RequestParser, type Request } from './request';
import HttpResponseBuilder from './response';

const PORT = 4221;
const HOST = 'localhost';

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const request = data.toString();
    const parsedRequest = RequestParser.parse(request);
    const response = handleIncomingRequest(parsedRequest);
    socket.write(response);
  });

  socket.on('close', () => {
    socket.end();
  });
});

const handleIncomingRequest = (parsedRequest: Request): string => {
  const { method, path: url, headers, body } = parsedRequest;
  const directory = process.argv[3];
  if (headers['accept-encoding']) {
    if (headers['accept-encoding'] === 'gzip') {
      return new HttpResponseBuilder(200)
        .setType('text/plain')
        .setEncoding('gzip')
        .setBody(body)
        .build();
    }
  }

  switch (method) {
    case 'GET':
      if (url === '/') {
        return new HttpResponseBuilder(200).build();
      } else if (url.startsWith('/echo')) {
        const echo = url.split('/')[2];
        return new HttpResponseBuilder(200)
          .setBody(echo)
          .setType('text/plain')
          .build();
      } else if (url.startsWith('/user-agent')) {
        return new HttpResponseBuilder(200)
          .setBody(headers['user-agent'] || '')
          .setType('text/plain')
          .build();
      } else if (url.startsWith('/files')) {
        const file = url.split('/')[2];
        try {
          const filePath = path.join(directory, file);
          const contents = fs.readFileSync(filePath, 'utf-8');
          return new HttpResponseBuilder(200)
            .setBody(contents)
            .setType('application/octet-stream')
            .build();
        } catch (err) {
          return new HttpResponseBuilder(404).build();
        }
      } else {
        return new HttpResponseBuilder(404).build();
      }
    case 'POST':
      if (url.startsWith('/files')) {
        const fileToWrite = url.split('/')[2];
        fs.writeFileSync(path.join(directory, fileToWrite), body);
      }
      return new HttpResponseBuilder(201).build();
    default:
      return new HttpResponseBuilder(500).build();
  }
};

server.listen(PORT, HOST);
