## aframe-cursor-teleport-component

[![Version](http://img.shields.io/npm/v/aframe-cursor-teleport-component.svg?style=flat-square)](https://npmjs.org/package/aframe-cursor-teleport-component)
[![License](http://img.shields.io/npm/l/aframe-cursor-teleport-component.svg?style=flat-square)](https://npmjs.org/package/aframe-cursor-teleport-component)

![Screenshot](https://github.com/c-frame/aframe-cursor-teleport/raw/master/capture-01.gif)

A simple A-Frame component for navigating scenes on non-VR devices. When combined with A-Frame's cursor and look-controls components, this allows users to freely explore A-Frame scenes using device orientation and touch on mobile or using the mouse on desktop.

- [Live Example - Basic](https://c-frame.github.io/aframe-cursor-teleport/examples/basic/index.html)
- [Live Example - Custom Collision](https://c-frame.github.io/aframe-cursor-teleport/examples/custom/index.html)

For [A-Frame](https://aframe.io).

### API

| Property          | Description   | Default Value     |
| ---               | ---           | ---               |
| cameraRig | Selector of the camera rig to teleport | |
| cameraHead | Selector of the scene's active camera ||
| collisionEntities | Selector of the meshes used to check the collisions. If no value provided a plane at Y=0 is used. | |
| ignoreEntities | Selector of meshes that may obstruct the teleport raycaster, like UI or other clickable elements. 
| landingNormal | Normal vector to detect collisions with the `collisionEntities` | (0, 1, 0) |
| landingMaxAngle | Angle threshold (in degrees) used together with `landingNormal` to detect if the mesh is so steep to jump to it. | 45

### Installation

#### Browser

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/1.4.1/aframe.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/c-frame/aframe-cursor-teleport@1.0.0/dist/aframe-cursor-teleport-component.min.js"></script>
</head>

<body>
  <a-scene>
    <a-entity cursor-teleport="foo: bar"></a-entity>
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
This component requires a camera rig setup as described in fernandojsg's [aframe-teleport-controls](https://github.com/fernandojsg/aframe-teleport-controls/blob/master/README.md).

#### Basic Setup

```html
<a-scene cursor="rayOrigin: mouse">
    <a-entity id="cameraRig" cursor-teleport="cameraRig: #cameraRig; cameraHead: #head">
        <a-entity id="head" position="0 1.52 0" camera look-controls="reverseMouseDrag: true">            
        </a-entity>
    </a-entity>
</a-scene>
```

#### Collision Entities

To add collision objects, simply identify them with a selector:

```html
<a-scene cursor="rayOrigin: mouse">
    <!-- camera rig -->
    <a-entity id="cameraRig" cursor-teleport="cameraRig: #cameraRig; cameraHead: #head; collisionEntities: .collision">
        <a-entity id="head" position="0 1.52 0" camera look-controls="reverseMouseDrag: true"></a-entity>
    </a-entity>

    <!-- collidable entity -->
    <a-entity class="collision" position="0 -.05 0" geometry="primitive: box; width: 8; height: .1; depth: 8"></a-entity>
</a-scene>
```

#### Ignored Entities

If your scene has interactive entities that should not initiate a teleport when clicked, you can add them to the ignoredEntities array using a selector:

```html
<a-scene cursor="rayOrigin: mouse" raycaster="objects: .clickable" >
    <!-- camera rig -->
    <a-entity id="cameraRig" cursor-teleport="cameraRig: #cameraRig; cameraHead: #head; collisionEntities: .collision; ignoreEntities: .clickable">
        <a-entity id="head" position="0 1.52 0" camera look-controls="reverseMouseDrag: true"></a-entity>
    </a-entity>

    <!-- collidable entity -->
    <a-entity class="collision" position="0 -.05 0" geometry="primitive: box; width: 8; height: .1; depth: 8"></a-entity>

    <!-- UI element -->
    <a-entity class="clickable" color-change geometry="primitive: octahedron" scale=".2 .2 .2" position="-.8 1 -1.5"></a-entity>
</a-scene>
```

#### Use with aframe-teleport-controls

This component works with fernandojsg's [aframe-teleport-controls](https://github.com/fernandojsg/aframe-teleport-controls/blob/master/README.md) allowing for easy-to-use navigation across virtually all devices:

```html
<a-scene cursor="rayOrigin: mouse" raycaster="objects: .clickable" >
    <!-- camera rig -->
    <a-entity id="cameraRig" navigator="cameraRig: #cameraRig; cameraHead: #head; collisionEntities: .collision; ignoreEntities: .clickable">
        <a-entity id="head" position="0 1.52 0" camera look-controls="reverseMouseDrag: true"></a-entity>
        <a-entity laser-controls="hand: left" raycaster="objects: .clickable; far: 100" line="color: red; opacity: 0.75" teleport-controls="cameraRig: #cameraRig; teleportOrigin: #head;"></a-entity>
        <a-entity laser-controls="hand: right" raycaster="objects: .clickable" line="color: red; opacity: 0.75" teleport-controls="cameraRig: #cameraRig; teleportOrigin: #head;"></a-entity>
    </a-entity>

    <!-- collidable entity -->
    <a-entity class="collision" position="0 -.05 0" geometry="primitive: box; width: 8; height: .1; depth: 8"></a-entity>

    <!-- UI element -->
    <a-entity class="clickable" color-change geometry="primitive: octahedron" scale=".2 .2 .2" position="-.8 1 -1.5"></a-entity>
</a-scene>
```
