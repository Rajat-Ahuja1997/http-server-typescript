interface Headers {
  host?: string;
  'user-agent'?: string;
  'content-type'?: string;
  'content-length'?: string;
  'accept-encoding'?: string;
}

export interface Request {
  method: string;
  path: string;
  headers: Headers;
  body: string;
}

export class RequestParser {
  static parse(rawRequest: string): Request {
    const lines = rawRequest.split('\r\n');
    const [requestLine, ...rest] = lines;
    const [method, path, httpVersion] = requestLine.split(' ');

    const headers: Headers = {};
    const bodyStartIdx = rest.findIndex((line) => line === '');
    const headerLines =
      bodyStartIdx !== -1 ? rest.slice(0, bodyStartIdx) : rest;

    const body =
      bodyStartIdx !== -1 ? rest.slice(bodyStartIdx + 1).join('\r\n') : '';

    headerLines.forEach((h) => {
      const [key, value] = h.split(': ');
      const lowerKey = key.toLowerCase();
      if (
        lowerKey === 'host' ||
        lowerKey === 'user-agent' ||
        lowerKey === 'content-type' ||
        lowerKey === 'content-length' ||
        lowerKey === 'accept-encoding'
      ) {
        headers[lowerKey as keyof Headers] = value;
      }
    });

    return { method, path, headers, body };
  }
}
