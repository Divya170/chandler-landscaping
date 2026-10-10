import { DataSourceOptions } from 'typeorm';
import { AdminUser } from '../admin-auth/admin-user.entity';
import { config } from '../config';
import { ContentBlock } from '../content/content-block.entity';
import { Project } from '../gallery/project.entity';
import { LeadFile } from '../inquiries/lead-file.entity';
import { Lead } from '../inquiries/lead.entity';
import { MIGRATIONS } from '../migrations';
import { Settings } from '../settings/settings.entity';

export const ENTITIES = [AdminUser, ContentBlock, Project, Lead, LeadFile, Settings];

/** Shared by the app (app.module.ts), the TypeORM CLI (cli-data-source.ts) and the tests. */
export const dataSourceOptions = (database: string = config.databasePath): DataSourceOptions => ({
  type: 'sqlite',
  database,
  entities: ENTITIES,
  migrations: MIGRATIONS,
  migrationsRun: false,
  synchronize: false,
});

