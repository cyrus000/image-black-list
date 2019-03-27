#image-black-list

# About
    using phash and known images you can fuzzy get a match

## usage

```javascript 1.8
//images can be files or urls
const ImageBlackList = require('image-black-list');

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

```

```javascript 1.8
//redis client will hold state on restarts
const ImageBlackList = require('image-black-list');

const config ={
  redis:
    {host: 'localhost', port: 6379, key: 'hm'}
};

const ibl = new ImageBlackList({redis: {host: 'localhost', port: 6379, key: 'hm'}});

ibl.once('ready', () => {
  const d1 = {image: '3.jpg', identifier: 'person'};
  const d2 = {image: '4.jpg', identifier: 'flower'};
  ibl.addImageToBlackList(d1, () =>{


    ibl.addImageToBlackList(d2, ()=> {


      const payload = {image: '1.jpg', distance: 6};
      ibl.getMatchesWithIdentifiers(payload, (err, matches) => {
        console.log(matches);


      });

    });
  });


})

```