const path = require('path');
const remote = require('electron').remote;
const { dialog, getCurrentWindow } = require('electron').remote;
const Enmap = require('enmap');
const EnmapLevel = require('enmap-level');
const storage = new Enmap({ provider: new EnmapLevel({ name: 'storage' }) });
const sharp = require('sharp');
const dataUriToBuffer = require('data-uri-to-buffer');
const moment = require('moment');
const fs = require('fs');

function desktopCropper() {
  // This part of the app is for the desktop cropper

  // Do the sidebar steps indication
  $('.flex-side .item.selected').each((i, e) => {
    $(e).removeClass('item-selected item selected').addClass('item-default item not-selected');
  });
  $('#sidebar-homepage').addClass('completed');
  $('#sidebar-desktop-cropper').removeClass('item-default item not-selected').addClass('item-selected item selected');

  // start the cropper
  const $img = $('#cropper-img');
  document.cropper = new Cropper($img[0], {
    aspectRatio: 16 / 9,
    autoCropArea: 1,
    viewMode: 2,
    responsive: true,
    restore: false,
    scalable: false,
    rotatable: false,
    zoomable: false,
    cropBoxResizable: false,
    dragMode: 'move',
    toggleDragModeOnDblclick: false
  });
  document.cropper.replace(storage.get('picturePath'), false);

  // register pane buttons
  $('#default-pane-settings').addClass('hidden');
  $('#desktop-cropper-pane-settings').removeClass('hidden');
  $('#desktop-cropper-pane-settings-saveButton').click(() => {
    // let img = document.cropper.getCroppedCanvas().toDataURL();
    // let data = img.replace(/^data:image\/\w+;base64,/, "");
    // storage.set('horizontalCrop', data);
    storage.set('horizontalCrop', document.cropper.getCroppedCanvas({ imageSmoothingEnabled: false, imageSmoothingQuality: 'high' }).toDataURL(storage.get('pictureMIME')));
    $('#default-pane-settings').removeClass('hidden');
    $('#desktop-cropper-pane-settings').addClass('hidden');
    mobileCropper();
  });
  $('#desktop-cropper-pane-settings-quitButton').click(() => {
    if (dialog.showMessageBox(
      remote.getCurrentWindow(),
      {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Are you sure you want to quit, and go back to the main menu?'
      }
    ) === 0) {
      localStorage.clear();
      storage.deleteAll();
      getCurrentWindow().reload();
    }
  });
}

function mobileCropper() {

  // Steps information
  $('.flex-side .item.selected').each((i, e) => {
    $(e).removeClass('item-selected item selected').addClass('item-default item not-selected');
  });
  $('#sidebar-homepage').addClass('completed');
  $('#sidebar-desktop-cropper').addClass('completed');
  $('#sidebar-mobile-cropper').removeClass('item-default item not-selected').addClass('item-selected item selected');

  // restart the cropper with proper aspect ratio
  document.cropper.setAspectRatio(9 / 16);

  // register pane buttons
  $('#default-pane-settings').addClass('hidden');
  $('#mobile-cropper-pane-settings').removeClass('hidden');
  $('#mobile-cropper-pane-settings-saveButton').click(() => {
    storage.set('verticalCrop', document.cropper.getCroppedCanvas({ imageSmoothingEnabled: false, imageSmoothingQuality: 'high' }).toDataURL(storage.get('pictureMIME')));
    $('#default-pane-settings').removeClass('hidden');
    $('#mobile-cropper-pane-settings').addClass('hidden');
    watermarkVerifier();
  });
  $('#mobile-cropper-pane-settings-quitButton').click(() => {
    if (dialog.showMessageBox(
      remote.getCurrentWindow(),
      {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Are you sure you want to quit, and go back to the main menu?'
      }
    ) === 0) {
      localStorage.clear();
      storage.deleteAll();
      getCurrentWindow().reload();
    }
  });
}

function watermarkVerifier() {

  // Steps information
  $('.flex-side .item.selected').each((i, e) => {
    $(e).removeClass('item-selected item selected').addClass('item-default item not-selected');
  });
  $('#sidebar-homepage').addClass('completed');
  $('#sidebar-desktop-cropper').addClass('completed');
  $('#sidebar-mobile-cropper').addClass('completed');
  $('#sidebar-watermark-verifier').removeClass('item-default item not-selected').addClass('item-selected item selected');
  $('#default-pane-settings').addClass('hidden');
  $('#watermark-verifier-pane-settings').removeClass('hidden');
  $('#cropper-img').addClass('hidden');
  $('#watermark-verifier-page').removeClass('hidden');

  // Remove the cropper from the img dom
  document.cropper.destroy();

  // create settings
  let settings = {
    "horizontal": {
      "logoColor": "white",
      "logoRatio": 5,
      "position": "southeast"
    },
    "vertical": {
      "logoColor": "white",
      "logoRatio": 3,
      "position": "southeast"
    }
  };

  updateCurrentWatermarkControls(settings, 'horizontal');

  // do the horizontal
  $('#verifier-title').html('Desktop Wallpaper');
  doWatermark(settings, 'horizontal');

  // Register buttons
  $('.watermark-verifier-position').each((i, e) => {
    let $el = $(e);
    $el.click((e) => {
      let value = $el.data('watermark-position-value');
      if (value !== settings.horizontal.position) {
        $('.watermark-verifier-position.item.selected').removeClass('item-selected item selected').addClass('item-default item not-selected');
        $el.removeClass('item-default item not-selected').addClass('item-selected item selected');
        settings.horizontal.position = value;
        doWatermark(settings, 'horizontal')
      }
    });
  }); 

  $('.watermark-verifier-ratio').each((i, e) => {
    let $el = $(e);
    $el.click((e) => {
      let value = $el.data('watermark-ratio-value');
      if (value !== settings.horizontal.logoRatio) {
        $('.watermark-verifier-ratio.item.selected').removeClass('item-selected item selected').addClass('item-default item not-selected');
        $el.removeClass('item-default item not-selected').addClass('item-selected item selected');
        settings.horizontal.logoRatio = value;
        doWatermark(settings, 'horizontal')
      }
    });
  }); 

  $('.watermark-verifier-color').each((i, e) => {
    let $el = $(e);
    $el.click((e) => {
      let value = $el.data('watermark-color-value');
      if (value !== settings.horizontal.logoColor) {
        $('.watermark-verifier-color.item.selected').removeClass('item-selected item selected').addClass('item-default item not-selected');
        $el.removeClass('item-default item not-selected').addClass('item-selected item selected');
        settings.horizontal.logoColor = value;
        doWatermark(settings, 'horizontal')
      }
    });
  });

  $('#watermark-verifier-pane-settings-quitButton').click(() => {
    if (dialog.showMessageBox(
      remote.getCurrentWindow(),
      {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Are you sure you want to quit, and go back to the main menu?'
      }
    ) === 0) {
      localStorage.clear();
      storage.deleteAll();
      getCurrentWindow().reload();
    }
  });

  $('#watermark-verifier-pane-settings-saveButton').one('click', () => {
    resetWatermarkEventListeners()
    updateCurrentWatermarkControls(settings, 'vertical');

    $('#verifier-title').html('Mobile Wallpaper');
    doWatermark(settings, 'vertical');

    // Register buttons
    $('.watermark-verifier-position').each((i, e) => {
      let $el = $(e);
      $el.click((e) => {
        let value = $el.data('watermark-position-value');
        if (value !== settings.vertical.position) {
          $('.watermark-verifier-position.item.selected').removeClass('item-selected item selected').addClass('item-default item not-selected');
          $el.removeClass('item-default item not-selected').addClass('item-selected item selected');
          settings.vertical.position = value;
          doWatermark(settings, 'vertical')
        }
      });
    });

    $('.watermark-verifier-ratio').each((i, e) => {
      let $el = $(e);
      $el.click((e) => {
        let value = $el.data('watermark-ratio-value');
        if (value !== settings.vertical.logoRatio) {
          $('.watermark-verifier-ratio.item.selected').removeClass('item-selected item selected').addClass('item-default item not-selected');
          $el.removeClass('item-default item not-selected').addClass('item-selected item selected');
          settings.vertical.logoRatio = value;
          doWatermark(settings, 'vertical')
        }
      });
    });

    $('.watermark-verifier-color').each((i, e) => {
      let $el = $(e);
      $el.click((e) => {
        let value = $el.data('watermark-color-value');
        if (value !== settings.vertical.logoColor) {
          $('.watermark-verifier-color.item.selected').removeClass('item-selected item selected').addClass('item-default item not-selected');
          $el.removeClass('item-default item not-selected').addClass('item-selected item selected');
          settings.vertical.logoColor = value;
          doWatermark(settings, 'vertical')
        }
      });
    });

    $('#watermark-verifier-pane-settings-saveButton').one('click', () => {
      resetWatermarkEventListeners();
      saveFiles();
    });
  });
}

function resetWatermarkEventListeners() {
  $('.watermark-verifier-color').off();
  $('.watermark-verifier-ratio').off();
  $('.watermark-verifier-position').off();
}

function lockWatermarkButtons() {
  $('.watermark-verifier-color').removeClass('enabled').addClass('disabled');
  $('.watermark-verifier-ratio').removeClass('enabled').addClass('disabled');
  $('.watermark-verifier-position').removeClass('enabled').addClass('disabled');
  $('#watermark-verifier-pane-settings-saveButton').removeClass('enabled').addClass('disabled')
  $('#watermark-verifier-pane-settings-quitButton').removeClass('enabled').addClass('disabled')
}

function unlockWatermarkButtons() {
  $('.watermark-verifier-color').addClass('enabled').removeClass('disabled');
  $('.watermark-verifier-ratio').addClass('enabled').removeClass('disabled');
  $('.watermark-verifier-position').addClass('enabled').removeClass('disabled');
  $('#watermark-verifier-pane-settings-saveButton').addClass('enabled').removeClass('disabled');
  $('#watermark-verifier-pane-settings-quitButton').addClass('enabled').removeClass('disabled');
}

function resetWatermarkButtons() {
  $('.watermark-verifier-color').removeClass('item-selected item selected').addClass('item-default item not-selected');
  $('.watermark-verifier-ratio').removeClass('item-selected item selected').addClass('item-default item not-selected');
  $('.watermark-verifier-position').removeClass('item-selected item selected').addClass('item-default item not-selected');
}

function updateCurrentWatermarkControls(settings, type) {
  resetWatermarkButtons();

  $(`[data-watermark-position-value=${settings[type].position}]`).removeClass('item-default item not-selected').addClass('item-selected item selected');
  $(`[data-watermark-ratio-value=${settings[type].logoRatio}]`).removeClass('item-default item not-selected').addClass('item-selected item selected');
  $(`[data-watermark-color-value=${settings[type].logoColor}]`).removeClass('item-default item not-selected').addClass('item-selected item selected');
}

function doWatermark(settings, type) {
  
  // lock the buttons
  lockWatermarkButtons();

  // Bind the img dom and define img objects
  const $img = $('#verifier-img');
  $img.addClass('hidden');

  const $spinner = $('#watermark-spinner');
  $spinner.removeClass('hidden');

  applyWatermark(settings[type].logoColor, settings[type].logoRatio, settings[type].position, type, (buf) => {
    storage.set(`${type}Maxres`, buf);
    
    $img.attr('src', 'data:image/png;base64,' + btoa(
      new Uint8Array(buf)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    ));
    $spinner.addClass('hidden');
    $img.removeClass('hidden');

    // unlock the buttons
    unlockWatermarkButtons();
  });
}

function applyWatermark(logoColor, ratio, position, type, callback) {
  const pictureFormats = JSON.parse(storage.get('pictureFormats'));

  // crop the sagi/spvfa logo according to maximum size of picture
  sharp(path.join(__dirname, `../assets/logos/logo_${logoColor}.png`))
    .resize(Math.round(pictureFormats[type][0] / ratio), Math.round(pictureFormats[type][1] / ratio))
    .max()
    .png()
    .toBuffer()
    .then((logoBuffer) => {
      // Generate the cropped+overlay image :::SLOW PROCESS:::
      sharp(dataUriToBuffer(storage.get(`${type}Crop`)))
        .resize(pictureFormats[type][0], pictureFormats[type][1])
        .max()
        .overlayWith(logoBuffer, {
          gravity: sharp.gravity[position]
        })
        .flatten()
        .png()
        .toBuffer()
        .then(buf => callback(buf))
        .catch(console.error);
    })
    .catch(console.error);
}

function saveFiles() {

  $('.flex-side .item.selected').each((i, e) => {
    $(e).removeClass('item-selected item selected').addClass('item-default item not-selected');
  });
  $('#sidebar-homepage').addClass('completed');
  $('#sidebar-desktop-cropper').addClass('completed');
  $('#sidebar-mobile-cropper').addClass('completed');
  $('#sidebar-watermark-verifier').addClass('completed');
  $('#sidebar-final-save').removeClass('item-default item not-selected').addClass('item-selected item selected');
  $('#default-pane-settings').addClass('hidden');
  $('#watermark-verifier-pane-settings').addClass('hidden');
  $('#final-save-pane-settings').removeClass('hidden');
  $('#cropper-img').addClass('hidden');
  $('#watermark-verifier-page').addClass('hidden');
  $('#final-save-page').removeClass('hidden');

  const possibleImageDimensions = {
    "horizontal": [
      [
        3840,
        2160,
      ],
      [
        2560,
        1440,
      ],
      [
        1920,
        1080,
      ],
      [
        1280,
        720,
      ],
      [
        960,
        540,
      ],
    ],
    "vertical": [
      [
        2160,
        3840,
      ],
      [
        1440,
        2560,
      ],
      [
        1080,
        1920,
      ],
      [
        720,
        1280,
      ],
      [
        540,
        960,
      ],
    ]
  };

  $('#final-save-pane-settings-quitButton').one('click', () => {
    if (dialog.showMessageBox(
      remote.getCurrentWindow(),
      {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Are you sure you want to quit, and go back to the main menu?'
      }
    ) === 0) {
      localStorage.clear();
      storage.deleteAll();
      getCurrentWindow().reload();
    }
  });

  $('#final-save-pane-settings-saveButton').on('click', async () => {    
    const name = $('#final-save-name-input').val();
    if (name === "") {
      $('#final-save-danger-text').removeClass('hidden').html('A name is required to save the files, please enter one.');
      return;
    } else {
      $('#final-save-danger-text').addClass('hidden');
      
      const saveDirectoryParent = dialog.showOpenDialog(remote.getCurrentWindow(), {
        properties: ['openDirectory']
      });
      const saveDirectory = `${saveDirectoryParent}/${name.replace(/[^0-9a-z]/gi, '').toLowerCase()}_${moment().format('YYYY-MM-DD_HH-mm-ss')}`;
      fs.mkdir(saveDirectory, (err) => console.error);

      const $progressLabel = $('#final-save-progress-label');
      const $progressPercent = $('#final-save-progress-bar-percent');
      
      for (let i = 0; i < possibleImageDimensions.horizontal.length; i++) {
        const v = possibleImageDimensions.horizontal[i];

        await sleep(500);
        
        $progressPercent.css('width', `${((i + 1) / (possibleImageDimensions.horizontal.length + possibleImageDimensions.vertical.length)) * 100}%`);

        const pictureFormats = JSON.parse(storage.get('pictureFormats'));
        if (pictureFormats.horizontal[0] < v[0] || pictureFormats.horizontal[1] < v[1]) {
          $progressLabel.html(`Skipping the horizontal size of ${v[0]}x${v[1]}, the input's resolution is too low for this size.`)
          continue;
        }

        $progressLabel.html(`Saving the horizontal size ${v[0]}x${v[1]} as ${name.replace(/[^0-9a-z]/gi, '').toLowerCase()}_horizontal_${v[0]}x${v[1]}.png`);
        saveFile(saveDirectory, v, name.replace(/[^0-9a-z]/gi, '').toLowerCase(), "horizontal");
      }
      
      for (let i = 0; i < possibleImageDimensions.vertical.length; i++) {
        const v = possibleImageDimensions.vertical[i];
        
        await sleep(500);

        $progressPercent.css('width', `${((i + 1 + possibleImageDimensions.horizontal.length) / (possibleImageDimensions.horizontal.length + possibleImageDimensions.vertical.length)) * 100}%`);

        const pictureFormats = JSON.parse(storage.get('pictureFormats'));
        if (pictureFormats.vertical[0] < v[0] || pictureFormats.vertical[1] < v[1]) {
          $progressLabel.html(`Skipping the vertical size of ${v[0]}x${v[1]}, the input's resolution is too low for this size.`)
          continue;
        }

        $progressLabel.html(`Saving the vertical size ${v[0]}x${v[1]} as ${name.replace(/[^0-9a-z]/gi, '').toLowerCase()}_vertical_${v[0]}x${v[1]}.png`);
        saveFile(saveDirectory, v, name.replace(/[^0-9a-z]/gi, '').toLowerCase(), "vertical");
      }

      $progressLabel.html('All the files have been saved successfully. The app will restart in three seconds.');
      await sleep(3000);
      localStorage.clear();
      storage.deleteAll();
      getCurrentWindow().reload();
    }
  });
}

function saveFile(directory, size, nameBase, type) {
  sharp(storage.get(`${type}Maxres`))
    .resize(size[0], size[1])
    .max()
    .png()
    .toFile(`${directory}/${nameBase}_${type}_${size[0]}x${size[1]}.png`)
    .then(console.log)
    .catch(console.error)
}
