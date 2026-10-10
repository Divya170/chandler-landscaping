import 'reflect-metadata';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../database/data-source';

const memory = () => new DataSource(dataSourceOptions(':memory:'));

describe('database migrations', () => {
  it('build a schema identical to the entities (nothing left for TypeORM to change)', async () => {
    const ds = memory();
    await ds.initialize();
    await ds.runMigrations();
    const pending = await ds.driver.createSchemaBuilder().log();
    expect(pending.upQueries.map((q) => q.query)).toEqual([]);
    await ds.destroy();
  });

  it('adopt a database that was originally created by synchronize, without errors or data loss', async () => {
    const file = path.join(os.tmpdir(), `chandler-migrations-${process.pid}-${Date.now()}.sqlite`);
    try {
      // 1. The old way: tables from synchronize, settings without the privacyPolicy column, with a row in it.
      const legacy = new DataSource({ ...dataSourceOptions(file), synchronize: true, migrations: [] } as any);
      await legacy.initialize();
      await legacy.query(`DROP TABLE "settings"`);
      await legacy.query(`CREATE TABLE "settings" ("id" integer PRIMARY KEY NOT NULL, "businessName" varchar(120) NOT NULL DEFAULT ('Chandler Landscaping'), "contactName" varchar(120), "phone" varchar(40), "email" varchar(254), "addressLine1" varchar(200), "addressLine2" varchar(200), "cityLabel" varchar(80), "aboutIntro" text, "aboutStory" text, "aboutImage" varchar(400), "successMessage" text, "notifyEmail" varchar(254), "showContentFlags" boolean NOT NULL DEFAULT (1), "mobileQuoteBar" boolean NOT NULL DEFAULT (1), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
      await legacy.query(`INSERT INTO "settings" ("id", "businessName") VALUES (1, 'Kept Name')`);
      await legacy.destroy();

      // 2. The new way: run the migrations over it.
      const ds = new DataSource(dataSourceOptions(file));
      await ds.initialize();
      await ds.runMigrations();
      expect(await ds.query(`SELECT "businessName", "privacyPolicy" FROM "settings"`)).toEqual([{ businessName: 'Kept Name', privacyPolicy: null }]);
      expect((await ds.driver.createSchemaBuilder().log()).upQueries.map((q) => q.query)).toEqual([]);
      await ds.destroy();
    } finally {
      fs.rmSync(file, { force: true });
    }
  });

  it('add the privacyPolicy column to an existing settings table and keep its data', async () => {
    const ds = memory();
    await ds.initialize();
    const [initial, addPolicy] = ds.migrations;
    const runner = ds.createQueryRunner();
    await initial.up(runner);
    await runner.query(`INSERT INTO "settings" ("id", "businessName") VALUES (1, 'Kept Name')`);
    await addPolicy.up(runner);
    await addPolicy.up(runner); // running twice must be harmless
    const rows = await runner.query(`SELECT "businessName", "privacyPolicy" FROM "settings"`);
    expect(rows).toEqual([{ businessName: 'Kept Name', privacyPolicy: null }]);
    await runner.release();
    await ds.destroy();
  });
});
