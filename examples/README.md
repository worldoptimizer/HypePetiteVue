# HypePetiteVue Examples

This directory contains working examples demonstrating various features of HypePetiteVue.

## 🎭 About the Hype Simulator

Since these are standalone HTML examples (not actual Tumult Hype documents), they use **HypeSimulator.js** - a mock implementation of the Hype runtime API. The simulator:

- Creates a fake `HYPE` global object with `HYPE.documents`
- Provides a mock `hypeDocument` with all key API methods
- Fires `HypeDocumentLoad` and `HypeSceneLoad` events
- Simulates scene navigation and timeline control
- Enables testing HypePetiteVue without Tumult Hype

**Important:** In real Hype projects, you don't need the simulator! The real Hype runtime provides all these features natively.

## Running the Examples

These examples can be opened directly in your web browser. Simply open any `.html` file in your browser to see it in action.

**Note:** These standalone examples use relative paths to load files from the parent directory. Make sure the file structure is intact:

```
HypePetiteVue/
├── HypePetiteVue.js
├── HypeSimulator.js (for examples only)
└── examples/
    ├── basic-counter.html
    ├── todo-list.html
    ├── components.html
    ├── hype-integration.html
    └── README.md
```

Look for the green "🎭 Hype Simulator Active" badge in the top-right corner of each example - this confirms the simulator is running.

## Examples Overview

### 1. Basic Counter (`basic-counter.html`)

**What it demonstrates:**
- Simple reactive data binding
- Event handling with `@click`
- Conditional rendering with `v-if`, `v-else-if`, `v-else`
- Basic `v-scope` usage

**Perfect for:**
- First-time users
- Understanding the basics of reactivity
- Learning Vue template syntax

**Key features:**
- Increment/decrement buttons
- Reset functionality
- Dynamic status messages based on counter value

---

### 2. Todo List (`todo-list.html`)

**What it demonstrates:**
- List rendering with `v-for`
- Two-way data binding with `v-model`
- Computed properties (using getters)
- Array manipulation (add, remove, toggle)
- Keyboard events (`@keyup.enter`)
- Conditional classes with `:class`
- Conditional rendering with `v-if`/`v-else`

**Perfect for:**
- Understanding state management
- Working with arrays
- Building CRUD interfaces
- Handling forms and inputs

**Key features:**
- Add new todos
- Mark todos as complete
- Delete todos
- Live statistics (active/completed count)
- Beautiful UI with animations

---

### 3. Components (`components.html`)

**What it demonstrates:**
- Component registration with `HypePetiteVue.registerComponent()`
- Reusable component patterns
- Props and component configuration
- Multiple instances of the same component
- Component isolation (each instance has independent state)

**Perfect for:**
- Building reusable UI patterns
- Scaling your application
- Understanding component architecture
- Learning component best practices

**Key features:**
- Counter component with configurable step size
- Expandable card component
- Interactive tag component
- Multiple instances demonstrating independence

---

### 4. Hype Integration (`hype-integration.html`)

**What it demonstrates:**
- `createHypeStore()` with `$hype` utilities
- Scene navigation from Vue (`$hype.showScene()`)
- Timeline control (`startTimeline()`, `pauseTimeline()`, `continueTimeline()`)
- Element property animation (`setElementProperty()`)
- Reactive state triggering Hype animations
- Real-time activity logging
- Complete Hype API integration

**Perfect for:**
- Understanding Hype + Vue integration
- Building interactive Hype experiences
- Controlling timelines from user input
- Scene-based navigation
- Combining Hype animations with Vue reactivity

**Key features:**
- Scene navigation with transition effects
- Timeline playback controls
- Score system triggering animations at milestones
- Animated box with rotation based on score
- Live activity log showing all API calls
- Demonstrates all `$hype` utility methods

---

## Using These Examples in Tumult Hype

To use these patterns in your Tumult Hype project:

### 1. Add HypePetiteVue to your Hype document

In **Document Inspector → Head HTML:**

```html
<script src="HypePetiteVue.js"></script>
```

### 2. Add Vue code to your elements

Select a Hype element and in the **Identity Inspector**, add your Vue template to the **Inner HTML** field:

```html
<div v-scope="{ count: 0 }">
  <button @click="count++">Count: {{ count }}</button>
</div>
```

### 3. Use JavaScript actions for advanced features

Create a JavaScript function in your Hype document to register components or create stores:

```javascript
function onDocumentLoad(hypeDocument, element, event) {
    HypePetiteVue.registerComponent('Counter', (props) => ({
        count: props.initial || 0,
        increment() { this.count++; }
    }));
}
```

Set this function to run **On Scene Load** in the **Scene Inspector**.

---

## Adapting Examples for Hype

### Pattern 1: Inline v-scope (Simplest)

**Good for:** Simple, self-contained elements

```html
<div v-scope="{ message: 'Hello!' }">
  <p>{{ message }}</p>
  <button @click="message = 'Updated!'">Update</button>
</div>
```

### Pattern 2: Component Registration (Reusable)

**Good for:** Patterns you use multiple times

```javascript
// In Document Load function
function registerMyComponents(hypeDocument, element, event) {
    HypePetiteVue.registerComponent('MyCounter', (props) => ({
        count: props.start || 0,
        increment() { this.count++; }
    }));
}
```

Then in HTML:
```html
<div v-scope="MyCounter({ start: 10 })">
  <button @click="increment">{{ count }}</button>
</div>
```

### Pattern 3: Global Stores (Shared State)

**Good for:** State shared across multiple elements/scenes

```javascript
function setupStore(hypeDocument, element, event) {
    HypePetiteVue.createStore('app', {
        user: null,
        login(name) { this.user = name; }
    });
}
```

Then in any HTML element:
```html
<div v-scope>
  <p v-if="$store.app.user">Hello, {{ $store.app.user }}!</p>
</div>
```

### Pattern 4: Hype-Aware Stores (Best Integration)

**Good for:** Vue state controlling Hype animations/scenes

```javascript
function setupHypeStore(hypeDocument, element, event) {
    HypePetiteVue.createHypeStore(hypeDocument, {
        score: 0,

        incrementScore() {
            this.score++;
            if (this.score >= 10) {
                // Trigger Hype animation when score reaches 10
                this.$hype.startTimeline('Victory');
            }
        }
    });
}
```

---

## Tips for Success

### 1. Start Small
Begin with simple inline `v-scope` patterns and gradually move to components and stores as your project grows.

### 2. Keep State Close
If state is only used in one element, use inline `v-scope`. If shared, use stores.

### 3. Debug in Console
Open your browser's Developer Tools (F12) to see console logs and debug issues.

### 4. Check the README
The main [README.md](../README.md) has comprehensive API documentation and troubleshooting tips.

### 5. Use Browser Extensions
Install Vue DevTools browser extension for better debugging (it works with Petite Vue!).

---

## Next Steps

1. **Open the examples** - Try each one in your browser
2. **View the source** - Right-click → View Source to see how they work
3. **Modify and experiment** - Change values, add features, break things!
4. **Build your own** - Use these as templates for your Hype projects
5. **Read the docs** - Check out the main [README.md](../README.md) for full API reference

---

## Need Help?

- Check the [main README](../README.md) for detailed documentation
- Visit the [Tumult Forums](https://forums.tumult.com/)
- Review [Petite Vue documentation](https://github.com/vuejs/petite-vue)
- Open an issue on GitHub

---

**Happy coding! 🚀**
