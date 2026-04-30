window.KinoBredShare = (function() {
    var utils = window.KinoBredUtils;
    var config = window.KinoBredConfig;
    
    function shareFilm(film, genre) {
        if (!film) return;
        
        var shareText = '🎬 ' + (film.title || 'Мой фильм') + '\n\n' +
            (film.annotation || '') + '\n\n' +
            '🎵 Саундтрек: ' + (film.soundtrack || '') + '\n' +
            '⭐️ Слоган: ' + (film.slogan || '') + '\n\n' +
            'Сними свой фильм: https://t.me/' + config.BOT_USERNAME;
        
        if (utils.isMobile()) {
            var shareUrl = 'https://t.me/share/url?text=' + encodeURIComponent(shareText);
            var webApp = utils.getWebApp();
            if (webApp && webApp.openTelegramLink) {
                webApp.openTelegramLink(shareUrl);
            }
            utils.showPopup('📤 Выберите чат для отправки');
        } else {
            utils.copyToClipboard(shareText);
            utils.showPopup('📋 Текст скопирован! Вставьте в чат (Ctrl+V)');
        }
        
        trackShare();
    }
    
    function trackShare() {
        var cb = 'kb_share_' + Date.now();
        window[cb] = function() { delete window[cb]; };
        var s = document.createElement('script');
        s.src = config.GAS_URL + '?action=share&callback=' + cb;
        document.head.appendChild(s);
        setTimeout(function() {
            if (s.parentNode) s.parentNode.removeChild(s);
            if (window[cb]) delete window[cb];
        }, 5000);
    }
    
    return { shareFilm: shareFilm };
})();
