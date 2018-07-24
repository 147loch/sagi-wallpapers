const mime = require('mime-types');
const sizeOf = require('image-size');
$(() => {
  document.addEventListener('dragenter', e => e.preventDefault());
  document.addEventListener('dragover', e => e.preventDefault());
  document.addEventListener('drop', e => event.preventDefault());
  $('.dragdrop-area')
    .bind('dragover', () => {
      $('#modal-welcome').addClass('fadescale-out');
      setTimeout(() => {
        $('#modal-welcome').addClass('hidden');
        $('#modal-file-drop').removeClass('hidden');
      }, 200);
    })
    .bind('dragleave', () => {
      $('#modal-file-drop').addClass('layer-animate fadescale-out');
      setTimeout(() => {
        $('#modal-welcome').removeClass('hidden');
        $('#modal-file-drop').addClass('hidden').removeClass('layer-animate fadescale-out');
        setTimeout(() => {
          $('#modal-welcome').removeClass('fadescale-out');
        }, 50);
      }, 200);
    })
    .bind('drop', (e) => {
      const filePath = e.originalEvent.dataTransfer.files[0].path;
      startApp(filePath);
    });
});

async function startApp(filePath) {
  $('#modal-file-drop').addClass('layer-animate fadescale-out');
  $('#modal-file-drop').addClass('hidden').removeClass('layer-animate fadescale-out');
  await sleep(200);
  if (mime.lookup(filePath).match(/^image\/.*$/) !== null) {

    // store the image for later use
    storage.set('picturePath', filePath);
    storage.set('pictureMIME', mime.lookup(filePath));
    
    // check image size and set final resolutions samples
    const dimensions = sizeOf(storage.get('picturePath'))
    const imageWidth = dimensions.width;
    const imageHeight = dimensions.height;
    const possibleImageDimensions = {
      // "horizontal": {
      //   "UHD": {
      //     "width": 3840,
      //     "height": 2160
      //   },
      //   "QHD": {
      //     "width": 2560,
      //     "height": 1440
      //   },
      //   "FHD": {
      //     "width": 1920,
      //     "height": 1080
      //   },
      //   "HD": {
      //     "width": 1280,
      //     "height": 720
      //   },
      //   "qHD": {
      //     "width": 960,
      //     "height": 540
      //   },
      // },
    };
    // horizontal
    if (imageWidth < 960 || imageHeight < 540) {
      animateError('The image resolution is too small <br> for horizontal wallpapers');
      return;
    } else if (imageWidth < 1280 || imageHeight < 720) {
      possibleImageDimensions.horizontal = [
        960,
        540,
      ]
    } else if (imageWidth < 1920 || imageHeight < 1080) {
      possibleImageDimensions.horizontal = [
        1280,
        720,
      ]
    } else if (imageWidth < 2560 || imageHeight < 1440) {
      possibleImageDimensions.horizontal = [
        1920,
        1080,
      ]
    } else if (imageWidth < 3840 || imageHeight < 2160) {
      possibleImageDimensions.horizontal = [
        2560,
        1440,
      ]
    } else {
      possibleImageDimensions.horizontal = [
        3840,
        2160,
      ]
    }
    // vertical
    if (imageHeight < 960 || imageWidth < 540) {
      animateError('The image resolution is too small <br> for vertical wallpapers.');
      return;
    } else if (imageHeight < 1280 || imageWidth < 720) {
      possibleImageDimensions.vertical = [
        540,
        960,
      ]
    } else if (imageHeight < 1920 || imageWidth < 1080) {
      possibleImageDimensions.vertical = [
        720,
        1280,
      ]
    } else if (imageHeight < 2560 || imageWidth < 1440) {
      possibleImageDimensions.vertical = [
        1080,
        1920,
      ]
    } else if (imageHeight < 3840 || imageWidth < 2160) {
      possibleImageDimensions.vertical = [
        1440,
        2560,
      ]
    } else {
      possibleImageDimensions.vertical = [
        2160,
        3840,
      ]
    }
    // console.log(possibleImageDimensions);
    storage.set('pictureFormats', JSON.stringify(possibleImageDimensions));

    // do the animations
    $('div[data-frame="steps-app"]').removeClass('hidden');
    await sleep(50)
    $('div[data-frame="steps-app"]').removeClass('fadescale-out');
    $('div[data-frame="homepage"]').addClass('fadescale-out');
    await sleep(500)
    $('div[data-frame="homepage"]').addClass('hidden');
    
    // send the process to the first step (desktop cropper)
    desktopCropper();
  } else {
    // do animations
    animateError('The image type is invalid.')
  }
}

async function animateError(msg) {
  // Change the message
  $('#invalidImageReason').html(msg);

  // do the animations
  $('#modal-file-drop').addClass('layer-animate fadescale-out');
  await sleep(200);
  $('#modal-file-drop').addClass('hidden').removeClass('layer-animate fadescale-out');
  await sleep(50);
  $('#modal-file-error').removeClass('hidden');
  await sleep(3000);
  $('#modal-file-error').addClass('layer-animate fadescale-out');
  await sleep(200);
  $('#modal-welcome').removeClass('hidden');
  $('#modal-file-error').addClass('hidden').removeClass('layer-animate fadescale-out');
  await sleep(50);
  $('#modal-welcome').removeClass('fadescale-out');
}
