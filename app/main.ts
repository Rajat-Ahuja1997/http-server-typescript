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

const handleIncomingRequest = (parsedRequest: Request): Buffer => {
  const { method, path: url, headers, body } = parsedRequest;
  const directory = process.argv[3];

  const builder = new HttpResponseBuilder(200);
  if (headers['accept-encoding']) {
    const encodings = headers['accept-encoding'].split(', ');
    builder.setEncoding(encodings);
  }

  switch (method) {
    case 'GET':
      if (url === '/') {
        return builder.build();
      } else if (url.startsWith('/echo')) {
        const echo = url.split('/')[2];
        return builder.setBody(echo).setType('text/plain').build();
      } else if (url.startsWith('/user-agent')) {
        return builder
          .setBody(headers['user-agent'] || '')
          .setType('text/plain')
          .build();
      } else if (url.startsWith('/files')) {
        const file = url.split('/')[2];
        try {
          const filePath = path.join(directory, file);
          const contents = fs.readFileSync(filePath, 'utf-8');
          return builder
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
