import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Сюда можно добавлять другие настройки Next.js, если понадобятся
};

export default withNextIntl(nextConfig);