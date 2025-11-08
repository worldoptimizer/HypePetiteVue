# HypePetiteVue

A lightweight integration layer for using [Petite Vue](https://github.com/vuejs/petite-vue) with [Tumult Hype](https://tumult.com/hype/). This extension enables progressive enhancement of Hype documents with Vue's reactive features while maintaining a minimal footprint (Petite Vue is only ~6KB).

## What is Petite Vue?

Petite Vue is a lightweight (6KB) distribution of Vue optimized for progressive enhancement. It provides Vue's template syntax and reactivity model without the virtual DOM, making it perfect for adding interactivity to existing HTML—like Tumult Hype documents.

## Features

- 🚀 **Automatic Integration** - Auto-loads Petite Vue when your Hype document loads
- 🎯 **Hype-Aware Stores** - Reactive stores with built-in Hype API access
- 🔄 **Reactive State Management** - Share state between Hype and Vue seamlessly
- 🎨 **Component System** - Register and reuse Vue components in your Hype projects
- 📦 **Minimal Footprint** - Adds ~2KB on top of Petite Vue's 6KB
- 🛠️ **Full API Access** - Complete access to both Hype and Petite Vue APIs
- 🎭 **Scene Lifecycle** - Automatic cleanup when scenes change
- 📝 **Well Documented** - Comprehensive guides and examples

## Quick Start

### Installation

#### Option 1: Direct Script Include (Recommended)

Add to your Hype document's Head HTML:

```html
<script src="HypePetiteVue.js"></script>
```

#### Option 2: CDN (When Published)

```html
<script src="https://unpkg.com/hype-petite-vue@latest/HypePetiteVue.js"></script>
```

### Basic Usage

1. **Add HypePetiteVue to your document**

   In Hype's Document Inspector → Head HTML, add:
   ```html
   <script src="HypePetiteVue.js"></script>
   ```

2. **Add a Vue-powered element**

   Create a Hype element and add this to its Inner HTML:
   ```html
   <div v-scope="{ count: 0 }">
     <button @click="count++">Increment</button>
     <p>Count: {{ count }}</p>
   </div>
   ```

3. **Preview!**

   That's it! The HypePetiteVue extension will automatically load Petite Vue and initialize your reactive elements.

## API Reference

### Global Object: `HypePetiteVue`

HypePetiteVue works automatically - just add it to your Head HTML and start using Vue directives. For advanced use cases, the following methods are available:

#### `ready()`

Wait for Petite Vue to be fully loaded and ready.

```javascript
HypePetiteVue.ready().then(() => {
    console.log('Petite Vue is ready!');
});
```

**Returns:** Promise that resolves when Petite Vue is loaded

---

#### `getPetiteVue()`

Get direct access to the Petite Vue global object for advanced use cases.

```javascript
const PetiteVue = HypePetiteVue.getPetiteVue();
// Now you can use PetiteVue.createApp(), PetiteVue.reactive(), etc.
```

**Returns:** PetiteVue global object

---

#### `loadPetiteVue(customUrl)`

Load a specific version or custom build of Petite Vue.

```javascript
HypePetiteVue.loadPetiteVue('https://unpkg.com/petite-vue@0.3.0/dist/petite-vue.iife.js')
    .then(() => console.log('Custom version loaded!'));
```

**Parameters:**
- `customUrl` (optional) - Custom CDN URL for Petite Vue

**Returns:** Promise that resolves when library is loaded

**Note:** Usually not needed - HypePetiteVue loads Petite Vue automatically. Use this only if you need a specific version.

---

### Working with customData

HypePetiteVue uses **`hypeDocument.customData`** as the Vue scope. This is Hype's standard property for user data and is safe for Petite Vue's reactivity system.

Add your Vue data and component factories to `customData` in your HypeDocumentLoad function:

```javascript
function HypeDocumentLoad(hypeDocument, element, event) {
    // Initialize customData if not already present
    hypeDocument.customData = hypeDocument.customData || {};

    // Add reactive data
    hypeDocument.customData.count = 0;
    hypeDocument.customData.scenes = ['Scene 1', 'Scene 2', 'Scene 3'];

    // Add component factories (can access hypeDocument via closure)
    hypeDocument.customData.Counter = function(props) {
        return {
            count: props.initialCount || 0,
            increment() { this.count++; },
            decrement() { this.count--; }
        };
    };

    hypeDocument.customData.navigateTo = function(sceneName) {
        hypeDocument.showSceneNamed(sceneName);
    };
}
```

Then use them in your HTML:

```html
<!-- Access customData properties directly -->
<div v-scope>
    <h1>Count: {{ count }}</h1>
    <button @click="count++">Increment</button>
    <button v-for="scene in scenes" @click="navigateTo(scene)">{{ scene }}</button>
</div>

<!-- Or use component factories -->
<div v-scope="Counter({ initialCount: 10 })">
    <button @click="decrement">-</button>
    <span>{{ count }}</span>
    <button @click="increment">+</button>
</div>
```

---

## Petite Vue Directives

All standard Petite Vue directives are available:

### `v-scope`

Define a reactive scope region.

```html
<div v-scope="{ name: 'World' }">
    <h1>Hello {{ name }}!</h1>
</div>
```

### `v-if`, `v-else-if`, `v-else`

Conditional rendering.

```html
<div v-scope="{ show: true }">
    <p v-if="show">Visible!</p>
    <p v-else>Hidden!</p>
</div>
```

### `v-for`

List rendering.

```html
<div v-scope="{ items: ['Apple', 'Banana', 'Cherry'] }">
    <ul>
        <li v-for="item in items">{{ item }}</li>
    </ul>
</div>
```

### `v-model`

Two-way data binding.

```html
<div v-scope="{ text: '' }">
    <input v-model="text" />
    <p>You typed: {{ text }}</p>
</div>
```

### `v-bind` (`:`)

Attribute binding.

```html
<div v-scope="{ imageUrl: 'photo.jpg', isActive: true }">
    <img :src="imageUrl" :class="{ active: isActive }" />
</div>
```

### `v-on` (`@`)

Event handling.

```html
<div v-scope="{ count: 0 }">
    <button @click="count++">Clicked {{ count }} times</button>
</div>
```

### `v-show`

Toggle element visibility.

```html
<div v-scope="{ visible: true }">
    <p v-show="visible">Toggle me!</p>
</div>
```

### `v-effect`

Run reactive side effects.

```html
<div v-scope="{ count: 0 }">
    <p v-effect="console.log('Count is:', count)">{{ count }}</p>
    <button @click="count++">Increment</button>
</div>
```

### Lifecycle Events

`@vue:mounted` and `@vue:unmounted`

```html
<div v-scope @vue:mounted="console.log('mounted!')" @vue:unmounted="console.log('unmounted!')">
    Content
</div>
```

---

## Examples

### Example 1: Simple Counter

Add to Inner HTML of a Hype element:

```html
<div v-scope="{ count: 0 }" style="text-align: center; padding: 20px;">
    <h2>Counter: {{ count }}</h2>
    <button @click="count++" style="padding: 10px 20px; margin: 5px;">+</button>
    <button @click="count--" style="padding: 10px 20px; margin: 5px;">-</button>
    <button @click="count = 0" style="padding: 10px 20px; margin: 5px;">Reset</button>
</div>
```

### Example 2: Todo List

```html
<div v-scope="{
    todos: ['Learn Hype', 'Learn Vue', 'Build something awesome'],
    newTodo: '',
    addTodo() {
        if (this.newTodo.trim()) {
            this.todos.push(this.newTodo);
            this.newTodo = '';
        }
    },
    removeTodo(index) {
        this.todos.splice(index, 1);
    }
}" style="padding: 20px;">
    <h2>My Todos</h2>
    <div style="margin-bottom: 15px;">
        <input v-model="newTodo" @keyup.enter="addTodo" placeholder="Add a todo..." style="padding: 8px; width: 200px;" />
        <button @click="addTodo" style="padding: 8px 15px; margin-left: 5px;">Add</button>
    </div>
    <ul style="list-style: none; padding: 0;">
        <li v-for="(todo, index) in todos" style="padding: 8px; margin: 5px 0; background: #f0f0f0; border-radius: 4px; display: flex; justify-content: space-between;">
            <span>{{ todo }}</span>
            <button @click="removeTodo(index)" style="background: #ff4444; color: white; border: none; padding: 4px 12px; border-radius: 3px; cursor: pointer;">×</button>
        </li>
    </ul>
</div>
```

### Example 3: Form with Validation

```html
<div v-scope="{
    email: '',
    password: '',
    isValid() {
        return this.email.includes('@') && this.password.length >= 6;
    },
    submit() {
        if (this.isValid()) {
            alert('Form submitted!');
        }
    }
}" style="padding: 20px; max-width: 400px;">
    <h2>Login Form</h2>
    <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Email:</label>
        <input v-model="email" type="email" style="width: 100%; padding: 8px; box-sizing: border-box;" />
        <small v-show="email && !email.includes('@')" style="color: red;">Invalid email</small>
    </div>
    <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Password:</label>
        <input v-model="password" type="password" style="width: 100%; padding: 8px; box-sizing: border-box;" />
        <small v-show="password && password.length < 6" style="color: red;">Password must be at least 6 characters</small>
    </div>
    <button @click="submit" :disabled="!isValid()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;" :style="{ opacity: isValid() ? 1 : 0.5 }">
        Submit
    </button>
</div>
```

### Example 4: Interactive Scene Navigation

Add this JavaScript function to run on Document Load:

```javascript
function HypeDocumentLoad(hypeDocument, element, event) {
    hypeDocument.customData = hypeDocument.customData || {};

    // Add scene navigation data
    hypeDocument.customData.scenes = ['Scene 1', 'Scene 2', 'Scene 3'];
    hypeDocument.customData.currentScene = hypeDocument.currentSceneName();

    hypeDocument.customData.navigateTo = function(sceneName) {
        hypeDocument.showSceneNamed(sceneName, hypeDocument.kSceneTransitionCrossfade, 0.5);
        this.currentScene = sceneName;
    };
}
```

HTML in a Hype element:

```html
<div v-scope style="padding: 10px;">
    <h3>Navigate Scenes</h3>
    <button v-for="scene in scenes"
            @click="navigateTo(scene)"
            style="padding: 8px 15px; margin: 5px;">
        {{ scene }}
    </button>
    <p>Current: {{ currentScene }}</p>
</div>
```

### Example 5: Animated Counter with Hype Timeline

```javascript
function HypeDocumentLoad(hypeDocument, element, event) {
    hypeDocument.customData = hypeDocument.customData || {};

    hypeDocument.customData.count = 0;
    hypeDocument.customData.isAnimating = false;

    hypeDocument.customData.incrementWithAnimation = function() {
        this.count++;
        this.isAnimating = true;
        hypeDocument.startTimelineNamed('CounterPulse');
        setTimeout(() => { this.isAnimating = false; }, 500);
    };
}
```

HTML in a Hype element:

```html
<div v-scope style="text-align: center;">
    <h1>{{ count }}</h1>
    <button @click="incrementWithAnimation()"
            :disabled="isAnimating"
            style="padding: 15px 30px; font-size: 18px;">
        <span v-if="!isAnimating">Click Me!</span>
        <span v-else>Animating...</span>
    </button>
</div>
```

### Example 6: Reusable Component Pattern

You can create component factory functions in customData:

```javascript
function HypeDocumentLoad(hypeDocument, element, event) {
    hypeDocument.customData = hypeDocument.customData || {};

    // Create a Counter component factory
    hypeDocument.customData.Counter = function(props) {
        return {
            count: props.initialCount || 0,
            increment() {
                this.count++;
            },
            decrement() {
                this.count--;
            }
        };
    };

    // Create a Card component factory
    hypeDocument.customData.Card = function(props) {
        return {
            title: props.title || 'Card Title',
            content: props.content || 'Card content',
            isExpanded: false,
            toggle() {
                this.isExpanded = !this.isExpanded;
            }
        };
    };
}
```

Use in HTML:

```html
<div v-scope="Counter({ initialCount: 10 })" style="padding: 10px;">
    <button @click="decrement">-</button>
    <span>{{ count }}</span>
    <button @click="increment">+</button>
</div>

<div v-scope="Card({ title: 'Welcome', content: 'This is a reusable card component!' })" style="padding: 15px; margin: 10px; border: 1px solid #ddd; border-radius: 8px;">
    <h3 @click="toggle" style="cursor: pointer;">{{ title }} {{ isExpanded ? '▼' : '▶' }}</h3>
    <p v-show="isExpanded">{{ content }}</p>
</div>
```

---

## Best Practices

### 1. Always Initialize customData

Set up your reactive state and methods in customData when your Hype document loads:

```javascript
function HypeDocumentLoad(hypeDocument, element, event) {
    // Always initialize customData first
    hypeDocument.customData = hypeDocument.customData || {};

    // Add reactive state
    hypeDocument.customData.count = 0;
    hypeDocument.customData.user = { name: '', email: '' };

    // Add methods
    hypeDocument.customData.increment = function() {
        this.count++;
    };

    // Create component factories
    hypeDocument.customData.Modal = function(props) { /* ... */ };
}
```

### 2. Access Hype API via Closure

Component factories can access hypeDocument via closure for timeline integration:

```javascript
function HypeDocumentLoad(hypeDocument, element, event) {
    hypeDocument.customData = hypeDocument.customData || {};

    hypeDocument.customData.playIntro = function() {
        hypeDocument.startTimelineNamed('Intro'); // hypeDocument accessible via closure
    };
}
```

### 3. Clean Separation of Concerns

- Use Hype for animations and layout
- Use Vue (via customData) for interactivity and state management
- Use closures to bridge between them

### 4. Leverage Component Reusability

Create component factory functions in customData for UI patterns you use frequently:

```javascript
hypeDocument.customData.Modal = function(props) { /* ... */ };
hypeDocument.customData.Tooltip = function(props) { /* ... */ };
```

### 5. Keep Scope Small

Instead of one large v-scope, break into smaller reactive regions:

```html
<!-- Better -->
<div v-scope="{ count: 0 }">...</div>
<div v-scope="{ name: '' }">...</div>

<!-- Avoid -->
<div v-scope="{ count: 0, name: '', todos: [], ... }">...</div>
```

---

## How Scene Persistence Works

HypePetiteVue is designed to work seamlessly with Hype's scene management. Understanding how this works will help you build more reliable applications.

### The Mount/Unmount Pattern

When you switch between scenes in Hype, HypePetiteVue follows this lifecycle:

1. **On Scene Load (HypeScenePrepareForDisplay)**
   - HypePetiteVue mounts the Petite Vue app on the scene container
   - Vue bindings become active and your directives start working

2. **On Scene Unload (HypeSceneUnload)**
   - HypePetiteVue unmounts the Petite Vue app
   - The scene element is cloned and replaced to reset it to a clean state
   - This allows Hype to restore the original innerHTML when you revisit the scene

### Why Clone and Replace?

**Critical insight:** Tumult Hype manages innerHTML restoration automatically. When you revisit a scene, Hype resets the innerHTML back to what it was in the editor.

The old approach of trying to save and restore innerHTML manually fights against this. Instead, HypePetiteVue:
- Lets Hype handle innerHTML restoration
- Unmounts Vue cleanly to remove reactive bindings
- Clones the element to reset any DOM changes Vue made
- Re-mounts Vue when the scene is shown again

This pattern ensures that:
- Your scenes always start in a clean state
- No stale Vue bindings or memory leaks
- Works perfectly with Hype's scene management

### One App Instance Per Document

HypePetiteVue creates a **single Petite Vue app instance** per Hype document in the `HypeDocumentLoad` event. This app is then mounted and unmounted as you navigate between scenes.

Benefits:
- Efficient: No overhead of creating/destroying apps
- Consistent: State in `hypeDocument` persists across scenes
- Simple: One app, multiple mounts

### Persisting State Across Scenes

If you need to maintain state when switching scenes, **don't use local `v-scope` state**. Instead, use `customData`:

**❌ Wrong - State lost on scene change:**
```html
<div v-scope="{ count: 0 }">
    <button @click="count++">{{ count }}</button>
</div>
```

**✅ Correct - State persists:**
```javascript
// In HypeDocumentLoad
hypeDocument.customData = hypeDocument.customData || {};
hypeDocument.customData.persistentCount = 0;
```

```html
<div v-scope>
    <button @click="persistentCount++">{{ persistentCount }}</button>
</div>
```

**✅ Also correct - Using a component factory:**
```javascript
// In HypeDocumentLoad
hypeDocument.customData = hypeDocument.customData || {};
hypeDocument.customData.Counter = function() {
    return {
        count: 0,
        increment() {
            this.count++;
        }
    };
};
```

```html
<div v-scope="Counter()">
    <button @click="increment">{{ count }}</button>
</div>
```

**Note:** Component scope state is reset when you revisit a scene. Only `customData` properties persist.

### Working with Symbols

HypePetiteVue works perfectly with Hype symbols. You can add Vue directives to symbols using the "Additional HTML Attributes" feature in the Identity Inspector:

**Key:** `v-scope`
**Value:** (leave empty or provide scope data)

**Key:** `@vue:mounted`
**Value:** `console.log('Symbol mounted!')`

**Key:** `@vue:unmounted`
**Value:** `console.log('Symbol unmounted!')`

You can also reference customData properties directly:
```javascript
// Add to customData in HypeDocumentLoad
hypeDocument.customData = hypeDocument.customData || {};
hypeDocument.customData.count = 0;
```

Then in your symbol's innerHTML:
```html
<button @click="count++">{{ count }}</button>
```

---

## Advanced Usage

### Using Your Own Petite Vue Script

If you prefer to load Petite Vue yourself (e.g., for a specific version or from your own CDN), HypePetiteVue will automatically detect it and skip loading:

```html
<!-- Add to Head HTML BEFORE HypePetiteVue.js -->
<script src="https://unpkg.com/petite-vue@0.4.1/dist/petite-vue.iife.js"></script>
<script src="HypePetiteVue.js"></script>
```

HypePetiteVue checks for `window.PetiteVue` and uses it if available. This means:
- No duplicate loading
- You control the version
- Faster initialization (no async load needed)

### FOUC Prevention

HypePetiteVue automatically prevents Flash of Unstyled Content (FOUC) when loading Petite Vue asynchronously:

**What happens:**
1. When `HypeDocumentLoad` fires, if Petite Vue isn't loaded yet, the Hype document container is hidden with `visibility: hidden`
2. The document remains hidden while Petite Vue loads from CDN
3. Once Petite Vue mounts on the first scene, the container becomes visible

**Benefits:**
- Uses `visibility: hidden` (not `display: none`) to avoid layout shifts
- Only hides if loading is needed (skipped if Petite Vue is already loaded)
- Per-document hiding (won't affect other Hype documents on the page)

**Note:** If you load Petite Vue yourself in the Head HTML, FOUC prevention is skipped entirely since there's no async loading delay.

### Custom Petite Vue Version

Load a specific version or custom build:

```javascript
HypePetiteVue.loadPetiteVue('https://unpkg.com/petite-vue@0.3.0/dist/petite-vue.iife.js');
```

### Disable Auto-Initialization

If you want manual control:

```html
<script>
window.HypePetiteVueAutoInit = false;
</script>
<script src="HypePetiteVue.js"></script>
```

Then initialize manually:

```javascript
function whenReady(hypeDocument, element, event) {
    HypePetiteVue.init(hypeDocument, element, event);
}
```

### Direct Access to Petite Vue

For advanced use cases:

```javascript
HypePetiteVue.ready().then(() => {
    const PetiteVue = HypePetiteVue.getPetiteVue();
    // Use PetiteVue directly
    const myReactive = PetiteVue.reactive({ data: 'value' });
});
```

---

## Troubleshooting

### Vue Directives Not Working

**Problem:** Your `v-scope` or other directives aren't reactive.

**Solution:** Make sure HypePetiteVue.js is loaded in the Head HTML and the element contains valid Vue template syntax.

### State Not Persisting Across Scenes

**Problem:** My data resets when I switch scenes.

**Solution:** Add state to `customData`, not to local `v-scope`:

```javascript
// In HypeDocumentLoad
hypeDocument.customData = hypeDocument.customData || {};
hypeDocument.customData.myData = { count: 0 };
```

### Timeline Not Triggering

**Problem:** Calling Hype timelines from Vue doesn't work.

**Solution:** Add methods to `customData` that access hypeDocument via closure:

```javascript
hypeDocument.customData = hypeDocument.customData || {};
hypeDocument.customData.playAnimation = function() {
    hypeDocument.startTimelineNamed('Main Timeline');
};
```

### Elements Not Updating

**Problem:** Hype elements don't update when Vue state changes.

**Solution:** Vue manages its own DOM. To update Hype elements from Vue, use the Hype API directly:

```javascript
// In your Vue method
const element = hypeDocument.getElementById('myElement');
hypeDocument.setElementProperty(element, 'opacity', 0.5, 1, 'easeinout');
```

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari/Chrome

Petite Vue supports all modern browsers. IE11 is not supported.

---

## Version History

### v1.1.0 (2025) - BREAKING CHANGE
- **Breaking:** Use `hypeDocument.customData` as Vue scope instead of raw `hypeDocument`
- Fixes "Illegal constructor" error caused by Hype internals in reactive system
- Simplified to 162 lines - removed all complexity that wasn't solving core issues
- Removed: FOUC prevention, pending mounts tracking, document hiding
- `customData` is Hype's standard property for user data - safe for reactivity
- Users must now add Vue data/functions to `hypeDocument.customData`
- Migration: Change `hypeDocument.foo = ...` to `hypeDocument.customData.foo = ...`

### v1.0.3 (2025)
- Fix race condition where scene mount attempts before app initialization completes
- Process pending mounts per-document after app creation instead of globally
- Update README to reflect simplified API (removed deprecated methods)
- All examples now use `hypeDocument` properties instead of removed store/component APIs

### v1.0.2 (2025)
- Auto-detect pre-loaded Petite Vue (no duplicate loading if user includes script)
- FOUC prevention: hide Hype document during async Petite Vue loading
- Uses `visibility: hidden` to avoid layout shifts
- Better console logging to distinguish CDN vs. pre-loaded Petite Vue

### v1.0.1 (2025)
- Fix scene persistence by implementing proper mount/unmount pattern
- Align with Hype's innerHTML restoration behavior
- Clone and replace element after unmount for clean scene revisits
- Simplified API focused on mount/unmount lifecycle

### v1.0.0 (2025)
- Complete rewrite with improved integration
- Hype-aware stores with `$hype` utilities
- Component registration system
- Auto-initialization and cleanup
- Comprehensive documentation
- Better error handling
- Promise-based API

### v0.4.0 (referenced in original)
- Updated to support Petite Vue 0.4.0

### v0.3.0 (September 2021)
- Initial release on Tumult Hype Forum

---

## Examples

The `/examples` directory contains working HTML demonstrations:

- **basic-counter.html** - Simple reactive counter
- **todo-list.html** - Full-featured todo application
- **components.html** - Reusable component patterns
- **hype-integration.html** - Complete Hype API integration demo

These examples use **HypeSimulator.js**, a mock implementation of the Hype runtime that allows the examples to run standalone in any browser without Tumult Hype. The simulator provides all key hypeDocument methods and fires the appropriate events.

**Note:** In real Hype projects, you don't need the simulator - use the actual Hype runtime!

Open any example file in your browser to see HypePetiteVue in action. Check the browser console (F12) for detailed logging.

---

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

## License

MIT License - see LICENSE file for details.

---

## Credits

- **Petite Vue** by [Evan You](https://github.com/yyx990803)
- **Tumult Hype** by [Tumult Inc.](https://tumult.com/)
- **HypePetiteVue Integration** - Community driven

---

## Resources

- [Petite Vue Documentation](https://github.com/vuejs/petite-vue)
- [Tumult Hype Documentation](https://tumult.com/hype/documentation/)
- [Tumult Forums](https://forums.tumult.com/)

---

**Need help?** Ask on the [Tumult Forums](https://forums.tumult.com/) or open an issue on GitHub.
