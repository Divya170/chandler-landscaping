import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from './data-source';

/** Loaded by the TypeORM CLI: `npm run migration:run | migration:check | migration:generate`. */
export default new DataSource(dataSourceOptions());
