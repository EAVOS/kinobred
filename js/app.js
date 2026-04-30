(function() {
    'use strict';
    
    var Utils = window.KinoBredUtils;
    var Config = window.KinoBredConfig;
    
    var app = {
        webApp: null,
        selectedGenre: 'timeloop',
        currentFilm: null,
        isLoading: false,
        loaderInterval: null,
        startTime: null
    };
    
    window.KinoBredApp = app;
    
    var elements = {};
    
    function init() {
    app.webApp = Utils.getWebApp();
    // expand вызываем ОДИН раз с задержкой
    setTimeout(function() {
        try { if (app.webApp.expand) app.webApp.expand(); } catch(e) {}
    }, 100);
    
    cacheElements();
    setupEventListeners();
    loadStats();
    Utils.showScreen('home-screen');
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
        
        console.log('Elements cached:', elements);
    }
    
    function setupEventListeners() {
        if (elements.storyInput) {
            elements.storyInput.addEventListener('input', onStoryInput);
        }
        
        if (elements.genreBtns) {
            elements.genreBtns.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    selectGenre(btn.dataset.genre);
                });
            });
        }
        
        if (elements.createBtn) {
            elements.createBtn.addEventListener('click', createFilm);
        }
        if (elements.shareBtn) {
            elements.shareBtn.addEventListener('click', shareFilm);
        }
        if (elements.backBtn) {
            elements.backBtn.addEventListener('click', goBack);
        }
        // Находим кнопку подписки и вешаем на неё событие
var subscribeBtn = document.getElementById('subscribe-btn');
if (subscribeBtn) {
    subscribeBtn.addEventListener('click', function() {
        // Формируем ссылку на канал
        var channelUrl = 'https://t.me/KinoBredLab';
        
        // Пробуем открыть ссылку через WebApp (для мобильных) или в новой вкладке (для ПК)
        var webApp = window.KinoBredUtils.getWebApp();
        if (webApp && webApp.openTelegramLink) {
            webApp.openTelegramLink(channelUrl);
        } else {
            window.open(channelUrl, '_blank');
        }
    });
}
    }
    
    function onStoryInput() {
        if (!elements.storyInput || !elements.charCount || !elements.createBtn) return;
        var length = elements.storyInput.value.length;
        elements.charCount.textContent = length;
        elements.createBtn.disabled = length < 10;
    }
    
    function selectGenre(genre) {
        app.selectedGenre = genre;
        elements.genreBtns.forEach(function(btn) {
            btn.classList.toggle('selected', btn.dataset.genre === genre);
        });
    }
    
    function loadStats() {
        var cb = 'kb_stats_' + Date.now();
        window[cb] = function(data) {
            if (data && data.totalFilms !== undefined && elements.statsSection) {
                var text = '📊 Всего снято фильмов: ' + (data.totalFilms || 0);
                if (data.genres) {
                    text += '\n🌀 ' + (data.genres.timeloop || 0);
                    text += ' • 🤪 ' + (data.genres.absurd || 0);
                    text += ' • 🎭 ' + (data.genres.noir || 0);
                }
                elements.statsSection.textContent = text;
            }
            delete window[cb];
        };
        var s = document.createElement('script');
        s.src = Config.GAS_URL + '?action=stats&callback=' + cb;
        document.head.appendChild(s);
    }
    
    function startLoading() {
        app.isLoading = true;
        app.startTime = Date.now();
        var texts = ['Ищем локацию...', 'Подбираем актёров...', 'Пишем сценарий...', 'Выставляем свет...', 'Монтируем...'];
        var i = 0;
        if (elements.loaderText) elements.loaderText.textContent = texts[0];
        app.loaderInterval = setInterval(function() {
            i = (i + 1) % texts.length;
            if (elements.loaderText) elements.loaderText.textContent = texts[i];
        }, 1200);
    }
    
    function cancelLoading() {
        app.isLoading = false;
        app.startTime = null;
        if (app.loaderInterval) { clearInterval(app.loaderInterval); app.loaderInterval = null; }
    }
    
    function createFilm() {
        var story = elements.storyInput.value.trim();
        if (story.length < 10) { Utils.showError('Минимум 10 символов'); return; }
        if (app.isLoading) return;
        
        Utils.showScreen('loader-screen');
        startLoading();
        
        var userId = Utils.getUserId();
        var cb = 'kb_film_' + Date.now();
        
        window[cb] = function(data) {
            cancelLoading();
            if (data && data.success) {
                app.currentFilm = data;
                renderFilm(data);
                Utils.showScreen('result-screen');
                loadStats();
            } else {
                Utils.showError(data?.error || 'Не удалось создать фильм');
                Utils.showScreen('home-screen');
            }
            delete window[cb];
        };
        
        var params = new URLSearchParams({ action: 'create', story: story, genre: app.selectedGenre, userId: userId, callback: cb });
        var s = document.createElement('script');
        s.src = Config.GAS_URL + '?' + params.toString();
        s.onerror = function() { cancelLoading(); Utils.showError('Ошибка сети'); delete window[cb]; };
        document.head.appendChild(s);
    }
    
    function renderFilm(film) {
        var names = { timeloop: '🌀 Временная петля', absurd: '🤪 Абсурдная комедия', noir: '🎭 Мрачный реализм' };
        if (elements.filmGenre) elements.filmGenre.textContent = names[app.selectedGenre] || '';
        if (elements.filmTitle) elements.filmTitle.textContent = film.title || 'БЕЗ НАЗВАНИЯ';
        if (elements.filmAnnotation) elements.filmAnnotation.textContent = film.annotation || '';
        if (elements.filmSoundtrack) elements.filmSoundtrack.textContent = film.soundtrack || '';
        if (elements.filmSlogan) elements.filmSlogan.textContent = film.slogan || '';
    }
    
    function shareFilm() {
        if (!app.currentFilm) return;
        if (window.KinoBredShare) {
            window.KinoBredShare.shareFilm(app.currentFilm, app.selectedGenre);
        }
    }
    
    function goBack() {
        if (elements.storyInput) elements.storyInput.value = '';
        if (elements.charCount) elements.charCount.textContent = '0';
        if (elements.createBtn) elements.createBtn.disabled = true;
        app.currentFilm = null;
        Utils.showScreen('home-screen');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
