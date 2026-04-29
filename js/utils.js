// Утилиты КиноБреда
window.KinoBredUtils = {
    // Инициализация Telegram WebApp
    initWebApp: function() {
        try {
            if (window.Telegram && window.Telegram.WebApp) {
                const webApp = window.Telegram.WebApp;
                
                // Сообщаем о готовности
                if (webApp.ready) webApp.ready();
                
                // Раскрываем на весь экран
                if (webApp.expand) webApp.expand();
                
                // Отключаем вертикальные свайпы
                if (webApp.disableVerticalSwipes) webApp.disableVerticalSwipes();
                
                // Устанавливаем цвет верхней панели
                if (webApp.setHeaderColor) webApp.setHeaderColor('#0a0a1a');
                if (webApp.setBackgroundColor) webApp.setBackgroundColor('#0a0a1a');
                
                return webApp;
            }
        } catch(e) {
            console.warn('Telegram WebApp not available:', e);
        }
        return null;
    },
    
    // Получение ID пользователя
    getUserId: function() {
        const webApp = window.KinoBredApp?.webApp;
        
        // Пробуем получить из Telegram
        if (webApp?.initDataUnsafe?.user?.id) {
            return webApp.initDataUnsafe.user.id.toString();
        }
        
        // Пробуем из localStorage
        try {
            let userId = localStorage.getItem('kb_user_id');
            if (userId) return userId;
        } catch(e) {}
        
        // Генерируем анонимный ID
        const anonId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        try {
            localStorage.setItem('kb_user_id', anonId);
        } catch(e) {}
        
        return anonId;
    },
    
    // Показ экрана
    showScreen: function(screenId) {
        document.querySelectorAll('.screen').forEach(function(screen) {
            screen.classList.add('hidden');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
        }
    },
    
    // Показ ошибки
    showError: function(message) {
        const errorEl = document.getElementById('error-msg');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
            
            setTimeout(function() {
                errorEl.classList.remove('show');
            }, 4000);
        }
    },
    
    // Показ попапа
    showPopup: function(message) {
        const popup = document.getElementById('share-popup');
        if (popup) {
            popup.textContent = message;
            popup.classList.remove('hidden');
            
            setTimeout(function() {
                popup.classList.add('hidden');
            }, 2000);
        }
    },
    
    // Копирование в буфер обмена
    copyToClipboard: function(text) {
        const textarea = document.createElement('textarea');
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
