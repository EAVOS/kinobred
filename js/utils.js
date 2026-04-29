window.KinoBredUtils = {
    
    initWebApp: function() {
        try {
            if (window.Telegram && window.Telegram.WebApp) {
                var webApp = window.Telegram.WebApp;
                
                if (webApp.ready) webApp.ready();
                if (webApp.expand) webApp.expand();
                if (webApp.disableVerticalSwipes) webApp.disableVerticalSwipes();
                
                if (webApp.MainButton) {
                    webApp.MainButton.hide();
                }
                
                if (webApp.setHeaderColor) webApp.setHeaderColor('#0a0a1a');
                if (webApp.setBackgroundColor) webApp.setBackgroundColor('#0a0a1a');
                
                return webApp;
            }
        } catch(e) {
            console.warn('Telegram WebApp not available:', e);
        }
        return null;
    },
    
    getUserId: function() {
        var webApp = window.KinoBredApp && window.KinoBredApp.webApp;
        
        if (webApp && webApp.initDataUnsafe && webApp.initDataUnsafe.user && webApp.initDataUnsafe.user.id) {
            return 'tg_' + webApp.initDataUnsafe.user.id;
        }
        
        try {
            var uid = sessionStorage.getItem('kb_user_id');
            if (uid) return uid;
        } catch(e) {}
        
        try {
            var uid = localStorage.getItem('kb_user_id');
            if (uid) return uid;
        } catch(e) {}
        
        var anonId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        
        try { sessionStorage.setItem('kb_user_id', anonId); } catch(e) {}
        try { localStorage.setItem('kb_user_id', anonId); } catch(e) {}
        
        return anonId;
    },
    
    showScreen: function(screenId) {
        document.querySelectorAll('.screen').forEach(function(screen) {
            screen.classList.add('hidden');
        });
        
        var targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
        }
        
        try {
            if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.MainButton) {
                window.Telegram.WebApp.MainButton.hide();
            }
        } catch(e) {}
    },
    
    showError: function(message) {
        var errorEl = document.getElementById('error-msg');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
            
            setTimeout(function() {
                errorEl.classList.remove('show');
            }, 4000);
        }
    },
    
    showPopup: function(message) {
        var popup = document.getElementById('share-popup');
        if (popup) {
            popup.textContent = message;
            popup.classList.remove('hidden');
            
            setTimeout(function() {
                popup.classList.add('hidden');
            }, 2000);
        }
    },
    
    copyToClipboard: function(text) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        try {
            document.execCommand('copy');
            return true;
        } catch(e) {
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
};
