/*!
 * HypePetiteVue v1.0.0
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
    const PETITE_VUE_ES_CDN = 'https://unpkg.com/petite-vue@0.4.1/dist/petite-vue.es.js';

    /**
     * HypePetiteVue - Extension for integrating Petite Vue with Tumult Hype
     * @namespace
     */
    if (!window.HypePetiteVue) {
        window.HypePetiteVue = {
            version: '1.0.0',
            instances: new Map(),
            stores: {},
            components: {},
            _petiteVueLoaded: false,
            _loadingPromise: null,
            _globalAppMounted: false,

            /**
             * Initialize HypePetiteVue for a Hype document
             * @param {Object} hypeDocument - The Hype document object
             * @param {Object} element - The HTML element
             * @param {Object} event - The event object
             * @returns {Promise} Promise that resolves when Petite Vue is initialized
             */
            init: function(hypeDocument, element, event) {
                const docId = hypeDocument.documentId();

                return this.loadPetiteVue().then(() => {
                    // Delay mounting to allow other HypeDocumentLoad callbacks to register stores/components
                    setTimeout(() => {
                        this._autoMount();
                    }, 50);

                    console.log('[HypePetiteVue] Initialized for document:', docId);
                    return this;
                });
            },

            /**
             * Auto-mount Petite Vue if not already mounted
             * @private
             */
            _autoMount: function() {
                if (typeof PetiteVue !== 'undefined' && !this._globalAppMounted) {
                    console.log('[HypePetiteVue] Auto-mounting Petite Vue globally');

                    // Create app with stores and components if they exist
                    const appConfig = {};
                    if (Object.keys(this.stores).length > 0) {
                        appConfig.$store = this.stores;
                    }
                    Object.assign(appConfig, this.components);

                    PetiteVue.createApp(appConfig).mount();
                    this._globalAppMounted = true;
                    console.log('[HypePetiteVue] Petite Vue mounted and processing v-scope directives');
                }
            },

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
             * Create a Petite Vue app for a specific element
             * @param {Object} config - Configuration object with scope data and components
             * @param {HTMLElement} mountElement - Optional element to mount on (defaults to document)
             * @returns {Promise} Promise that resolves with the created app
             */
            createApp: function(config, mountElement) {
                return this.loadPetiteVue().then(() => {
                    if (typeof PetiteVue === 'undefined') {
                        throw new Error('PetiteVue is not available');
                    }

                    // Merge stores if they exist
                    const appConfig = Object.assign({}, config);
                    if (Object.keys(this.stores).length > 0) {
                        appConfig.$store = this.stores;
                    }

                    // Merge components if they exist
                    if (Object.keys(this.components).length > 0) {
                        Object.assign(appConfig, this.components);
                    }

                    const app = PetiteVue.createApp(appConfig);

                    if (mountElement) {
                        app.mount(mountElement);
                        console.log('[HypePetiteVue] App mounted on element:', mountElement);
                    } else {
                        app.mount();
                        console.log('[HypePetiteVue] App mounted globally');
                    }

                    return app;
                });
            },

            /**
             * Create a reactive store for global state management
             * @param {string} name - Store name
             * @param {Object} state - Initial state object
             * @returns {Object} Reactive store object
             */
            createStore: function(name, state) {
                return this.loadPetiteVue().then(() => {
                    if (typeof PetiteVue === 'undefined' || typeof PetiteVue.reactive === 'undefined') {
                        throw new Error('PetiteVue.reactive is not available');
                    }

                    const store = PetiteVue.reactive(state);
                    this.stores[name] = store;
                    console.log('[HypePetiteVue] Store created:', name);
                    return store;
                });
            },

            /**
             * Register a component for use in Petite Vue templates
             * @param {string} name - Component name
             * @param {Function} component - Component factory function
             */
            registerComponent: function(name, component) {
                this.components[name] = component;
                console.log('[HypePetiteVue] Component registered:', name);
            },

            /**
             * Mount Petite Vue on a specific Hype element
             * @param {Object} hypeDocument - The Hype document object
             * @param {string} elementId - Hype element ID
             * @param {Object} scope - Scope data for the element
             * @returns {Promise} Promise that resolves when mounted
             */
            mountOnElement: function(hypeDocument, elementId, scope) {
                const element = hypeDocument.getElementById(elementId);
                if (!element) {
                    console.error('[HypePetiteVue] Element not found:', elementId);
                    return Promise.reject(new Error('Element not found: ' + elementId));
                }

                return this.createApp(scope, element);
            },

            /**
             * Create a Hype-aware reactive store that can interact with Hype timelines
             * @param {Object} hypeDocument - The Hype document object
             * @param {Object} state - Initial state
             * @param {string} name - Optional store name (defaults to using as root $store)
             * @returns {Promise} Promise that resolves with reactive store
             */
            createHypeStore: function(hypeDocument, state, name) {
                return this.loadPetiteVue().then(() => {
                    if (typeof PetiteVue === 'undefined' || typeof PetiteVue.reactive === 'undefined') {
                        throw new Error('PetiteVue.reactive is not available');
                    }

                    const hypeAwareState = Object.assign({}, state, {
                        // Add Hype utility methods to the state
                        $hype: {
                            document: hypeDocument,
                            showScene: (sceneName, transition, duration) => {
                                hypeDocument.showSceneNamed(sceneName, transition, duration);
                            },
                            startTimeline: (timelineName) => {
                                hypeDocument.startTimelineNamed(timelineName);
                            },
                            pauseTimeline: (timelineName) => {
                                hypeDocument.pauseTimelineNamed(timelineName);
                            },
                            continueTimeline: (timelineName) => {
                                hypeDocument.continueTimelineNamed(timelineName);
                            },
                            goToTime: (timeInSeconds, timelineName) => {
                                hypeDocument.goToTimeInTimelineNamed(timeInSeconds, timelineName);
                            },
                            getElementById: (elementId) => {
                                return hypeDocument.getElementById(elementId);
                            },
                            setElementProperty: (element, property, value, duration, timing) => {
                                hypeDocument.setElementProperty(element, property, value, duration, timing);
                            }
                        }
                    });

                    const reactiveStore = PetiteVue.reactive(hypeAwareState);

                    // Register store - if no name provided, merge into root $store
                    if (name) {
                        this.stores[name] = reactiveStore;
                        console.log('[HypePetiteVue] Hype-aware store created:', name);
                    } else {
                        // Merge into root $store for direct access
                        Object.assign(this.stores, reactiveStore);
                        console.log('[HypePetiteVue] Hype-aware store created and merged into $store');
                    }

                    // Trigger auto-mount if not already mounted
                    if (this._petiteVueLoaded && !this._globalAppMounted) {
                        setTimeout(() => this._autoMount(), 10);
                    }

                    return reactiveStore;
                });
            },

            /**
             * Cleanup Petite Vue instances for a scene
             * @param {string} sceneId - Scene identifier
             */
            cleanup: function(sceneId) {
                if (this.instances.has(sceneId)) {
                    this.instances.delete(sceneId);
                    console.log('[HypePetiteVue] Cleaned up scene:', sceneId);
                }
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
     * Hype Document Load event handler
     * Automatically initialize HypePetiteVue when a Hype document loads
     */
    if ("HYPE_eventListeners" in window === false) {
        window.HYPE_eventListeners = [];
    }

    window.HYPE_eventListeners.push({
        type: "HypeDocumentLoad",
        callback: function(hypeDocument, element, event) {
            // Auto-initialize if window.HypePetiteVueAutoInit is set to true
            if (window.HypePetiteVueAutoInit !== false) {
                HypePetiteVue.init(hypeDocument, element, event);
            }
        }
    });

    window.HYPE_eventListeners.push({
        type: "HypeSceneUnload",
        callback: function(hypeDocument, element, event) {
            // Cleanup when scene unloads
            const sceneId = hypeDocument.currentSceneName();
            HypePetiteVue.cleanup(sceneId);
        }
    });

    console.log('[HypePetiteVue] Extension loaded, version:', window.HypePetiteVue.version);

})();
