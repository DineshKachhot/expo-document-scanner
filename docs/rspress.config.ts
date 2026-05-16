import { defineConfig } from '@rspress/core';
import path from 'path';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'Expo Document Scanner',
  description: 'A powerful document scanner for Expo applications.',
  icon: '/hero.svg',
  logo: '/hero.svg',
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/DineshKachhot/expo-document-scanner',
      },
    ],
  },
});
