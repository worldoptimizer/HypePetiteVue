/*!
 * HypePetiteVue v1.1.0
 * Copyright (c) 2025
 * MIT License
 *
 * Integration layer for using Petite Vue with Tumult Hype
 * https://github.com/vuejs/petite-vue
 */

(function() {
    'use strict';

    // Configuration
    const PETITE_VUE_CDN = 'https://unpkg.com/petite-vue@0.4.1/dist/petite-vue.iife.js';

    /**
     * Inject CSS to hide unrendered Petite Vue content
     */
    function injectCloakStyles() {
        if (!document.getElementById('hype-petite-vue-cloak-styles')) {
            const style = document.createElement('style');
            style.id = 'hype-petite-vue-cloak-styles';
            style.textContent = `
                [v-cloak] {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    injectCloakStyles();

    /**
     * HypePetiteVue - Extension for integrating Petite Vue with Tumult Hype
     */
    if (!window.HypePetiteVue) {
        window.HypePetiteVue = {
            version: '1.1.0',
            _petiteVueLoaded: false,
            _loadingPromise: null,

            /**
             * Check if Petite Vue is already loaded
             */
            _checkExistingPetiteVue: function() {
                if (typeof window.PetiteVue !== 'undefined') {
                    this._petiteVueLoaded = true;
                    return true;
                }
                return false;
            },

            /**
             * Load Petite Vue library
             */
            loadPetiteVue: function(customUrl) {
                // Check if already loaded by user
                if (this._checkExistingPetiteVue()) {
                    console.log('[HypePetiteVue] Using pre-loaded Petite Vue');
                    return Promise.resolve();
                }

                if (this._petiteVueLoaded) {
                    return Promise.resolve();
                }

                if (this._loadingPromise) {
                    return this._loadingPromise;
                }

                this._loadingPromise = new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = customUrl || PETITE_VUE_CDN;
                    script.onload = () => {
                        this._petiteVueLoaded = true;
                        console.log('[HypePetiteVue] Petite Vue loaded from CDN');
                        resolve();
                    };
                    script.onerror = () => {
                        reject(new Error('Failed to load Petite Vue'));
                    };
                    document.head.appendChild(script);
                });

                return this._loadingPromise;
            },

            /**
             * Get Petite Vue global
             */
            getPetiteVue: function() {
                return window.PetiteVue;
            },

            /**
             * Wait for Petite Vue to be ready
             */
            ready: function() {
                return this.loadPetiteVue();
            }
        };
    }

    /**
     * Hype Event Listeners
     */
    if ("HYPE_eventListeners" in window === false) {
        window.HYPE_eventListeners = [];
    }

    // HypeDocumentLoad: Load Petite Vue and create app
    window.HYPE_eventListeners.push({
        type: "HypeDocumentLoad",
        callback: function(hypeDocument, element, event) {
            if (window.HypePetiteVueAutoInit === false) {
                return;
            }

            HypePetiteVue.loadPetiteVue().then(() => {
                // Call user's custom HypeDocumentLoad if it exists
                if (typeof hypeDocument.functions !== 'undefined' &&
                    typeof hypeDocument.functions().HypeDocumentLoad === 'function') {
                    hypeDocument.functions().HypeDocumentLoad(hypeDocument, element, event);
                }

                // Create app - pass hypeDocument which user may have modified in their HypeDocumentLoad
                hypeDocument.$app = window.PetiteVue.createApp(hypeDocument);
                console.log('[HypePetiteVue] App created for document');
            });
        }
    });

    // HypeScenePrepareForDisplay: Mount the app
    window.HYPE_eventListeners.push({
        type: "HypeScenePrepareForDisplay",
        callback: function(hypeDocument, element, event) {
            if (hypeDocument.$app) {
                console.log('[HypePetiteVue] Mounting app');
                hypeDocument.$app.mount(element);
            }
        }
    });

    // HypeSceneUnload: Unmount and clean up
    window.HYPE_eventListeners.push({
        type: "HypeSceneUnload",
        callback: function(hypeDocument, element, event) {
            if (hypeDocument.$app) {
                console.log('[HypePetiteVue] Unmounting app');
                hypeDocument.$app.unmount();

                // Clone and replace to reset for next visit
                element.parentNode.replaceChild(element.cloneNode(true), element);
            }
        }
    });

    console.log('[HypePetiteVue] Extension loaded, version:', window.HypePetiteVue.version);

})();
