import * as migration_20261012_184550_localize_project_slug from './20261012_184550_localize_project_slug';
import * as migration_20261016_190000_project_categories from './20261016_190000_project_categories';
import * as migration_20261016_200000_bold_title_to_heading from './20261016_200000_bold_title_to_heading';
import * as migration_20261019_120000_project_sections from './20261019_120000_project_sections';

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
  {
    up: migration_20261016_200000_bold_title_to_heading.up,
    down: migration_20261016_200000_bold_title_to_heading.down,
    name: '20261016_200000_bold_title_to_heading'
  },
  {
    up: migration_20261019_120000_project_sections.up,
    down: migration_20261019_120000_project_sections.down,
    name: '20261019_120000_project_sections'
  },
];
