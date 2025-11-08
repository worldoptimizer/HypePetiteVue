/*!
 * HypePetiteVue v1.1.0
 * Copyright (c) 2025 Max Ziebell
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
     * Symbol state cache - stores scope state per symbol instance
     */
    const symbolStateCache = new Map();

    /**
     * Get symbol instance ID from element
     */
    function getSymbolInstanceId(element) {
        // Check if element or parent has hype_symbol_instance attribute
        let current = element;
        while (current) {
            if (current.getAttribute && current.getAttribute('hype_symbol_instance')) {
                return current.getAttribute('hype_symbol_instance');
            }
            current = current.parentElement;
        }
        return null;
    }

    /**
     * Create or restore symbol scope
     */
    function getOrCreateSymbolScope(symbolId, scopeFactory) {
        if (!symbolId) return null;

        if (!symbolStateCache.has(symbolId)) {
            // Create new scope for this symbol instance
            const newScope = typeof scopeFactory === 'function' ? scopeFactory() : scopeFactory || {};
            symbolStateCache.set(symbolId, newScope);
            console.log('[HypePetiteVue] Created new scope for symbol:', symbolId);
            return newScope;
        }

        console.log('[HypePetiteVue] Restored cached scope for symbol:', symbolId);
        return symbolStateCache.get(symbolId);
    }

    /**
     * HypePetiteVue - Extension for integrating Petite Vue with Tumult Hype
     */
    if (!window.HypePetiteVue) {
        window.HypePetiteVue = {
            version: '1.1.0',
            _petiteVueLoaded: false,
            _loadingPromise: null,
            symbolStateCache: symbolStateCache, // Expose for debugging

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
             * Clear cached state for a symbol (useful for reset)
             */
            clearSymbolState: function(symbolId) {
                if (symbolStateCache.has(symbolId)) {
                    symbolStateCache.delete(symbolId);
                    console.log('[HypePetiteVue] Cleared state for symbol:', symbolId);
                }
            },

            /**
             * Clear all cached symbol states
             */
            clearAllSymbolStates: function() {
                symbolStateCache.clear();
                console.log('[HypePetiteVue] Cleared all symbol states');
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

                // Create app with hypeDocument as scope
                // User can add properties/methods to hypeDocument in their HypeDocumentLoad
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

    // HypeSymbolLoad: Handle symbol-specific state caching
    window.HYPE_eventListeners.push({
        type: "HypeSymbolLoad",
        callback: function(hypeDocument, element, event) {
            const symbolInstance = event.symbolInstance;
            if (!symbolInstance) return;

            // Get or create unique ID for this symbol instance
            const symbolId = symbolInstance.symbolName() + '_' + symbolInstance.symbolInstanceId();

            // Store symbol ID on element for later retrieval
            element.setAttribute('data-symbol-id', symbolId);

            // Expose symbolInstance and cached state to hypeDocument
            // This allows v-scope to access persistent symbol state
            if (!hypeDocument.symbols) {
                hypeDocument.symbols = {};
            }

            // Create getter for this symbol's cached state
            Object.defineProperty(hypeDocument.symbols, symbolId, {
                get: function() {
                    return getOrCreateSymbolScope(symbolId, null);
                },
                configurable: true
            });

            console.log('[HypePetiteVue] Symbol loaded:', symbolId);
        }
    });

    // HypeSymbolUnload: Optional cleanup
    window.HYPE_eventListeners.push({
        type: "HypeSymbolUnload",
        callback: function(hypeDocument, element, event) {
            // State is preserved in cache - only clean up references
            const symbolId = element.getAttribute('data-symbol-id');
            if (symbolId && hypeDocument.symbols) {
                delete hypeDocument.symbols[symbolId];
            }
        }
    });

    console.log('[HypePetiteVue] Extension loaded, version:', window.HypePetiteVue.version);

})();
