## aframe-cursor-teleport-component

[![Version](http://img.shields.io/npm/v/aframe-cursor-teleport-component.svg?style=flat-square)](https://npmjs.org/package/aframe-cursor-teleport-component)
[![License](http://img.shields.io/npm/l/aframe-cursor-teleport-component.svg?style=flat-square)](https://npmjs.org/package/aframe-cursor-teleport-component)

![Screenshot](https://github.com/c-frame/aframe-cursor-teleport/raw/master/capture-01.gif)

A simple A-Frame component for navigating scenes on non-VR devices. When combined with A-Frame's cursor and look-controls components, this allows users to freely explore A-Frame scenes using device orientation and touch on mobile or using the mouse on desktop.

- [Live Example - Basic](https://c-frame.github.io/aframe-cursor-teleport/examples/basic/index.html)
- [Live Example - Custom Collision](https://c-frame.github.io/aframe-cursor-teleport/examples/custom/index.html)

For [A-Frame](https://aframe.io).

### API

| Property          | Description                                                                                                      | Default Value |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- | ------------- |
| enabled           | Enable or disable the component                                                                                  | true          |
| cameraRig         | Selector of the camera rig to teleport                                                                           |               |
| cameraHead        | Selector of the scene's active camera                                                                            |               |
| cursorColor       | Color of the cursor, default blue                                                                                | '#4d93fd'     |
| cursorType        | Type of the cursor, cylinder or ring                                                                             | 'cylinder'    |
| collisionEntities | Selector of the meshes used to check the collisions. If no value provided a plane at Y=0 is used.                |               |
| defaultPlaneSize  | Size of the default plane created for collision when `collisionEntities` is not specified                        | 100           |
| ignoreEntities    | Selector of meshes that may obstruct the teleport raycaster, like UI or other clickable elements.                |               |
| landingNormal     | Normal vector to detect collisions with the `collisionEntities`                                                  | (0, 1, 0)     |
| landingMaxAngle   | Angle threshold (in degrees) used together with `landingNormal` to detect if the mesh is so steep to jump to it. | 45            |

### Events

The `cursor-teleport` component will emit two events:

- `navigation-start`: Entity beginning travel to a destination.
- `navigation-end`: Entity has reached destination.

### Installation

#### Browser

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/c-frame/aframe-cursor-teleport@1.6.0/dist/aframe-cursor-teleport-component.min.js"></script>
</head>
<body>
  <a-scene>
    <!-- see usage below -->
  </a-scene>
</body>
```

#### npm

Install via npm:

```bash
npm install aframe-cursor-teleport-component
```

Then require and use.

```js
require('aframe');
require('aframe-cursor-teleport-component');
```

### Usage

#### Basic Setup

```html
<a-scene cursor="rayOrigin: mouse">
  <a-entity id="cameraRig" cursor-teleport="cameraRig: #cameraRig; cameraHead: #head">
    <a-entity id="head" position="0 1.6 0" camera look-controls="reverseMouseDrag: true"></a-entity>
  </a-entity>
</a-scene>
```

#### Collision Entities

To add collision objects, simply identify them with a selector:

```html
<a-scene cursor="rayOrigin: mouse">
  <!-- camera rig -->
  <a-entity id="cameraRig" cursor-teleport="cameraRig: #cameraRig; cameraHead: #head; collisionEntities: .collision">
    <a-entity id="head" position="0 1.6 0" camera look-controls="reverseMouseDrag: true"></a-entity>
  </a-entity>

  <!-- collidable entity -->
  <a-entity
    class="collision"
    position="0 -0.05 0"
    geometry="primitive: box; width: 8; height: 0.1; depth: 8"
  ></a-entity>
</a-scene>
```

#### Ignored Entities

If your scene has interactive entities that should not initiate a teleport when clicked, you can add them to the ignoredEntities array using a selector:

```html
<a-scene cursor="rayOrigin: mouse" raycaster="objects: .clickable">
  <!-- camera rig -->
  <a-entity
    id="cameraRig"
    cursor-teleport="cameraRig: #cameraRig; cameraHead: #head; collisionEntities: .collision; ignoreEntities: .clickable"
  >
    <a-entity id="head" position="0 1.6 0" camera look-controls="reverseMouseDrag: true"></a-entity>
  </a-entity>

  <!-- collidable entity -->
  <a-entity
    class="collision"
    position="0 -0.05 0"
    geometry="primitive: box; width: 8; height: 0.1; depth: 8"
  ></a-entity>

  <!-- UI element -->
  <a-entity
    class="clickable"
    color-change
    geometry="primitive: octahedron"
    scale="0.2 0.2 0.2"
    position="-0.8 1 -1.5"
  ></a-entity>
</a-scene>
```

#### Use with aframe-blink-controls

This component works with [aframe-blink-controls](https://github.com/jure/aframe-blink-controls) allowing for easy-to-use navigation across virtually all devices:

```html
<a-scene cursor="rayOrigin: mouse" raycaster="objects: .clickable">
  <!-- camera rig -->
  <a-entity
    id="cameraRig"
    cursor-teleport="cameraRig: #cameraRig; cameraHead: #head; collisionEntities: .collision; ignoreEntities: .clickable"
  >
    <a-entity id="head" position="0 1.6 0" camera look-controls="reverseMouseDrag: true"></a-entity>
    <a-entity
      laser-controls="hand: left"
      raycaster="objects: .clickable; far: 100"
      line="color: red; opacity: 0.75"
      blink-controls="cameraRig: #cameraRig; teleportOrigin: #head;"
    ></a-entity>
    <a-entity
      laser-controls="hand: right"
      raycaster="objects: .clickable"
      line="color: red; opacity: 0.75"
      blink-controls="cameraRig: #cameraRig; teleportOrigin: #head;"
    ></a-entity>
  </a-entity>

  <!-- collidable entity -->
  <a-entity
    class="collision"
    position="0 -0.05 0"
    geometry="primitive: box; width: 8; height: 0.1; depth: 8"
  ></a-entity>

  <!-- UI element -->
  <a-entity
    class="clickable"
    color-change
    geometry="primitive: octahedron"
    scale="0.2 0.2 0.2"
    position="-0.8 1 -1.5"
  ></a-entity>
</a-scene>
```

#### Use with simple-navmesh-constraint

You should disable the `simple-navmesh-constraint` component during the navigation transition.
You can do that like this:

```html
<script>
  AFRAME.registerComponent('character-controller', {
    events: {
      'navigation-start': function () {
        if (this.el.hasAttribute('simple-navmesh-constraint')) {
          this.el.setAttribute('simple-navmesh-constraint', 'enabled', false);
        }
      },
      'navigation-end': function () {
        if (this.el.hasAttribute('simple-navmesh-constraint')) {
          this.el.setAttribute('simple-navmesh-constraint', 'enabled', true);
        }
      }
    }
  });
</script>
```

Then add `character-controller` component to your cameraRig entity. You also probably want to add `.navmesh-hole` to the `cursor-teleport`'s `ignoreEntities`:

```html
<a-entity
  id="cameraRig"
  character-controller
  cursor-teleport="cameraRig: #cameraRig; cameraHead: #head; collisionEntities: .collision; ignoreEntities: .clickable,.navmesh-hole"
>
  <a-entity id="head" position="0 1.6 0" camera look-controls="reverseMouseDrag: true"></a-entity>
</a-entity>
```

#### teleportTo API

You can use the same teleport animation programmatically to teleport to a destination knowing
the position and quaternion (optional):

```js
const cameraRig = document.getElementById('cameraRig');
const cursorTeleport = cameraRig.components['cursor-teleport'];
cursorTeleport.teleportTo(destination.object3D.position, destination.object3D.quaternion);
```

Look at the source code of the basic example, the black button triggers the teleportation to the black arrow on the second platform.
