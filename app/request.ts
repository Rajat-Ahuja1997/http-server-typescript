interface Headers {
  'user-agent'?: string;
  'content-type'?: string;
}

interface Request {
  method: string;
  path: string;
  headers: Headers;
  body: string;
}

export class RequestParser {
  static parse(rawRequest: string): Request {
    const lines = rawRequest.split('\r\n');
    const requestLine = lines[0];
    const [method, path, httpVersion] = requestLine.split(' ');

    const userAgentLine = lines[2];
    const headers: Headers = {};
    headers['user-agent'] = userAgentLine.split(': ')[1];

    const body = lines[lines.length - 1];
    return { method, path, headers, body };
  }
}
