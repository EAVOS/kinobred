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
                
                // Скрываем MainButton если есть
                if (webApp.MainButton) {
                    webApp.MainButton.hide();
                }
                
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
            return 'tg_' + webApp.initDataUnsafe.user.id;
        }
        
        // Пробуем из sessionStorage (работает в десктопе лучше)
        try {
            let userId = sessionStorage.getItem('kb_user_id');
            if (userId) return userId;
        } catch(e) {}
        
        // Пробуем из localStorage
        try {
            let userId = localStorage.getItem('kb_user_id');
            if (userId) return userId;
        } catch(e) {}
        
        // Генерируем анонимный ID
        const anonId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        
        // Сохраняем везде где можно
        try { sessionStorage.setItem('kb_user_id', anonId); } catch(e) {}
        try { localStorage.setItem('kb_user_id', anonId); } catch(e) {}
        
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
        
        // Скрываем MainButton при смене экрана
        try {
            if (window.Telegram?.WebApp?.MainButton) {
                window.Telegram.WebApp.MainButton.hide();
            }
        } catch(e) {}
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
        // Современный метод
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                return true;
            }).catch(function() {
                return false;
            });
        }
        
        // Fallback для старых браузеров
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
    },
    
    // Форматирование сообщения об ошибке от API
    formatAPIError: function(error) {
        if (!error) return 'Неизвестная ошибка';
        
        // Маппинг известных ошибок
        const errorMap = {
            'Слишком короткая история': 'Опишите ситуацию подробнее (минимум 10 символов)',
            'Неизвестный жанр': 'Выберите один из предложенных жанров',
            'Режиссёр ушёл в запой': 'Нейросеть временно недоступна. Попробуйте другой жанр или повторите позже.',
            'Киностудия перегружена': 'Слишком много запросов. Подождите минуту и попробуйте снова.',
            'Достигнут общий лимит': 'Достигнут дневной лимит фильмов. Приходите завтра!'
        };
        
        for (var key in errorMap) {
            if (error.indexOf(key) !== -1) {
                return errorMap[key];
            }
        }
        
        return error;
    }
};
