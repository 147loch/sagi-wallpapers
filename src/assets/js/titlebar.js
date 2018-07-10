(()=>{
  const {BrowserWindow} = require('electron').remote;
  const init = () => {
    $('.titlebar-win-button-close').click((e) => {
      const window = BrowserWindow.getFocusedWindow();
      window.close()
    });
    $('.titlebar-win-button-min').click((e) => {
      const window = BrowserWindow.getFocusedWindow();
      window.minimize()
    });
    $('.titlebar-win-button-max').click((e) => {
      const window = BrowserWindow.getFocusedWindow();
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    });
    $(window).on('resize', () => {
      const window = BrowserWindow.getFocusedWindow();

      const isMaximized = window.isMaximized();
      const isMinimized = window.isMinimized();
      const isFullScreen = window.isFullScreen();

      if (isFullScreen || isMaximized) {
        $('svg[name=TitleBarUnmaximize]').removeClass('hidden');
        $('svg[name=TitleBarMaximize]').addClass('hidden');
      } else {
        $('svg[name=TitleBarUnmaximize]').addClass('hidden');
        $('svg[name=TitleBarMaximize]').removeClass('hidden');
      }
    });
  }

  document.onreadystatechange = () => {if (document.readyState == "complete") init()};
})();
