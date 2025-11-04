# Changelog

All notable changes to HypePetiteVue will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-04

### Added
- Complete rewrite of the HypePetiteVue integration layer
- Automatic Petite Vue loading via CDN
- Promise-based API for all async operations
- `init()` method for initializing HypePetiteVue with Hype documents
- `loadPetiteVue()` method with support for custom CDN URLs
- `createApp()` method for creating Petite Vue apps
- `createStore()` method for global reactive state management
- `registerComponent()` method for reusable component registration
- `mountOnElement()` method for mounting Vue on specific Hype elements
- `createHypeStore()` method with built-in Hype API integration
  - `$hype.showScene()` - Scene navigation
  - `$hype.startTimeline()` - Timeline control
  - `$hype.pauseTimeline()` - Pause timelines
  - `$hype.continueTimeline()` - Resume timelines
  - `$hype.goToTime()` - Jump to timeline position
  - `$hype.getElementById()` - Get Hype elements
  - `$hype.setElementProperty()` - Animate element properties
- `ready()` method for ensuring Petite Vue is loaded
- `getPetiteVue()` method for direct access to Petite Vue API
- Auto-initialization on HypeDocumentLoad event
- Automatic cleanup on HypeSceneUnload event
- Support for disabling auto-initialization via `window.HypePetiteVueAutoInit`
- Comprehensive error handling and logging
- Store and component instance tracking

### Documentation
- Complete API reference with code examples
- Detailed guide for all Petite Vue directives
- 6 comprehensive usage examples
- Best practices guide
- Troubleshooting section
- Browser compatibility information
- 3 working HTML examples (counter, todo list, components)
- Examples README with patterns and tips

### Examples
- Basic counter example demonstrating reactive data binding
- Todo list example with CRUD operations
- Component examples showing reusability and props
- Example patterns for Tumult Hype integration

### Technical
- Modern ES6+ JavaScript
- No external dependencies (loads Petite Vue dynamically)
- ~2KB footprint (excluding Petite Vue)
- Supports Petite Vue 0.4.1
- Promise-based architecture
- Singleton pattern for global state
- Automatic event listener registration

## [0.4.0] - 2021 (Referenced in original)

### Changed
- Updated to support Petite Vue 0.4.0

## [0.3.0] - 2021-09

### Added
- Initial release on Tumult Hype Forum
- Basic Petite Vue integration for Tumult Hype
- Forum discussion and community feedback

---

## Migration Guide: v0.x to v1.0.0

### Breaking Changes

1. **New Architecture**: Complete rewrite with new API structure
2. **Promise-based**: All methods now return Promises
3. **Auto-loading**: Petite Vue is now loaded automatically
4. **Event System**: Automatic event listener registration

### How to Upgrade

#### Before (v0.x):
```javascript
// Old approach (if any existed)
// Manual script loading and setup
```

#### After (v1.0.0):
```html
<!-- Just include the script -->
<script src="HypePetiteVue.js"></script>

<!-- Use Vue directives directly -->
<div v-scope="{ count: 0 }">
  <button @click="count++">{{ count }}</button>
</div>
```

### New Features to Adopt

1. **Use Hype Stores** for timeline integration:
```javascript
HypePetiteVue.createHypeStore(hypeDocument, {
    playAnimation() {
        this.$hype.startTimeline('Main');
    }
});
```

2. **Register Components** for reusability:
```javascript
HypePetiteVue.registerComponent('Counter', (props) => ({
    count: props.initial || 0
}));
```

3. **Use Promises** for initialization:
```javascript
HypePetiteVue.ready().then(() => {
    // Petite Vue is loaded and ready
});
```

---

## Upcoming Features (Roadmap)

- [ ] Built-in animation helpers for Hype timeline synchronization
- [ ] DevTools integration for debugging
- [ ] TypeScript definitions
- [ ] NPM package publishing
- [ ] Vue 3 Composition API style helpers
- [ ] Pre-built component library
- [ ] Advanced store patterns (actions, mutations)
- [ ] Router integration for multi-scene apps
- [ ] Server-side rendering support
- [ ] Performance monitoring utilities

---

## Contributing

We welcome contributions! See the main README for contribution guidelines.

## Links

- [Petite Vue](https://github.com/vuejs/petite-vue)
- [Tumult Hype](https://tumult.com/hype/)
- [Tumult Forums](https://forums.tumult.com/)
