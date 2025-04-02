/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['heylcozpqbrpyjxkfzzz.supabase.co'],
    // You can also add a more precise configuration using remotePatterns instead:
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'heylcozpqbrpyjxkfzzz.supabase.co',
    //     pathname: '/storage/v1/object/public/**',
    //   },
    // ],
  },
};

export default nextConfig;
