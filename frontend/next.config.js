/** @type {import('next').NextConfig} */
const nextConfig = {
  // appDir is enabled by default in Next.js 13+
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude canvas and other Node.js modules from client-side bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
        assert: false,
        constants: false,
        events: false,
        querystring: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        tls: false,
        net: false,
        child_process: false,
        cluster: false,
        dgram: false,
        dns: false,
        domain: false,
        module: false,
        global: false,
        __dirname: false,
        __filename: false,
      }
    }
    return config
  },
}

module.exports = nextConfig 