// Основное приложение КиноБред
(function() {
    'use strict';
    
    const Utils = window.KinoBredUtils;
    const Config = window.KinoBredConfig;
    
    const app = {
        webApp: null,
        selectedGenre: 'timeloop',
        currentFilm: null,
        isLoading: false,
        loaderInterval: null,
        startTime: null,
        _shareText: null
    };
    
    window.KinoBredApp = app;
    
    const elements = {};
    
    function init() {
        app.webApp = Utils.initWebApp();
        cacheElements();
        setupEventListeners();
        loadStats();
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
        elements.storyInput.addEventListener('input', onStoryInput);
        
        elements.genreBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                selectGenre(btn.dataset.genre);
            });
        });
        
        elements.createBtn.addEventListener('click', createFilm);
        elements.shareBtn.addEventListener('click', shareFilm);
        elements.backBtn.addEventListener('click', goBack);
        
        elements.loaderTimer.addEventListener('click', function() {
            if (app.isLoading && app.startTime) {
                var elapsed = (Date.now() - app.startTime) / 1000;
                if (elapsed > 10) {
                    cancelLoading();
                    Utils.showError('Режиссёр задерживается. Попробуйте ещё раз.');
                    Utils.showScreen('home-screen');
                }
            }
        });
    }
    
    function onStoryInput() {
        var length = elements.storyInput.value.length;
        elements.charCount.textContent = length;
        elements.createBtn.disabled = length < 10;
    }
    
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
    
    function loadStats() {
        var callbackName = 'kb_stats_' + Date.now();
        
        window[callbackName] = function(data) {
            if (data && data.totalFilms !== undefined) {
                var statsText = '📊 Всего снято фильмов: ' + (data.totalFilms || 0);
                
                if (data.genres) {
                    var genres = [
                        { key: 'timeloop', emoji: '🌀' },
                        { key: 'absurd', emoji: '🤪' },
                        { key: 'noir', emoji: '🎭' }
                    ];
                    
                    var genreParts = genres.map(function(g) {
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
        
        var script = document.createElement('script');
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
    
    function startLoading() {
        app.isLoading = true;
        app.startTime = Date.now();
        
        var loaderTexts = [
            'Ищем локацию...',
            'Подбираем актёров...',
            'Пишем сценарий...',
            'Выставляем свет...',
            'Монтируем плёнку...',
            'Добавляем саундтрек...',
            'Почти готово...'
        ];
        
        var index = 0;
        elements.loaderText.textContent = loaderTexts[0];
        elements.loaderTimer.textContent = 'Обычно это занимает 5-10 секунд';
        
        app.loaderInterval = setInterval(function() {
            index = (index + 1) % loaderTexts.length;
            elements.loaderText.textContent = loaderTexts[index];
            
            if (app.startTime) {
                var elapsed = Math.floor((Date.now() - app.startTime) / 1000);
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
    
    function createFilm() {
        var story = elements.storyInput.value.trim();
        
        if (story.length < 10) {
            Utils.showError('Минимум 10 символов для сценария');
            return;
        }
        
        if (app.isLoading) return;
        
        Utils.showScreen('loader-screen');
        startLoading();
        
        var userId = Utils.getUserId();
        var callbackName = 'kb_film_' + Date.now();
        
        window[callbackName] = function(data) {
            cancelLoading();
            
            if (data && data.error) {
                Utils.showError(data.error);
                Utils.showScreen('home-screen');
                delete window[callbackName];
                return;
            }
            
            if (data && data.success) {
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
        
        var params = new URLSearchParams({
            action: 'create',
            story: story,
            genre: app.selectedGenre,
            userId: userId,
            callback: callbackName
        });
        
        var script = document.createElement('script');
        script.src = Config.GAS_URL + '?' + params.toString();
        script.onerror = function() {
            cancelLoading();
            Utils.showError('Киностудия перегружена. Попробуйте позже.');
            delete window[callbackName];
        };
        document.head.appendChild(script);
        
        setTimeout(function() {
            if (script.parentNode) script.parentNode.removeChild(script);
            delete window[callbackName];
        }, 15000);
    }
    
    function renderFilm(film) {
        var genreNames = {
            timeloop: '🌀 Временная петля',
            absurd: '🤪 Абсурдная комедия',
            noir: '🎭 Мрачный реализм'
        };
        
        elements.filmGenre.textContent = genreNames[app.selectedGenre] || film.genre || '';
        elements.filmTitle.textContent = film.title || 'БЕЗ НАЗВАНИЯ';
        elements.filmAnnotation.textContent = film.annotation || '';
        elements.filmSoundtrack.textContent = film.soundtrack || 'Атмосферное';
        elements.filmSlogan.textContent = film.slogan || 'Смотрите в кино';
        
        var card = document.querySelector('.film-card');
        if (card) {
            card.style.animation = 'none';
            card.offsetHeight;
            card.style.animation = 'fadeInUp 0.5s ease';
        }
    }
    
    function shareFilm() {
    if (!app.currentFilm) return;
    window.KinoBredShare.shareFilm(app.currentFilm, app.selectedGenre);
}

    function goBack() {
        elements.storyInput.value = '';
        elements.charCount.textContent = '0';
        elements.createBtn.disabled = true;
        app.currentFilm = null;
        app._shareText = null;
        
        Utils.showScreen('home-screen');
        
        setTimeout(function() {
            elements.storyInput.focus();
        }, 300);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
