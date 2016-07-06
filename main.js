require.config({
    paths: {
        'domready'  : 'libraries/domReady.min',
        'jquery'    : 'libraries/jquery-2.1.4.min',
        'bootstrap' : 'libraries/bootstrap.min',
        'tether'    : 'libraries/tether.min'
    },

    shim: {
        'bootstrap': { deps: ['jquery', 'tether'] }
        /*'bootstrap/affix':      { deps: ['jquery'], exports: '$.fn.affix' },
        'bootstrap/alert':      { deps: ['jquery'], exports: '$.fn.alert' },
        'bootstrap/button':     { deps: ['jquery'], exports: '$.fn.button' },
        'bootstrap/carousel':   { deps: ['jquery'], exports: '$.fn.carousel' },
        'bootstrap/collapse':   { deps: ['jquery'], exports: '$.fn.collapse' },
        'bootstrap/dropdown':   { deps: ['jquery'], exports: '$.fn.dropdown' },
        'bootstrap/modal':      { deps: ['jquery'], exports: '$.fn.modal' },
        'bootstrap/popover':    { deps: ['jquery'], exports: '$.fn.popover' },
        'bootstrap/scrollspy':  { deps: ['jquery'], exports: '$.fn.scrollspy' },
        'bootstrap/tab':        { deps: ['jquery'], exports: '$.fn.tab'        },
        'bootstrap/tooltip':    { deps: ['jquery'], exports: '$.fn.tooltip' },
        'bootstrap/transition': { deps: ['jquery'], exports: '$.fn.transition' }*/
    },

    deps: ['EaselController']
});
