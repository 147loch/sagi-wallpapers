const mime = require('mime-types')
$(()=>{
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
    console.fancy('File Importer', 'The file is a valid image, sending to main thread.');
    localStorage.setItem('picturePath', filePath);
    $('div[data-frame="steps-app"]').removeClass('hidden');
    await sleep(50)
    $('div[data-frame="steps-app"]').removeClass('fadescale-out');
    $('div[data-frame="homepage"]').addClass('fadescale-out');
    setTimeout(() => {
      $('div[data-frame="homepage"]').remove();
    }, 500);
    appInit();
  } else {
    console.fancy('File Importer', 'The file is not a valid image.');
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
}
