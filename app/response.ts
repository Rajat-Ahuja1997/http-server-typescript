import { gzipSync } from 'zlib';

class HttpResponseBuilder {
  private baseResponse: string = 'HTTP/1.1';
  private status: number;
  private headers: Record<string, string> = {};
  private body?: string;

  constructor(status: number) {
    this.status = status;
  }

  setBody(body: string) {
    this.body = body;
    return this;
  }

  setType(type: string) {
    this.headers['Content-Type'] = type;
    return this;
  }

  setEncoding(encodings: string[]) {
    if (encodings.includes('gzip')) {
      this.headers['Content-Encoding'] = 'gzip';
    }
    return this;
  }

  build(): Buffer {
    const statusText = this.getStatusText(this.status);
    let response = `${this.baseResponse} ${this.status} ${statusText}\r\n`;
    let respBody: Buffer | undefined;

    if (this.body && this.headers['Content-Encoding'] === 'gzip') {
      respBody = gzipSync(Buffer.from(this.body)); // Compress the body using gzip
    } else if (this.body) {
      respBody = Buffer.from(this.body); // Use plain text body
    }

    // Set Content-Length header
    if (respBody) {
      this.headers['Content-Length'] = respBody.length.toString();
    }

    // Add headers to response
    response += Object.entries(this.headers)
      .map(([key, value]) => `${key}: ${value}\r\n`)
      .join('');

    // End headers section
    response += '\r\n';

    // Combine headers and body
    return respBody
      ? Buffer.concat([Buffer.from(response, 'utf-8'), respBody])
      : Buffer.from(response, 'utf-8');
  }

  private getStatusText(status: number): string {
    switch (status) {
      case 200:
        return 'OK';
      case 201:
        return 'Created';
      case 404:
        return 'Not Found';
      default:
        return 'Unhandled Request';
    }
  }
}

export default HttpResponseBuilder;
