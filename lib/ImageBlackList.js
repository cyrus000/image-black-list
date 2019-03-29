const ImageHashing = require('./ImageHashing');
const Data = require('./Data');
const Events = require('events');

class ImageBlackList extends Events {

  /**
   *
   * @param {Object} blackList
   */
  constructor(blackList) {
    super();
    this.data = new Data(blackList).once('ready', () => {
      this.emit('ready');
    });
  }


  /**
   *
   * @param {string} image
   * @param {Function} cb
   */
  static getHash(image, cb) {
    ImageHashing.getPhash(image, cb)
  }

  /**
   *
   * @param {Object} imageObj
   * @param {string} [imageObj.image]
   * @param {string} imageObj.identifier
   * @param {string} [imageObj.hash]
   * @param cb
   */
  addImageToBlackList(imageObj, cb) {
    if(!imageObj || typeof imageObj !== 'object') {
      cb(new Error('imageObj not defined'));
      return
    }

    if(imageObj.hash) {
      this.data.add(hash, imageObj.identifier, cb);
      return
    }

    ImageBlackList.getHash(imageObj.image, (err, hash) => {
      if(err) {
        cb(err);
        return;
      }

      this.data.add(hash, imageObj.identifier, cb);
    })
  }

  /**
   *
   * @param {Object} payload
   * @param {Function} cb
   */
  getMatchesWithIdentifiers(payload, cb) {
    this.getMatches(payload, (err, matches) => {
      cb(null, this.data.getIdentifiersForMatches(matches))
    })
  }

  /**
   *
   * @param {string} hash
   * @param {number} distance
   * @param {Function} cb
   */
  getMatchesHash(hash, distance, cb) {
    const matches = this.data.getMatches(hash, distance);
    cb(null, matches);
  }

  /**
   *
   * @param {Object} payload
   * @param {string} [payload.image]
   * @param {number} payload.distance
   * @param {string} [payload.hash]
   * @param {Function} cb
   */
  getMatches(payload, cb) {
    if(!payload || typeof payload !== 'object') {
      cb(new Error('payload not defined'));
      return
    }

    if(payload.hash) {
      const matches = this.data.getMatches(payload.hash, payload.distance);
      cb(null, matches);
      return
    }


    ImageBlackList.getHash(payload.image, (err, hash) => {
      if(err) {
        cb(err);
        return;
      }

      const matches = this.data.getMatches(hash, payload.distance);
      cb(null, matches);
    })
  }
}

module.exports = ImageBlackList;