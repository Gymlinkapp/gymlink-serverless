/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // domains
  images: {
    domains: [
      'source.unsplash.com',
      'ltlwfcdwjczwsvohawml.supabase.co',
      'images.unsplash.com',
    ],
  },
};

module.exports = nextConfig;
