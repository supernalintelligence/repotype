// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://supernalintelligence.github.io',
  base: '/repotype',
  integrations: [
    starlight({
      title: 'Repotype',
      description: 'Repository-level linting for high-quality codebases',
      logo: {
        src: './src/assets/logo.png',
        replacesTitle: false,
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/supernalintelligence/repotype' },
      ],
      editLink: {
        baseUrl: 'https://github.com/supernalintelligence/repotype/edit/main/docs-site/',
      },
      customCss: ['./src/styles/custom.css'],
      head: [
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: 'https://supernalintelligence.github.io/repotype/og-image.png' },
        },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'getting-started/introduction' },
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Quick Start', slug: 'getting-started/quick-start' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Configuration', slug: 'guides/configuration' },
            { label: 'Folder Rules', slug: 'guides/folder-rules' },
            { label: 'File Rules', slug: 'guides/file-rules' },
            { label: 'Frontmatter Schemas', slug: 'guides/frontmatter-schemas' },
            { label: 'CI Integration', slug: 'guides/ci-integration' },
            { label: 'Git Hooks', slug: 'guides/git-hooks' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'CLI Commands', slug: 'reference/cli' },
            { label: 'Configuration Schema', slug: 'reference/config' },
            { label: 'Diagnostic Codes', slug: 'reference/diagnostics' },
          ],
        },
        {
          label: 'Examples',
          autogenerate: { directory: 'examples' },
        },
      ],
      credits: true,
      lastUpdated: true,
    }),
  ],
});
