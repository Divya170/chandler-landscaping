import { MigrationInterface, QueryRunner } from 'typeorm';

/** Adds the admin-editable privacy policy text to the settings row. Skips the column if it already exists. */
export class AddPrivacyPolicy1790000000001 implements MigrationInterface {
  name = 'AddPrivacyPolicy1790000000001';

  public async up(q: QueryRunner): Promise<void> {
    const cols: { name: string }[] = await q.query(`PRAGMA table_info("settings")`);
    if (!cols.some((c) => c.name === 'privacyPolicy')) {
      await q.query(`ALTER TABLE "settings" ADD COLUMN "privacyPolicy" text`);
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "settings" DROP COLUMN "privacyPolicy"`);
  }
}
