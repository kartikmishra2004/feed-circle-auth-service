import { createClient } from "redis";

let client: ReturnType<typeof createClient>;

export const connectRedis = async () => {
    if (client) return client;

    client = createClient({
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_SOCKET_HOST,
            port: Number(process.env.REDIS_SOCKET_PORT),
        },
    });

    client.on("error", (err) => console.error("❌ Redis Client Error", err));

    await client.connect();
    console.log("✅ Connected to Redis");

    return client;
};

export const getRedisClient = () => {
    if (!client) {
        throw new Error("Redis client is not connected. Call connectRedis() first.");
    }
    return client;
};
