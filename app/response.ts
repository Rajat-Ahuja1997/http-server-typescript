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
    this.headers['Content-Length'] = body.length.toString();
    return this;
  }

  setType(type: string) {
    this.headers['Content-Type'] = type;
    return this;
  }

  setEncoding(encoding: string) {
    this.headers['Content-Encoding'] = encoding;
    return this;
  }

  build(): string {
    const statusText = this.getStatusText(this.status);
    let response = `${this.baseResponse} ${this.status} ${statusText}\r\n`;

    if (Object.keys(this.headers).length > 0) {
      response += Object.entries(this.headers)
        .map(([key, value]) => `${key}: ${value}\r\n`)
        .join('');
    }

    response += '\r\n';

    if (this.body) {
      response += this.body;
    }

    console.log('response', response);
    return response;
  }

  private getStatusText(status: number) {
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
