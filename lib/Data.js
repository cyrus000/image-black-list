const hammingDistance = require('hamming-distance');
const VPTree = require('mnemonist/vp-tree');
const Redis = require('redis');
const Events = require('events');
const async = require('async');

class Data extends Events {

  /**
   *
   * @param {Object} incomingData
   */
  constructor(incomingData) {
    super();
    const data = incomingData || {};
    this.redisStorage = false;
    if(!data.redis) {
      this.memoryConstructor(data);
    } else {
      this.redisConstructor(data);
    }
  }

  /**
   *
   * @param {string} key
   * @param {Function} cb
   */
  loadRedisData(key, cb) {
    this.redis.hgetall(key, (err, redisData) => {
      this.hashes = redisData || {};
      cb(null);
    })
  }

  /**
   *
   * @param {Object} data
   * @param {Object} data.redis
   * @param {string} data.redis.key
   */
  redisConstructor(data) {
    this.redis = Redis.createClient(data.redis);
    this.publisher = this.redis.duplicate();
    this.subscriber = this.redis.duplicate();
    this.redisStorage = true;
    this.redisHashMapKey = data.redis.key || 'image_black_list';
    this.redisAddChannel = `${data.redis.key}:channel:add`;

    this.subscriber.on('message', (channel, message) => {
      if (channel !== this.redisAddChannel) {
        return;
      }

      const msg = JSON.parse(message);
      this.add(msg.hash, msg.identifier, () => {

      });
    });

    this.loadRedisData(this.redisHashMapKey, () => {
      this.emit('ready');
    });


    this.subscriber.subscribe(this.redisAddChannel);
  }

  /**
   *
   * @param {Object|null} data
   */
  memoryConstructor(data) {
    this.hashes = data.hashes || {};
    this.vpTree = null;
    this.updatedBlackList();
    process.nextTick(() => {
      this.emit('ready');
    })
  }

  /**
   *
   * @returns {Buffer[]}
   */
  getHashes() {
    return Object.keys(this.hashes).map((hash) => {
      return new Buffer(hash, 'hex')
    })
  }

  /**
   *
   */
  updatedBlackList() {
    const hashes = this.getHashes();

    if(hashes.length > 1) {
      this.vpTree = VPTree.from(hashes, hammingDistance);
    }
  }

  /**
   *
   * @param {string} hash
   * @param {string} value
   * @param {Function} cb
   */
  addRedis(hash, value, cb) {
    if (!this.redisStorage) {
      cb(null);
      return;
    }


    this.redis.hset(this.redisHashMapKey, hash, value, cb)
    const publishPayload = JSON.stringify({hash: hash, identifier: value});
    this.publisher.publish(this.redisAddChannel, publishPayload);
  }



  /**
   *
   * @param {string} hash
   * @param {string} identifier
   * @param {Function} cb
   */
  add(hash, identifier, cb) {
    if(Object.prototype.hasOwnProperty.call(this.hashes, hash) && this.vpTree) {
      cb(null);
      return;
    }

    async.parallel([
      (callback) => {
        this.addRedis(hash, identifier, callback);
      },
      (callback) => {
        this.hashes[hash] = identifier;
        this.updatedBlackList();
        process.nextTick(() => {
          callback(null);
        })
      }
    ], cb)
  }

  /**
   *
   * @param {Array} matches
   * @returns {*}
   */
  getIdentifiersForMatches(matches) {
    return matches.map((row) => {
      const hash = row.item.toString('hex');
      return {hash, identifier: this.hashes[hash]};
    })
  }

  /**
   *
   * @param {string} hash
   * @param {number} maxDistance
   * @returns {Array|Array<QueryMatch<Buffer>>}
   */
  getMatches(hash, maxDistance) {
    return this.vpTree.neighbors(maxDistance, new Buffer(hash, 'hex')) || [];
  }
}


module.exports = Data;