const fs = require('fs');
const {app, dialog} = require('electron').remote

async function appInit() {
  const $img = $('#cropper-img');
  document.cropper = new Cropper($img[0], {
    aspectRatio: 16 / 9,
    viewMode: 2,
    responsive: true,
    restore: false,
    // crop(event) {
    //   // console.log(event.detail.x);
    //   // console.log(event.detail.y);
    //   // console.log(event.detail.width);
    //   // console.log(event.detail.height);
    //   // console.log(event.detail.rotate);
    //   // console.log(event.detail.scaleX);
    //   // console.log(event.detail.scaleY);
    // },
  });
  document.cropper.replace(localStorage.getItem('picturePath'), false);
}
// $(()=>{
//   appInit();
// });

function cropDone() {
  let img = document.cropper.getCroppedCanvas().toDataURL();
  console.log(document.cropper.getCroppedCanvas().toDataURL());
  let data = img.replace(/^data:image\/\w+;base64,/, "");
  let buf = new Buffer(data, 'base64');

  dialog.showSaveDialog({
    title: 'Save your screenshot',
    filters: [
      { name: 'Images', extensions: ['png'] }
    ],
  }, (filename) => {
    fs.writeFile(filename, buf)
  });
}
