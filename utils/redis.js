import redis from 'redis';
import { promisify } from 'util';

/**
 * This is the object Class for operating with Redis
 */
class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.getAsync = promisify(this.client.get).bind(this.client);

    this.client.on('error', (error) => {
      console.log(`Redis client not connected to the server: ${error.message}`);
    });

    this.client.on('connect', () => {
      // console.log('Redis client connected to the server');
    });
  }

  /**
   * this checks whether connection to Redis is Active
   * @return {boolean} true if connection active or false if not
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * gets value corresponding to key in redis
   * @key {string} key to search for in redis
   * @return {string}  value of key
   */
  async get(key) {
    const value = await this.getAsync(key);
    return value;
  }

  /**
   * Creates a new key in redis with a specific TTL
   * @key {string} key to be saved in redis
   * @value {string} value to be asigned to key
   * @duration {number} TTL of key
   * @return {undefined}  No return
   */
  async set(key, value, duration) {
    this.client.setex(key, duration, value);
  }

  /**
   * Deletes key in redis service
   * @key {string} key to be deleted
   * @return {undefined}  No return
   */
  async del(key) {
    this.client.del(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
