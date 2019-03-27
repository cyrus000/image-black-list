const ImageBlackList = require('../lib/ImageBlackList');

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
