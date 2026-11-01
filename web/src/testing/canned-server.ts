import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http';
import type { AddressInfo } from 'node:net';

interface CannedResponse {
  status: number;
  body: unknown;
}

export interface RecordedRequest {
  method: string;
  path: string;
  contentType: string | undefined;
  body: Buffer;
}

export class CannedServer {
  private readonly responses = new Map<string, CannedResponse>();
  private readonly requests: RecordedRequest[] = [];
  private readonly server: Server = createServer((request, response) => {
    void this.handle(request, response);
  });

  async start(): Promise<string> {
    await new Promise<void>((resolve) => {
      this.server.listen(0, '127.0.0.1', resolve);
    });
    const { port } = this.server.address() as AddressInfo;
    return `http://127.0.0.1:${port}`;
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((error) => (error ? reject(error) : resolve()));
    });
  }

  respondTo(method: string, path: string, status: number, body: unknown): void {
    this.responses.set(`${method} ${path}`, { status, body });
  }

  lastRequest(): RecordedRequest | undefined {
    return this.requests.at(-1);
  }

  private async handle(
    request: IncomingMessage,
    response: ServerResponse,
  ): Promise<void> {
    const recorded = await record(request);
    this.requests.push(recorded);
    const canned = this.responses.get(`${recorded.method} ${recorded.path}`);
    response.writeHead(canned?.status ?? 404, {
      'Content-Type': 'application/json',
    });
    response.end(JSON.stringify(canned?.body ?? { statusCode: 404 }));
  }
}

async function record(request: IncomingMessage): Promise<RecordedRequest> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(chunk as Buffer);
  }
  return {
    method: request.method ?? '',
    path: request.url ?? '',
    contentType: request.headers['content-type'],
    body: Buffer.concat(chunks),
  };
}
