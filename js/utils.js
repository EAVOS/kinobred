window.KinoBredUtils = (function() {
    var _userId = null;
    
    function getWebApp() {
        try {
            if (window.Telegram && window.Telegram.WebApp) {
                var wa = window.Telegram.WebApp;
                wa.ready();
                wa.expand();
                return wa;
            }
        } catch(e) {}
        
        return {
            initDataUnsafe: {},
            ready: function(){},
            expand: function(){},
            openTelegramLink: function(url){ window.open(url, '_blank'); },
            openLink: function(url){ window.open(url, '_blank'); },
            showPopup: function(opts){ alert(opts.message || ''); }
        };
    }
    
    function getUserId() {
        if (_userId) return _userId;
        
        var webApp = getWebApp();
        var uid = webApp.initDataUnsafe && webApp.initDataUnsafe.user && webApp.initDataUnsafe.user.id;
        if (uid) {
            _userId = String(uid);
            return _userId;
        }
        
        _userId = 'anon_' + Math.random().toString(36).substr(2, 9);
        return _userId;
    }
    
    function showScreen(id) {
        ['home-screen', 'result-screen', 'loader'].forEach(function(s) {
            var el = document.getElementById(s);
            if (el) el.classList.add('hidden');
        });
        var target = document.getElementById(id);
        if (target) target.classList.remove('hidden');
    }
    
    function showError(msg) {
        var el = document.getElementById('error-msg');
        if (el) {
            el.textContent = msg;
            el.classList.add('show');
            clearTimeout(el._timeout);
            el._timeout = setTimeout(function() { el.classList.remove('show'); }, 4000);
        }
    }
    
    function showPopup(msg) {
        var el = document.getElementById('share-popup');
        if (el) {
            el.textContent = msg;
            el.classList.remove('hidden');
            setTimeout(function() { el.classList.add('hidden'); }, 2000);
        }
    }
    
    function copyToClipboard(text) {
        try {
            navigator.clipboard.writeText(text);
            return true;
        } catch(e) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(ta);
                return true;
            } catch(e2) {
                document.body.removeChild(ta);
                return false;
            }
        }
    }
    
    function isMobile() {
        return /Android|iPhone|iPad/i.test(navigator.userAgent);
    }
    
    return {
        getWebApp: getWebApp,
        getUserId: getUserId,
        showScreen: showScreen,
        showError: showError,
        showPopup: showPopup,
        copyToClipboard: copyToClipboard,
        isMobile: isMobile
    };
})();
