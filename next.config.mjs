/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    reactCompiler: true,
    sassOptions: {
        silenceDeprecations: ["import"],
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "api.parlomo.co.uk",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
