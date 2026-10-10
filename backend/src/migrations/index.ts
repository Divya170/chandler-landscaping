import { InitialSchema1790000000000 } from './1790000000000-InitialSchema';
import { AddPrivacyPolicy1790000000001 } from './1790000000001-AddPrivacyPolicy';

/** Listed explicitly (no globs) so they resolve the same under ts-node, Nest's build and Jest. Add new migrations here. */
export const MIGRATIONS = [InitialSchema1790000000000, AddPrivacyPolicy1790000000001];
