export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '600' // 10 minutes
}
