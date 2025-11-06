/*!
 * HypeSimulator v1.0.0
 * Mock implementation of Tumult Hype runtime for testing and demos
 *
 * This simulator mimics the core Hype API to allow HypePetiteVue examples
 * to work in standalone HTML files without a real Hype document.
 *
 * WARNING: This is for demo/testing purposes only. In production, use real
 * Tumult Hype documents.
 */

(function() {
    'use strict';

    console.log('[HypeSimulator] Initializing mock Hype environment...');

    // Scene transition constants
    const SCENE_TRANSITIONS = {
        kSceneTransitionInstant: 0,
        kSceneTransitionCrossfade: 1,
        kSceneTransitionSwap: 2,
        kSceneTransitionPushLeftToRight: 3,
        kSceneTransitionPushRightToLeft: 4,
        kSceneTransitionPushBottomToTop: 5,
        kSceneTransitionPushTopToBottom: 6
    };

    /**
     * Mock hypeDocument object that simulates the Hype API
     */
    function createMockHypeDocument(documentName, containerId) {
        const containerElement = document.getElementById(containerId);

        // Mock state
        const state = {
            currentScene: 'Main Scene',
            scenes: ['Main Scene', 'Scene 2', 'Scene 3'],
            timelines: {
                'Main Timeline': {
                    currentTime: 0,
                    duration: 10,
                    isPlaying: false,
                    direction: 'forward'
                }
            },
            elements: new Map()
        };

        const hypeDocument = {
            // Document info methods
            documentName: () => documentName,
            documentId: () => containerId,
            resourcesFolderURL: () => './',
            functions: () => [],

            // Element methods
            getElementById: (id) => {
                // First try to find element by Hype ID
                if (state.elements.has(id)) {
                    return state.elements.get(id);
                }
                // Fall back to standard DOM lookup
                return document.getElementById(id);
            },

            relayoutIfNecessary: () => {
                console.log('[HypeSimulator] relayoutIfNecessary called');
            },

            // Scene methods
            sceneNames: () => state.scenes,

            currentSceneName: () => state.currentScene,

            showSceneNamed: (sceneName, transition, duration) => {
                console.log(`[HypeSimulator] showSceneNamed: "${sceneName}", transition: ${transition}, duration: ${duration}`);
                if (state.scenes.includes(sceneName)) {
                    const oldScene = state.currentScene;
                    state.currentScene = sceneName;

                    // Fire scene unload event for old scene
                    fireEvent('HypeSceneUnload', containerElement, { sceneName: oldScene });

                    // Fire scene load event for new scene
                    setTimeout(() => {
                        fireEvent('HypeSceneLoad', containerElement, { sceneName });
                    }, (duration || 0) * 1000);

                    return true;
                } else {
                    console.warn(`[HypeSimulator] Scene "${sceneName}" not found`);
                    return false;
                }
            },

            showNextScene: (transition) => {
                const currentIndex = state.scenes.indexOf(state.currentScene);
                const nextIndex = (currentIndex + 1) % state.scenes.length;
                return hypeDocument.showSceneNamed(state.scenes[nextIndex], transition);
            },

            showPreviousScene: (transition) => {
                const currentIndex = state.scenes.indexOf(state.currentScene);
                const prevIndex = (currentIndex - 1 + state.scenes.length) % state.scenes.length;
                return hypeDocument.showSceneNamed(state.scenes[prevIndex], transition);
            },

            // Timeline methods
            startTimelineNamed: (timelineName, direction) => {
                console.log(`[HypeSimulator] startTimelineNamed: "${timelineName}", direction: ${direction || 'forward'}`);
                if (!state.timelines[timelineName]) {
                    state.timelines[timelineName] = {
                        currentTime: 0,
                        duration: 10,
                        isPlaying: false,
                        direction: 'forward'
                    };
                }
                state.timelines[timelineName].currentTime = 0;
                state.timelines[timelineName].isPlaying = true;
                state.timelines[timelineName].direction = direction || 'forward';

                // Simulate timeline completion
                setTimeout(() => {
                    if (state.timelines[timelineName]) {
                        state.timelines[timelineName].isPlaying = false;
                        fireEvent('HypeTimelineComplete', containerElement, { timelineName });
                    }
                }, state.timelines[timelineName].duration * 100); // Scaled down for demo

                return true;
            },

            pauseTimelineNamed: (timelineName) => {
                console.log(`[HypeSimulator] pauseTimelineNamed: "${timelineName}"`);
                if (state.timelines[timelineName]) {
                    state.timelines[timelineName].isPlaying = false;
                    return true;
                }
                return false;
            },

            continueTimelineNamed: (timelineName, direction) => {
                console.log(`[HypeSimulator] continueTimelineNamed: "${timelineName}", direction: ${direction || 'forward'}`);
                if (state.timelines[timelineName]) {
                    state.timelines[timelineName].isPlaying = true;
                    state.timelines[timelineName].direction = direction || state.timelines[timelineName].direction;
                    return true;
                }
                return false;
            },

            goToTimeInTimelineNamed: (time, timelineName) => {
                console.log(`[HypeSimulator] goToTimeInTimelineNamed: ${time}s in "${timelineName}"`);
                if (state.timelines[timelineName]) {
                    state.timelines[timelineName].currentTime = time;
                    return true;
                }
                return false;
            },

            currentTimeInTimelineNamed: (timelineName) => {
                return state.timelines[timelineName]?.currentTime || 0;
            },

            durationForTimelineNamed: (timelineName) => {
                return state.timelines[timelineName]?.duration || 0;
            },

            currentDirectionForTimelineNamed: (timelineName) => {
                return state.timelines[timelineName]?.direction || 'forward';
            },

            isPlayingTimelineNamed: (timelineName) => {
                return state.timelines[timelineName]?.isPlaying || false;
            },

            // Element property animation
            setElementProperty: (element, property, value, duration, timingFunction) => {
                if (!element) {
                    console.warn('[HypeSimulator] setElementProperty: element is null');
                    return false;
                }

                console.log(`[HypeSimulator] setElementProperty: ${property}=${value}, duration: ${duration}s, timing: ${timingFunction || 'linear'}`);

                // Apply the property immediately (in real Hype, this would animate)
                if (duration && duration > 0) {
                    // Simulate animation with CSS transition
                    element.style.transition = `${property} ${duration}s ${timingFunction || 'linear'}`;
                    setTimeout(() => {
                        applyProperty(element, property, value);
                    }, 10);

                    // Remove transition after animation
                    setTimeout(() => {
                        element.style.transition = '';
                    }, duration * 1000);
                } else {
                    applyProperty(element, property, value);
                }

                return true;
            },

            // Scene transition constants
            kSceneTransitionInstant: SCENE_TRANSITIONS.kSceneTransitionInstant,
            kSceneTransitionCrossfade: SCENE_TRANSITIONS.kSceneTransitionCrossfade,
            kSceneTransitionSwap: SCENE_TRANSITIONS.kSceneTransitionSwap,
            kSceneTransitionPushLeftToRight: SCENE_TRANSITIONS.kSceneTransitionPushLeftToRight,
            kSceneTransitionPushRightToLeft: SCENE_TRANSITIONS.kSceneTransitionPushRightToLeft,
            kSceneTransitionPushBottomToTop: SCENE_TRANSITIONS.kSceneTransitionPushBottomToTop,
            kSceneTransitionPushTopToBottom: SCENE_TRANSITIONS.kSceneTransitionPushTopToBottom,

            // Custom data storage (recommended by Hype docs)
            customData: {}
        };

        return hypeDocument;
    }

    /**
     * Apply a property to an element
     */
    function applyProperty(element, property, value) {
        switch(property) {
            case 'opacity':
                element.style.opacity = value;
                break;
            case 'width':
                element.style.width = value + 'px';
                break;
            case 'height':
                element.style.height = value + 'px';
                break;
            case 'left':
                element.style.left = value + 'px';
                break;
            case 'top':
                element.style.top = value + 'px';
                break;
            case 'rotateZ':
                element.style.transform = `rotate(${value}deg)`;
                break;
            case 'scaleX':
                const currentTransform = element.style.transform || '';
                element.style.transform = currentTransform + ` scaleX(${value})`;
                break;
            case 'scaleY':
                const currentTransform2 = element.style.transform || '';
                element.style.transform = currentTransform2 + ` scaleY(${value})`;
                break;
            case 'z-index':
                element.style.zIndex = value;
                break;
            default:
                console.warn(`[HypeSimulator] Unknown property: ${property}`);
        }
    }

    /**
     * Fire a Hype event
     */
    function fireEvent(eventType, element, eventData = {}) {
        console.log(`[HypeSimulator] Firing event: ${eventType}`);

        if (window.HYPE_eventListeners) {
            const hypeDocument = window.HYPE.documents[Object.keys(window.HYPE.documents)[0]];

            window.HYPE_eventListeners.forEach(listener => {
                if (listener.type === eventType) {
                    try {
                        listener.callback(hypeDocument, element, eventData);
                    } catch (error) {
                        console.error(`[HypeSimulator] Error in ${eventType} callback:`, error);
                    }
                }
            });
        }
    }

    /**
     * Initialize the simulator
     */
    function initSimulator() {
        // Create global HYPE object
        if (!window.HYPE) {
            window.HYPE = {
                documents: {}
            };
        }

        // Find or create a container
        let container = document.getElementById('hype-simulator-container');
        if (!container) {
            // Look for any existing container-like div
            container = document.querySelector('[id*="hype"]') ||
                       document.querySelector('.HYPE_document') ||
                       document.body;
        }

        const containerId = container.id || 'hype-simulator-container';
        if (!container.id) {
            container.id = containerId;
        }

        // Create mock document
        const documentName = 'HypeSimulatorDoc';
        const hypeDocument = createMockHypeDocument(documentName, containerId);

        // Register document
        window.HYPE.documents[documentName] = hypeDocument;

        console.log('[HypeSimulator] Mock Hype document created:', documentName);

        // Fire HypeDocumentLoad event after a short delay (simulating real Hype)
        setTimeout(() => {
            fireEvent('HypeDocumentLoad', container, {});
            console.log('[HypeSimulator] Ready! HypeDocumentLoad event fired.');
        }, 100);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSimulator);
    } else {
        initSimulator();
    }

    // Expose for testing
    window.HypeSimulator = {
        version: '1.0.0',
        createMockHypeDocument,
        SCENE_TRANSITIONS
    };

})();
