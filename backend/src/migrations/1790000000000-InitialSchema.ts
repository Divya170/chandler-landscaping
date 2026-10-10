import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Baseline schema. Uses IF NOT EXISTS so a database that was originally built by the old
 * `synchronize: true` setup adopts the migration history without errors.
 */
export class InitialSchema1790000000000 implements MigrationInterface {
  name = 'InitialSchema1790000000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE IF NOT EXISTS "admin_users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar(254) NOT NULL, "name" varchar(120) NOT NULL DEFAULT ('Admin'), "passwordHash" varchar(100) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_dcd0c8a4b10af9c986e510b9ecc" UNIQUE ("email"))`);

    await q.query(`CREATE TABLE IF NOT EXISTS "content_blocks" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar(40) NOT NULL, "key" varchar(60), "sortOrder" integer NOT NULL DEFAULT (0), "published" boolean NOT NULL DEFAULT (1), "fields" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_f00b0a4f74f66c79dae14ec7e0" ON "content_blocks" ("type", "sortOrder")`);

    await q.query(`CREATE TABLE IF NOT EXISTS "gallery_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar(120) NOT NULL, "category" varchar(60) NOT NULL, "imageUrl" varchar(400) NOT NULL, "alt" varchar(300) NOT NULL, "focal" varchar(20) NOT NULL DEFAULT ('50% 50%'), "size" varchar(10) NOT NULL DEFAULT ('standard'), "sortOrder" integer NOT NULL DEFAULT (0), "published" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_7eb9e65a06b2cbdd3248e30501" ON "gallery_items" ("published", "sortOrder")`);

    await q.query(`CREATE TABLE IF NOT EXISTS "leads" ("id" varchar PRIMARY KEY NOT NULL, "reference" varchar(16) NOT NULL, "status" varchar(20) NOT NULL DEFAULT ('New'), "read" boolean NOT NULL DEFAULT (0), "name" varchar(120) NOT NULL, "phone" varchar(30) NOT NULL, "email" varchar(200) NOT NULL, "service" varchar(60), "location" varchar(200) NOT NULL, "preferredDate" varchar(10), "details" text, "consentAt" datetime NOT NULL, "adminNotes" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_fc8fd472470762482f5e5eeebf4" UNIQUE ("reference"))`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_5f0b2cd257d4a8e6b73e2b0902" ON "leads" ("status", "createdAt")`);

    await q.query(`CREATE TABLE IF NOT EXISTS "lead_files" ("id" varchar PRIMARY KEY NOT NULL, "leadId" varchar NOT NULL, "originalName" varchar(255) NOT NULL, "storageKey" varchar(120) NOT NULL, "mime" varchar(40) NOT NULL, "bytes" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_89974ee20208967e711d8d0ee98" FOREIGN KEY ("leadId") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);

    await q.query(`CREATE TABLE IF NOT EXISTS "settings" ("id" integer PRIMARY KEY NOT NULL, "businessName" varchar(120) NOT NULL DEFAULT ('Chandler Landscaping'), "contactName" varchar(120), "phone" varchar(40), "email" varchar(254), "addressLine1" varchar(200), "addressLine2" varchar(200), "cityLabel" varchar(80), "aboutIntro" text, "aboutStory" text, "aboutImage" varchar(400), "successMessage" text, "notifyEmail" varchar(254), "showContentFlags" boolean NOT NULL DEFAULT (1), "mobileQuoteBar" boolean NOT NULL DEFAULT (1), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
  }

  public async down(q: QueryRunner): Promise<void> {
    for (const t of ['settings', 'lead_files', 'leads', 'gallery_items', 'content_blocks', 'admin_users']) {
      await q.query(`DROP TABLE IF EXISTS "${t}"`);
    }
  }
}
