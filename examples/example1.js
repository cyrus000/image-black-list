const ImageBlackList = require('../lib/ImageBlackList');

const ibl = new ImageBlackList({ hashes: {
    "d8c0a08063080462": 'test1',
    "d8c0a08083082462": 'test2',
  }});

ibl.getMatchesHash('d8c0a08083082482', 4, (err, matches) => {
  console.log(matches);
});

const d1 = {image: '3.jpg', identifier: 'person'};
const d2 = {image: '4.jpg', identifier: 'flower'};
ibl.addImageToBlackList(d1, ()=> {
  ibl.addImageToBlackList(d2, ()=> {

    const payload = {image: '1.jpg', distance: 10};
    ibl.getMatches(payload, (err, matches) => {
      console.log(matches);
    });
  });
});
