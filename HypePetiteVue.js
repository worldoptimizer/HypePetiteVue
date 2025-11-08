/*!
 * HypePetiteVue v1.0.1
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
     * Prevents FOUC (Flash of Unstyled Content) before Petite Vue mounts
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

    // Inject cloak styles immediately
    injectCloakStyles();

    /**
     * HypePetiteVue - Extension for integrating Petite Vue with Tumult Hype
     * @namespace
     */
    if (!window.HypePetiteVue) {
        window.HypePetiteVue = {
            version: '1.0.1',
            _petiteVueLoaded: false,
            _loadingPromise: null,
            _pendingMounts: new Map(), // Track scenes waiting to mount

            /**
             * Load Petite Vue library dynamically
             * @param {string} customUrl - Optional custom CDN URL
             * @returns {Promise} Promise that resolves when library is loaded
             */
            loadPetiteVue: function(customUrl) {
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
                        console.log('[HypePetiteVue] Petite Vue loaded successfully');

                        // Process any pending mounts
                        this._processPendingMounts();
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
             * Process pending mounts that were queued before Petite Vue loaded
             * @private
             */
            _processPendingMounts: function() {
                console.log('[HypePetiteVue] Processing pending mounts:', this._pendingMounts.size);
                this._pendingMounts.forEach((element, hypeDocument) => {
                    this._mountApp(hypeDocument, element);
                });
                this._pendingMounts.clear();
            },

            /**
             * Create and mount Petite Vue app for a Hype document
             * @private
             */
            _mountApp: function(hypeDocument, element) {
                if (!hypeDocument.$app) {
                    console.error('[HypePetiteVue] App not initialized for document');
                    return;
                }

                console.log('[HypePetiteVue] Mounting app on scene container');
                hypeDocument.$app.mount(element);
            },

            /**
             * Initialize Petite Vue app for a Hype document
             * Called once per document in HypeDocumentLoad
             * @param {Object} hypeDocument - The Hype document object
             * @returns {Promise} Promise that resolves when initialized
             */
            initDocument: function(hypeDocument) {
                return this.loadPetiteVue().then(() => {
                    // Call user's custom HypeDocumentLoad if it exists
                    if (typeof hypeDocument.functions !== 'undefined' &&
                        typeof hypeDocument.functions().HypeDocumentLoad === 'function') {
                        hypeDocument.functions().HypeDocumentLoad(hypeDocument, null, null);
                    }

                    // Create the app once per document
                    // The app is passed the hypeDocument as its scope
                    hypeDocument.$app = window.PetiteVue.createApp(hypeDocument);
                    console.log('[HypePetiteVue] App created for document:', hypeDocument.documentId());
                });
            },

            /**
             * Mount app on scene display
             * @param {Object} hypeDocument - The Hype document object
             * @param {HTMLElement} element - The scene container element
             */
            mountScene: function(hypeDocument, element) {
                if (!this._petiteVueLoaded) {
                    // Queue this mount for when Petite Vue loads
                    console.log('[HypePetiteVue] Petite Vue not loaded yet, queuing mount');
                    this._pendingMounts.set(hypeDocument, element);
                    return;
                }

                this._mountApp(hypeDocument, element);
            },

            /**
             * Unmount app and clean up scene
             * CRITICAL: Clone and replace element so Hype can restore innerHTML on next visit
             * @param {Object} hypeDocument - The Hype document object
             * @param {HTMLElement} element - The scene container element
             */
            unmountScene: function(hypeDocument, element) {
                if (!hypeDocument.$app) {
                    return;
                }

                console.log('[HypePetiteVue] Unmounting app from scene');
                hypeDocument.$app.unmount();

                // CRITICAL: Clone and replace the element to reset it
                // This allows Hype to restore the original innerHTML when the scene is revisited
                element.parentNode.replaceChild(element.cloneNode(true), element);
            },

            /**
             * Helper to wait for Petite Vue to be ready
             * @returns {Promise} Promise that resolves when Petite Vue is loaded
             */
            ready: function() {
                return this.loadPetiteVue();
            },

            /**
             * Get the Petite Vue global object
             * @returns {Object} PetiteVue global object
             */
            getPetiteVue: function() {
                return window.PetiteVue;
            }
        };
    }

    /**
     * Hype Event Listeners
     */
    if ("HYPE_eventListeners" in window === false) {
        window.HYPE_eventListeners = [];
    }

    // HypeDocumentLoad: Initialize the app once per document
    window.HYPE_eventListeners.push({
        type: "HypeDocumentLoad",
        callback: function(hypeDocument, element, event) {
            if (window.HypePetiteVueAutoInit !== false) {
                HypePetiteVue.initDocument(hypeDocument);
            }
        }
    });

    // HypeScenePrepareForDisplay: Mount the app on the scene
    window.HYPE_eventListeners.push({
        type: "HypeScenePrepareForDisplay",
        callback: function(hypeDocument, element, event) {
            HypePetiteVue.mountScene(hypeDocument, element);
        }
    });

    // HypeSceneUnload: Unmount and clean up
    window.HYPE_eventListeners.push({
        type: "HypeSceneUnload",
        callback: function(hypeDocument, element, event) {
            HypePetiteVue.unmountScene(hypeDocument, element);
        }
    });

    console.log('[HypePetiteVue] Extension loaded, version:', window.HypePetiteVue.version);

})();
