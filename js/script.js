// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
        
mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Close mobile menu when clicking on a link
const mobileLinks = mobileMenu.querySelectorAll('a');
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Buscador de artículos
(function () {
    'use strict';

    const ARTICLES = [
        {
            url: 'infancia.html',
            title: 'Paint - LEE HEE-YOUNG',
            titleKo: '이희영의 《페인트》',
            category: 'Reseña y análisis',
            categoryKo: '리뷰와 분석',
            description: '¿La infancia siempre se entendió igual? De los «adultos en pequeño» a la escolarización obligatoria, a partir de Paint de Lee Hee-young.',
            descriptionKo: '어린 시절은 늘 같은 의미였을까요? 이희영의 《페인트》를 통해 ‘작은 어른’에서 의무 교육으로의 변화를 살펴봅니다.',
            keywords: 'paint lee hee-young lee hee young infancia ninez niñez aries philippe aries escuela escolarizacion escolarización ley 1420 educacion educación estado familia familias infancia como construccion historica 페인트 이희영 어린이 어린 시절 아동 교육 학교 역사 자누 신분 번호'
        },
        {
            url: 'hangul.html',
            title: 'Hangul - Alfabeto Coreano',
            titleKo: '한글 - 한국어 문자',
            category: 'Análisis y explicación de su origen',
            categoryKo: '기원 분석과 해설',
            description: 'El desarrollo del Hangul en 1443, bajo el rey Sejong, fue una revolución política, filosófica y pedagógica destinada a romper el monopolio del conocimiento.',
            descriptionKo: '1443년 세종대왕의 한글 창제는 지식의 독점을 깨뜨리기 위한 정치적·철학적·교육적 혁명이었습니다.',
            keywords: 'hangul hangeul alfabeto coreano corea sejong rey sejong las letras del rey pelicula película escritura lenguaje lengua 1443 hanja yangban budismo neoconfucianismo 나랏말싸미 신미 훈민정음 한글 알파벳 한국어 세종대왕 문자 언어 역사 영화'
        },
        {
            url: 'ficcion-historia.html',
            title: 'Ficción e Historia - Dictadura Argentina y Coreana',
            titleKo: '허구와 역사 - 아르헨티나와 한국의 독재',
            category: 'Ficción e Historia',
            categoryKo: '허구와 역사',
            description: 'Un cuento argentino, una novela coreana y una película: tres obras que miran los horrores de la dictadura argentina (1976-1983) y la masacre de Gwangju de 1980.',
            descriptionKo: '아르헨티나 단편 소설, 한국 소설, 그리고 영화: 세 작품이 아르헨티나 마지막 군사 독재(1976-1983)와 1980년 광주 학살의 참상을 바라봅니다.',
            keywords: 'ficcion ficción historia dictadura argentina coreana corea gwangju kwangju 1976 1983 1980 han kang infierno grande guillermo martinez el taxista memoria actos humanos cine literatura 소년이 온다 쇠와 피 택시운전사 허구 역사 독재 아르헨티나 한국 광주 한강 소설 영화 문학'
        }
    ];

    const normalize = function (value) {
        return String(value)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    ARTICLES.forEach(function (article) {
        article.searchText = normalize([
            article.title,
            article.titleKo,
            article.category,
            article.categoryKo,
            article.description,
            article.descriptionKo,
            article.keywords
        ].join(' '));
    });

    let modal = null;
    let input = null;
    let results = null;
    let hint = null;

    function getCopy() {
        const isKorean = window.getSiteLanguage && window.getSiteLanguage() === 'ko';
        return {
            isKorean: isKorean,
            label: isKorean ? '작품 검색' : 'Buscar artículos',
            placeholder: isKorean ? '작품 검색...' : 'Buscar artículos...',
            close: isKorean ? '검색 닫기' : 'Cerrar búsqueda',
            initial: isKorean
                ? '제목이나 주제어를 입력해 작품을 찾아보세요.'
                : 'Escribí una palabra clave para buscar entre los artículos.',
            empty: isKorean
                ? '검색 결과가 없습니다.'
                : 'No se encontraron artículos con esa búsqueda.'
        };
    }

    function buildModal() {
        if (modal) {
            return;
        }

        modal = document.createElement('div');
        modal.id = 'search-modal';
        modal.className = 'search-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Buscar artículos');
        modal.innerHTML = [
            '<div class="search-modal-backdrop" data-search-close></div>',
            '<div class="search-panel">',
            '    <div class="search-panel-header">',
            '        <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">',
            '            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />',
            '        </svg>',
            '        <input id="search-input" class="search-input" type="search" autocomplete="off" autocapitalize="off" spellcheck="false">',
            '        <button type="button" class="search-close" data-search-close>',
            '            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">',
            '                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />',
            '            </svg>',
            '        </button>',
            '    </div>',
            '    <div class="search-panel-body">',
            '        <p class="search-hint" id="search-hint"></p>',
            '        <ul class="search-results" id="search-results" aria-live="polite"></ul>',
            '    </div>',
            '</div>'
        ].join('');

        document.body.appendChild(modal);
        input = modal.querySelector('#search-input');
        results = modal.querySelector('#search-results');
        hint = modal.querySelector('#search-hint');

        input.addEventListener('input', renderResults);
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                const firstResult = results.querySelector('.search-result');
                if (firstResult) {
                    event.preventDefault();
                    firstResult.click();
                }
            }
        });
        modal.addEventListener('click', function (event) {
            if (event.target.closest('[data-search-close]')) {
                closeSearch();
            }
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && modal.classList.contains('is-open')) {
                closeSearch();
            }
        });
    }

    function renderResults() {
        const copy = getCopy();
        const query = input.value.trim();
        results.innerHTML = '';

        if (!query) {
            results.hidden = true;
            hint.hidden = false;
            hint.textContent = copy.initial;
            return;
        }

        const tokens = normalize(query).split(' ').filter(Boolean);
        const matches = ARTICLES.filter(function (article) {
            return tokens.every(function (token) {
                return article.searchText.indexOf(token) !== -1;
            });
        });

        if (!matches.length) {
            results.hidden = true;
            hint.hidden = false;
            hint.textContent = copy.empty;
            return;
        }

        hint.hidden = true;
        results.hidden = false;

        matches.forEach(function (article) {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.className = 'search-result';
            link.href = article.url;

            const meta = document.createElement('span');
            meta.className = 'search-result-meta';
            meta.textContent = copy.isKorean && article.categoryKo ? article.categoryKo : article.category;

            const title = document.createElement('span');
            title.className = 'search-result-title';
            title.textContent = copy.isKorean && article.titleKo ? article.titleKo : article.title;

            const description = document.createElement('span');
            description.className = 'search-result-desc';
            description.textContent = copy.isKorean && article.descriptionKo ? article.descriptionKo : article.description;

            link.appendChild(meta);
            link.appendChild(title);
            link.appendChild(description);
            li.appendChild(link);
            results.appendChild(li);
        });
    }

    function syncCopy() {
        const copy = getCopy();
        modal.setAttribute('aria-label', copy.label);
        input.placeholder = copy.placeholder;
        modal.querySelector('.search-close').setAttribute('aria-label', copy.close);
    }

    function openSearch() {
        buildModal();
        syncCopy();
        input.value = '';
        renderResults();
        modal.classList.add('is-open');
        document.body.classList.add('search-open');
        window.setTimeout(function () {
            input.focus();
        }, 0);
    }

    function closeSearch() {
        if (!modal) {
            return;
        }
        modal.classList.remove('is-open');
        document.body.classList.remove('search-open');
    }

    document.querySelectorAll('[data-search-open]').forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            openSearch();
        });
    });
})();