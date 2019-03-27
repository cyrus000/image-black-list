const jimp = require('jimp');


class ImageHashing {
  /**
   *
   * @param {string} img
   * @param {Function} cb
   */
  static getPhash(img, cb) {
    try {
      jimp.read(img, (err, jimpImage) => {
        if(err) {
          cb(err);
          return;
        }

        const hash = jimpImage.hash(16);
        cb(null, hash);
      })
    } catch (e) {
      cb(e);
    }

  }
}


module.exports = ImageHashing;