/* ------------------------------------------------------------------
   Sistema de idiomas del sitio (Español / 한국어)

   Cada página incluye:
     - js/i18n.js          -> este archivo (lógica)
     - js/lang/<pagina>.js -> diccionario con las traducciones al coreano

   El español vive en el HTML y es la fuente de verdad. Al activar 한국어
   se reemplaza el contenido de los elementos marcados con data-i18n,
   data-i18n-text o data-i18n-content. Al volver a Español se restaura
   el contenido original guardado en memoria.
   ------------------------------------------------------------------ */
(function () {
    'use strict';

    var STORAGE_KEY = 'schonthal-lang';
    var page = (document.body && document.body.dataset.page) || 'index';
    var originals = new Map();
    var currentLang = 'es';

    function dictionary() {
        return (window.I18N && window.I18N[page]) || {};
    }

    function readStoredLang() {
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            return stored === 'ko' ? 'ko' : 'es';
        } catch (error) {
            return 'es';
        }
    }

    function saveLang(lang) {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (error) {
            /* Sin almacenamiento disponible: el idioma dura esta visita. */
        }
    }

    function collectOriginals() {
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            originals.set(el, el.innerHTML);
        });
        document.querySelectorAll('[data-i18n-text]').forEach(function (el) {
            originals.set(el, el.innerHTML);
        });
        document.querySelectorAll('[data-i18n-content]').forEach(function (el) {
            originals.set(el, el.getAttribute('content') || '');
        });
    }

    /* Reemplaza solo el texto visible, conservando iconos SVG e imágenes. */
    function replaceText(el, value) {
        var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
        var nodes = [];
        var node;
        while ((node = walker.nextNode())) {
            if (node.nodeValue && node.nodeValue.trim()) {
                nodes.push(node);
            }
        }
        if (!nodes.length) {
            return;
        }
        nodes[0].nodeValue = value;
        for (var i = 1; i < nodes.length; i += 1) {
            nodes[i].nodeValue = '';
        }
    }

    function translate(key, lang) {
        if (lang !== 'ko') {
            return null;
        }
        var dict = dictionary();
        return Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : null;
    }

    function apply(lang) {
        currentLang = lang === 'ko' ? 'ko' : 'es';
        document.documentElement.lang = currentLang;

        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var value = translate(el.getAttribute('data-i18n'), currentLang);
            el.innerHTML = value !== null ? value : originals.get(el);
        });

        document.querySelectorAll('[data-i18n-text]').forEach(function (el) {
            var value = translate(el.getAttribute('data-i18n-text'), currentLang);
            if (value !== null) {
                replaceText(el, value);
            } else {
                el.innerHTML = originals.get(el);
            }
        });

        document.querySelectorAll('[data-i18n-content]').forEach(function (el) {
            var value = translate(el.getAttribute('data-i18n-content'), currentLang);
            el.setAttribute('content', value !== null ? value : originals.get(el));
        });

        document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
            var isActive = btn.getAttribute('data-lang-btn') === currentLang;
            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        document.documentElement.classList.remove('i18n-loading');
        saveLang(currentLang);
    }

    /* Permite cambiar el idioma desde cualquier otro script. */
    window.setSiteLanguage = apply;
    window.getSiteLanguage = function () {
        return currentLang;
    };

    function init() {
        collectOriginals();
        document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                apply(btn.getAttribute('data-lang-btn'));
            });
        });
        apply(readStoredLang());
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
