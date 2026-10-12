import * as migration_20261012_184550_localize_project_slug from './20261012_184550_localize_project_slug';

export const migrations = [
  {
    up: migration_20261012_184550_localize_project_slug.up,
    down: migration_20261012_184550_localize_project_slug.down,
    name: '20261012_184550_localize_project_slug'
  },
];
