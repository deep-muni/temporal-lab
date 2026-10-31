import { InjectTransactionHost } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import type {
  Document,
  NewDocument,
} from '@src/documents/domain/models/document';
import type { DocumentRepositoryPort } from '@src/documents/domain/ports/document-repository.port';
import type { PrismaTransactionHost } from '@src/lib/database/prisma-transaction-host';
import { toDocument } from './document.mapper';

@Injectable()
export class PrismaDocumentRepository implements DocumentRepositoryPort {
  constructor(
    @InjectTransactionHost()
    private readonly txHost: PrismaTransactionHost,
  ) {}

  async create(document: NewDocument): Promise<Document> {
    const row = await this.txHost.tx.document.create({ data: document });
    return toDocument(row);
  }
}
