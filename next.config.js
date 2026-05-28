/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Headers', value: 'Origin, X-Requested-With, Content-Type, Accept' },
          { key: 'X-UA-Compatible', value: 'IE=Edge,chrome=1' },
          // Permissions-Policy (formerly Feature-Policy) - keep minimal for legacy
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=()' },
          // Allow polyfill.io and other trusted CDNs for compatibility scripts
          { key: 'Content-Security-Policy', value: "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval' https://polyfill.io; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://polyfill.io https://cdnjs.cloudflare.com;" },
          { key: 'Referrer-Policy', value: 'no-referrer-when-downgrade' }
        ]
      }
    ];
  }
};
