module.exports = {
  title: 'Tejas.AI Docs',
  tagline: 'Making AI Fast and Accesible',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'favicon/favicon.ico',
  organizationName: 'ProjektTejas', // Usually your GitHub org/user name.
  projectName: 'Tejas.AI', // Usually your repo name.
  themeConfig: {
    defaultMode: 'dark',
    navbar: {
      title: 'Tejas.AI',
      logo: {
        alt: 'Tejas.AI Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        { to: 'blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/ProjektTejas',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'ProjektTejas',
              to: 'docs/',
            },
            {
              label: 'The Journey',
              to: 'docs/logs/log-overview',
            },
          ],
        },
        {
          title: 'Find Me 🔎',
          items: [
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/in/satyajitghana',
            },
            {
              label: 'Github',
              href: 'https://github.com/satyajitghana',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/thesudoer_',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Tejas.AI, Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
