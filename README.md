## aframe-cursor-teleport-component

[![Version](http://img.shields.io/npm/v/aframe-cursor-teleport-component.svg?style=flat-square)](https://npmjs.org/package/aframe-cursor-teleport-component)
[![License](http://img.shields.io/npm/l/aframe-cursor-teleport-component.svg?style=flat-square)](https://npmjs.org/package/aframe-cursor-teleport-component)

Simple teleport navigation for non-XR devices.

For [A-Frame](https://aframe.io).

### API

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
|          |             |               |

### Installation

#### Browser

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.9.2/aframe.min.js"></script>
  <script src="https://unpkg.com/aframe-cursor-teleport-component@1.0.0/dist/aframe-cursor-teleport-component.min.js"></script>
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
