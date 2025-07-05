import { createClient } from 'redis';
import { REDIS_URL } from '$env/static/private';

const redisClient = createClient({ url: REDIS_URL });

await redisClient.connect();

redisClient.on('connect', () => console.log('Redis client connected'));
redisClient.on('error', (err) => console.error('Redis Client Error', err));

export default redisClient;