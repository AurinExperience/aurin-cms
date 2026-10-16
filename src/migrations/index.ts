import * as migration_20261012_184550_localize_project_slug from './20261012_184550_localize_project_slug';
import * as migration_20261016_190000_project_categories from './20261016_190000_project_categories';

export const migrations = [
  {
    up: migration_20261012_184550_localize_project_slug.up,
    down: migration_20261012_184550_localize_project_slug.down,
    name: '20261012_184550_localize_project_slug'
  },
  {
    up: migration_20261016_190000_project_categories.up,
    down: migration_20261016_190000_project_categories.down,
    name: '20261016_190000_project_categories'
  },
];
