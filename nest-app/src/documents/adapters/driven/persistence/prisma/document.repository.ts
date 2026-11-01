import { InjectTransactionHost } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import type {
  Document,
  NewDocument,
} from '@src/documents/domain/models/document';
import {
  DocumentStatus,
  type FinishedDocumentStatus,
} from '@src/documents/domain/models/document-status';
import type { DocumentRepositoryPort } from '@src/documents/domain/ports/document-repository.port';
import type { PrismaTransactionHost } from '@src/lib/database/prisma-transaction-host';
import { toDocument } from './document.mapper';

const PROCESSABLE_STATUSES = [
  DocumentStatus.Uploaded,
  DocumentStatus.Processing,
];

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

  async findNewest(limit: number): Promise<Document[]> {
    const rows = await this.txHost.tx.document.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map(toDocument);
  }

  async startProcessing(id: string): Promise<Document | undefined> {
    const rows = await this.txHost.tx.document.updateManyAndReturn({
      where: { id, status: { in: PROCESSABLE_STATUSES } },
      data: { status: DocumentStatus.Processing },
    });
    return rows.map(toDocument).at(0);
  }

  async finishProcessing(
    id: string,
    status: FinishedDocumentStatus,
  ): Promise<void> {
    await this.txHost.tx.document.updateMany({
      where: { id, status: DocumentStatus.Processing },
      data: { status },
    });
  }
}
