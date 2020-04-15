module.exports = {
  title: "NoteStream",
  tagline: "Bringing privacy to real-time finance",
  url: "https://note.stream",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "TomAFrench", // Usually your GitHub org/user name.
  projectName: "NoteStream", // Usually your repo name.
  themeConfig: {
    navbar: {
      title: "NoteStream",
      // logo: {
      //   alt: "NoteStream Logo",
      //   src: "img/logo.svg",
      // },
      links: [
        {
          to: "https://app.note.stream",
          activeBasePath: "app",
          label: "App",
          position: "left",
        },
        {
          to: "docs/introduction",
          activeBasePath: "docs",
          label: "Docs",
          position: "left",
        },
        // { to: 'blog', label: 'Blog', position: 'left' },
        {
          href: "https://github.com/TomAFrench/NoteStream",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Getting Started",
              to: "docs/getting_started/using_notestream",
            },
            {
              label: "Privacy",
              to: "docs/privacy/main",
            },
          ],
        },
        // {
        //   title: 'Community',
        //   items: [
        //     {
        //       label: 'Stack Overflow',
        //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
        //     },
        //     {
        //       label: 'Discord',
        //       href: 'https://discordapp.com/invite/docusaurus',
        //     },
        //   ],
        // },
        {
          title: "Social",
          items: [
            // {
            //   label: 'Blog',
            //   to: 'blog',
            // },
            {
              label: "GitHub",
              href: "https://github.com/TomAFrench/NoteStream",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/tomfrench_eth",
            },
          ],
        },
      ],
      copyright: `Copyright © ${
        new Date().getFullYear() > 2020
          ? `2020 - ${new Date().getFullYear()}`
          : 2020
      } Tom French.`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl:
            "https://github.com/TomAFrench/NoteStream/edit/production/packages/website",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
