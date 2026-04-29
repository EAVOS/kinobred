// Основное приложение КиноБред
(function() {
    'use strict';
    
    // Инициализация
    const Utils = window.KinoBredUtils;
    const Config = window.KinoBredConfig;
    
    const app = {
        webApp: null,
        selectedGenre: 'timeloop',
        currentFilm: null,
        isLoading: false,
        loaderInterval: null,
        startTime: null
    };
    
    // Сохраняем в глобальную область
    window.KinoBredApp = app;
    
    // DOM элементы
    const elements = {};
    
    // Инициализация при загрузке
    function init() {
        // Инициализируем WebApp
        app.webApp = Utils.initWebApp();
        
        // Кэшируем DOM элементы
        cacheElements();
        
        // Настраиваем обработчики событий
        setupEventListeners();
        
        // Загружаем статистику
        loadStats();
        
        // Показываем главный экран
        Utils.showScreen('home-screen');
        
        console.log('🎬 КиноБред v1.0 инициализирован');
    }
    
    function cacheElements() {
        elements.storyInput = document.getElementById('story-input');
        elements.charCount = document.getElementById('char-count');
        elements.createBtn = document.getElementById('create-btn');
        elements.genreBtns = document.querySelectorAll('.genre-btn');
        elements.errorMsg = document.getElementById('error-msg');
        elements.statsSection = document.getElementById('stats-section');
        elements.loaderText = document.getElementById('loader-text');
        elements.loaderTimer = document.getElementById('loader-timer');
        elements.filmGenre = document.getElementById('film-genre');
        elements.filmTitle = document.getElementById('film-title');
        elements.filmAnnotation = document.getElementById('film-annotation');
        elements.filmSoundtrack = document.getElementById('film-soundtrack');
        elements.filmSlogan = document.getElementById('film-slogan');
        elements.shareBtn = document.getElementById('share-btn');
        elements.backBtn = document.getElementById('back-btn');
    }
    
    function setupEventListeners() {
        // Ввод текста
        elements.storyInput.addEventListener('input', onStoryInput);
        
        // Выбор жанра
        elements.genreBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                selectGenre(btn.dataset.genre);
            });
        });
        
        // Кнопка создания
        elements.createBtn.addEventListener('click', createFilm);
        
        // Шаринг
        elements.shareBtn.addEventListener('click', shareFilm);
        
        // Назад
        elements.backBtn.addEventListener('click', goBack);
        
        // Обработка таймаута загрузки
        elements.loaderTimer.addEventListener('click', function() {
            if (app.isLoading && app.startTime) {
                const elapsed = (Date.now() - app.startTime) / 1000;
                if (elapsed > 10) {
                    cancelLoading();
                    Utils.showError('Режиссёр задерживается. Попробуйте ещё раз.');
                    Utils.showScreen('home-screen');
                }
            }
        });
    }
    
    // Обработка ввода текста
    function onStoryInput() {
        const length = elements.storyInput.value.length;
        elements.charCount.textContent = length;
        
        // Активируем кнопку при 10+ символах
        elements.createBtn.disabled = length < 10;
    }
    
    // Выбор жанра
    function selectGenre(genre) {
        app.selectedGenre = genre;
        
        elements.genreBtns.forEach(function(btn) {
            if (btn.dataset.genre === genre) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }
    
    // Загрузка статистики
    function loadStats() {
        const callbackName = 'kb_stats_' + Date.now();
        
        window[callbackName] = function(data) {
            if (data && data.totalFilms !== undefined) {
                let statsText = '📊 Всего снято фильмов: ' + (data.totalFilms || 0);
                
                if (data.genres) {
                    const genres = [
                        { key: 'timeloop', emoji: '🌀' },
                        { key: 'absurd', emoji: '🤪' },
                        { key: 'noir', emoji: '🎭' }
                    ];
                    
                    const genreParts = genres.map(function(g) {
                        return g.emoji + ' ' + (data.genres[g.key] || 0);
                    });
                    
                    if (genreParts.length > 0) {
                        statsText += '\n' + genreParts.join(' • ');
                    }
                }
                
                if (data.uniqueUsersToday) {
                    statsText += '\n👥 Сегодня: ' + data.uniqueUsersToday + ' режиссёров';
                }
                
                elements.statsSection.textContent = statsText;
            }
            
            delete window[callbackName];
        };
        
        // Используем JSONP для обхода CORS
        const script = document.createElement('script');
        script.src = Config.GAS_URL + '?action=stats&callback=' + callbackName;
        script.onerror = function() {
            elements.statsSection.textContent = '📊 Статистика временно недоступна';
            delete window[callbackName];
        };
        document.head.appendChild(script);
        setTimeout(function() {
            if (script.parentNode) script.parentNode.removeChild(script);
        }, 5000);
    }
    
    // Анимация загрузки
    function startLoading() {
        app.isLoading = true;
        app.startTime = Date.now();
        
        const loaderTexts = [
            'Ищем локацию...',
            'Подбираем актёров...',
            'Пишем сценарий...',
            'Выставляем свет...',
            'Монтируем плёнку...',
            'Добавляем саундтрек...',
            'Почти готово...'
        ];
        
        let index = 0;
        elements.loaderText.textContent = loaderTexts[0];
        elements.loaderTimer.textContent = 'Обычно это занимает 5-10 секунд';
        
        app.loaderInterval = setInterval(function() {
            index = (index + 1) % loaderTexts.length;
            elements.loaderText.textContent = loaderTexts[index];
            
            // Обновляем таймер
            if (app.startTime) {
                const elapsed = Math.floor((Date.now() - app.startTime) / 1000);
                if (elapsed > 5) {
                    elements.loaderTimer.textContent = 'Нейросеть думает... прошло ' + elapsed + ' сек';
                }
            }
        }, 1200);
    }
    
    function cancelLoading() {
        app.isLoading = false;
        app.startTime = null;
        
        if (app.loaderInterval) {
            clearInterval(app.loaderInterval);
            app.loaderInterval = null;
        }
    }
    
    // Создание фильма
    function createFilm() {
    const story = elements.storyInput.value.trim();
    
    if (story.length < 10) {
        Utils.showError('Минимум 10 символов для сценария');
        return;
    }
    
    if (app.isLoading) return;
    
    Utils.showScreen('loader-screen');
    startLoading();
    
    const userId = Utils.getUserId();
    
    // Используем JSONP для обхода CORS
    const callbackName = 'kb_film_' + Date.now();
    
    window[callbackName] = function(data) {
        cancelLoading();
        
        if (data.error) {
            Utils.showError(data.error);
            Utils.showScreen('home-screen');
            delete window[callbackName];
            return;
        }
        
        if (data.success) {
            app.currentFilm = data;
            renderFilm(data);
            Utils.showScreen('result-screen');
            loadStats();
        } else {
            Utils.showError('Не удалось создать фильм');
            Utils.showScreen('home-screen');
        }
        
        delete window[callbackName];
    };
    
    // Формируем URL для JSONP
    const params = new URLSearchParams({
        action: 'create',
        story: story,
        genre: app.selectedGenre,
        userId: userId,
        callback: callbackName
    });
    
    const script = document.createElement('script');
    script.src = Config.GAS_URL + '?' + params.toString();
    script.onerror = function() {
        cancelLoading();
        Utils.showError('Киностудия перегружена. Попробуйте позже.');
        delete window[callbackName];
    };
    document.head.appendChild(script);
    
    setTimeout(function() {
        if (script.parentNode) script.parentNode.removeChild(script);
    }, 15000);
}
    
    // Отрисовка результата
    function renderFilm(film) {
        const genreNames = {
            timeloop: '🌀 Временная петля',
            absurd: '🤪 Абсурдная комедия',
            noir: '🎭 Мрачный реализм'
        };
        
        elements.filmGenre.textContent = genreNames[app.selectedGenre] || film.genre || '';
        elements.filmTitle.textContent = film.title || 'БЕЗ НАЗВАНИЯ';
        elements.filmAnnotation.textContent = film.annotation || '';
        elements.filmSoundtrack.textContent = film.soundtrack || 'Атмосферное';
        elements.filmSlogan.textContent = film.slogan || 'Смотрите в кино';
        
        // Анимация появления карточки
        const card = document.querySelector('.film-card');
        if (card) {
            card.style.animation = 'none';
            card.offsetHeight; // Триггер reflow
            card.style.animation = 'fadeInUp 0.5s ease';
        }
    }
    
    // Шаринг
function shareFilm() {
    if (!app.currentFilm) return;
    
    var film = app.currentFilm;
    var webApp = window.Telegram && window.Telegram.WebApp;
    
    var shareText = '🎬 ' + (film.title || 'Мой фильм') + '\n\n' +
        (film.annotation || '') + '\n\n' +
        '🎵 Саундтрек: ' + (film.soundtrack || '') + '\n' +
        '⭐️ Слоган: ' + (film.slogan || '') + '\n\n' +
        'Сними свой фильм: https://t.me/' + Config.BOT_USERNAME;
    
    // Способ 1: Прямая ссылка шаринга (самый надёжный)
    var shareUrl = 'https://t.me/share/url?text=' + encodeURIComponent(shareText);
    
    if (webApp && webApp.openTelegramLink) {
        try {
            webApp.openTelegramLink(shareUrl);
            return;
        } catch(e) {
            console.log('openTelegramLink failed:', e);
        }
    }
    
    // Способ 2: Запасной — копирование в буфер
    try {
        navigator.clipboard.writeText(shareText).then(function() {
            if (webApp && webApp.showPopup) {
                webApp.showPopup({
                    title: '📋 Скопировано!',
                    message: 'Текст скопирован. Вставьте его в любой чат.',
                    buttons: [{type: 'ok'}]
                });
            } else {
                Utils.showPopup('✅ Текст скопирован! Отправьте в любой чат');
            }
        });
    } catch(e) {
        Utils.copyToClipboard(shareText);
        Utils.showPopup('✅ Текст скопирован! Отправьте в любой чат');
    }
}

    
// Показ кнопок шаринга
function showShareButtons(shareText) {
    // Скрываем обычные кнопки
    document.getElementById('share-btn').classList.add('hidden');
    document.getElementById('back-btn').classList.add('hidden');
    
    // Показываем блок с кнопками шаринга
    const shareBlock = document.getElementById('share-buttons-block');
    if (shareBlock) {
        shareBlock.classList.remove('hidden');
    }
    
    // Сохраняем текст для шаринга
    app._shareText = shareText;
}

// Скрытие кнопок шаринга
function hideShareButtons() {
    document.getElementById('share-btn').classList.remove('hidden');
    document.getElementById('back-btn').classList.remove('hidden');
    
    const shareBlock = document.getElementById('share-buttons-block');
    if (shareBlock) {
        shareBlock.classList.add('hidden');
    }
}

// Отправка в Telegram
function shareToTelegram() {
    if (!app._shareText) return;
    
    // Пробуем через WebApp API
    if (app.webApp && app.webApp.openTelegramLink) {
        try {
            // Правильный формат для шаринга
            app.webApp.openTelegramLink('https://t.me/share/url?text=' + encodeURIComponent(app._shareText));
            return;
        } catch(e) {
            console.log('Method 1 failed:', e);
        }
    }
    
    // Fallback: пробуем через window.open
    try {
        window.open('https://t.me/share/url?text=' + encodeURIComponent(app._shareText), '_blank');
        return;
    } catch(e) {
        console.log('Method 2 failed:', e);
    }
    
    // Последний fallback: копируем
    copyToClipboard();
}

// Копирование в буфер
function copyToClipboard() {
    if (!app._shareText) return;
    
    const copied = Utils.copyToClipboard(app._shareText);
    
    if (copied) {
        Utils.showPopup('✅ Текст скопирован! Отправьте в любой чат');
    } else {
        Utils.showPopup('📋 Не удалось скопировать. Попробуйте ещё раз.');
    }
}

// Подписка на канал
function subscribeToChannel() {
    var channelUrl = 'https://t.me/FairChoiceLab';
    
    if (app.webApp && typeof app.webApp.openTelegramLink === 'function') {
        try {
            app.webApp.openTelegramLink(channelUrl);
            return;
        } catch(e) {}
    }
    
    window.open(channelUrl, '_blank');
}
    
    // Возврат на главный экран
    function goBack() {
        elements.storyInput.value = '';
        elements.charCount.textContent = '0';
        elements.createBtn.disabled = true;
        app.currentFilm = null;
        
        Utils.showScreen('home-screen');
        
        // Фокус на поле ввода
        setTimeout(function() {
            elements.storyInput.focus();
        }, 300);
    }
    
    // Запуск приложения
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
