/*!
 * HypePetiteVue v1.0.2
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
                .hype-petite-vue-loading {
                    visibility: hidden !important;
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
            version: '1.0.2',
            _petiteVueLoaded: false,
            _loadingPromise: null,
            _pendingMounts: new Map(), // Track scenes waiting to mount
            _documentContainers: new Map(), // Track document containers for FOUC prevention

            /**
             * Check if Petite Vue is already loaded in the page
             * @private
             * @returns {boolean} True if Petite Vue is already available
             */
            _checkExistingPetiteVue: function() {
                if (typeof window.PetiteVue !== 'undefined' && !this._petiteVueLoaded) {
                    console.log('[HypePetiteVue] Petite Vue already loaded, using existing instance');
                    this._petiteVueLoaded = true;
                    return true;
                }
                return false;
            },

            /**
             * Hide Hype document container during loading to prevent FOUC
             * @private
             * @param {string} documentId - The Hype document ID
             * @param {HTMLElement} container - The document container element
             */
            _hideDocumentContainer: function(documentId, container) {
                if (!this._petiteVueLoaded && container && !container.classList.contains('hype-petite-vue-loading')) {
                    console.log('[HypePetiteVue] Hiding document container to prevent FOUC:', documentId);
                    container.classList.add('hype-petite-vue-loading');
                    this._documentContainers.set(documentId, container);
                }
            },

            /**
             * Show Hype document container after mounting completes
             * @private
             * @param {string} documentId - The Hype document ID
             */
            _showDocumentContainer: function(documentId) {
                const container = this._documentContainers.get(documentId);
                if (container) {
                    console.log('[HypePetiteVue] Showing document container:', documentId);
                    container.classList.remove('hype-petite-vue-loading');
                    this._documentContainers.delete(documentId);
                }
            },

            /**
             * Load Petite Vue library dynamically
             * @param {string} customUrl - Optional custom CDN URL
             * @returns {Promise} Promise that resolves when library is loaded
             */
            loadPetiteVue: function(customUrl) {
                // Check if already loaded (either by us or by user)
                if (this._checkExistingPetiteVue()) {
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
                        console.log('[HypePetiteVue] Petite Vue loaded successfully from CDN');

                        // Process any pending mounts
                        this._processPendingMounts();
                        resolve();
                    };
                    script.onerror = () => {
                        reject(new Error('Failed to load Petite Vue from CDN'));
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
                this._pendingMounts.forEach((data, hypeDocument) => {
                    this._mountApp(hypeDocument, data.element);
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

                // Show the document container now that mounting is complete
                this._showDocumentContainer(hypeDocument.documentId());
            },

            /**
             * Initialize Petite Vue app for a Hype document
             * Called once per document in HypeDocumentLoad
             * @param {Object} hypeDocument - The Hype document object
             * @param {HTMLElement} element - The document container element
             * @returns {Promise} Promise that resolves when initialized
             */
            initDocument: function(hypeDocument, element) {
                // Check for existing Petite Vue before attempting to load
                this._checkExistingPetiteVue();

                // Hide document container if we need to load Petite Vue
                if (!this._petiteVueLoaded && element) {
                    this._hideDocumentContainer(hypeDocument.documentId(), element);
                }

                return this.loadPetiteVue().then(() => {
                    // Call user's custom HypeDocumentLoad if it exists
                    if (typeof hypeDocument.functions !== 'undefined' &&
                        typeof hypeDocument.functions().HypeDocumentLoad === 'function') {
                        hypeDocument.functions().HypeDocumentLoad(hypeDocument, element, null);
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
                    this._pendingMounts.set(hypeDocument, { element: element });
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
                HypePetiteVue.initDocument(hypeDocument, element);
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
