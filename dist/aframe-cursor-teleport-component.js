(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/* global AFRAME, THREE */\nif (typeof AFRAME === 'undefined') {\n  throw new Error('Component attempted to register before AFRAME was available.');\n}\n/**\n * Cursor Teleport component for A-Frame.\n */\n\n\nAFRAME.registerComponent('cursor-teleport', {\n  schema: {\n    cameraHead: {\n      type: 'selector',\n      default: ''\n    },\n    cameraRig: {\n      type: 'selector',\n      default: ''\n    },\n    collisionEntities: {\n      type: 'string',\n      default: ''\n    },\n    ignoreEntities: {\n      type: 'string',\n      default: ''\n    },\n    landingMaxAngle: {\n      default: 45,\n      min: 0,\n      max: 360\n    },\n    landingNormal: {\n      type: 'vec3',\n      default: {\n        x: 0,\n        y: 1,\n        z: 0\n      }\n    },\n    transitionSpeed: {\n      type: 'number',\n      default: 0.0006\n    }\n  },\n\n  init() {\n    // platform detect\n    this.mobile = AFRAME.utils.device.isMobile(); // main app\n\n    const sceneEl = this.el.sceneEl;\n    this.canvas = sceneEl.renderer.domElement; // camera\n\n    this.data.cameraHead.object3D.traverse(child => {\n      if (child instanceof THREE.Camera) {\n        this.cam = child;\n      }\n    });\n    this.camRig = this.data.cameraRig.object3D; // collision\n\n    this.rayCaster = new THREE.Raycaster();\n    this.referenceNormal = new THREE.Vector3();\n    this.rayCastObjects = []; // Update collision normal\n\n    this.referenceNormal.copy(this.data.landingNormal); // teleport indicator\n\n    const geo = new THREE.RingGeometry(0.25, 0.3, 32, 1);\n    geo.rotateX(-Math.PI / 2);\n    geo.translate(0, 0.02, 0);\n    const mat = new THREE.MeshBasicMaterial();\n    const indicatorRing = new THREE.Mesh(geo, mat);\n    this.teleportIndicator = indicatorRing;\n    sceneEl.object3D.add(this.teleportIndicator); // transition\n\n    this.transitioning = false;\n    this.transitionProgress = 0;\n    this.transitionCamPosStart = new THREE.Vector3();\n    this.transitionCamPosEnd = new THREE.Vector3(); // Bind functions\n\n    this.updateRaycastObjects = this.updateRaycastObjects.bind(this);\n    this.getMouseState = this.getMouseState.bind(this);\n    this.getTeleportPosition = this.getTeleportPosition.bind(this);\n    this.isValidNormalsAngle = this.isValidNormalsAngle.bind(this);\n    this.transition = this.transition.bind(this);\n    this.mouseMove = this.mouseMove.bind(this);\n    this.mouseDown = this.mouseDown.bind(this);\n    this.mouseUp = this.mouseUp.bind(this);\n    this.easeInOutQuad = this.easeInOutQuad.bind(this);\n    this.updateRaycastObjects();\n  },\n\n  remove() {\n    this.cam = null;\n    this.canvas = null;\n    this.rayCastObjects.length = 0;\n    this.el.sceneEl.object3D.remove(this.teleportIndicator);\n    this.teleportIndicator.material.dispose();\n    this.teleportIndicator.geometry.dispose();\n    this.teleportIndicator = null;\n\n    if (this.collisionMesh) {\n      this.collisionMesh.geometry.dispose();\n      this.collisionMesh.material.dispose();\n      this.collisionMesh = null;\n    }\n  },\n\n  play() {\n    const canvas = this.canvas;\n    canvas.addEventListener('mousedown', this.mouseDown, false);\n    canvas.addEventListener('mousemove', this.mouseMove, false);\n    canvas.addEventListener('mouseup', this.mouseUp, false);\n    canvas.addEventListener('touchstart', this.mouseDown, false);\n    canvas.addEventListener('touchmove', this.mouseMove, false);\n    canvas.addEventListener('touchend', this.mouseUp, false);\n  },\n\n  pause() {\n    const canvas = this.canvas;\n    canvas.removeEventListener('mousedown', this.mouseDown);\n    canvas.removeEventListener('mousemove', this.mouseMove);\n    canvas.removeEventListener('mouseup', this.mouseUp);\n    canvas.removeEventListener('touchstart', this.mouseDown);\n    canvas.removeEventListener('touchmove', this.mouseMove);\n    canvas.removeEventListener('touchend', this.mouseUp);\n  },\n\n  updateRaycastObjects() {\n    // updates the array of meshes we will need to raycast to\n    // clear the array of any existing meshes\n    this.rayCastObjects.length = 0;\n\n    if (this.data.collisionEntities !== '') {\n      // traverse collision entities and add their meshes to the rayCastEntities array.\n      const collisionEntities = this.el.sceneEl.querySelectorAll(this.data.collisionEntities);\n      collisionEntities.forEach(e => {\n        e.object3D.traverse(child => {\n          if (child.isMesh) {\n            // mark this mesh as a collision object\n            child.userData.collision = true;\n            this.rayCastObjects.push(child);\n          }\n        });\n      });\n    } else {\n      if (!this.collisionMesh) {\n        // if no collision entities are specified, create a default ground plane collision.\n        const geo = new THREE.PlaneGeometry(50, 50, 1);\n        geo.rotateX(-Math.PI / 2);\n        const mat = new THREE.MeshNormalMaterial();\n        const collisionMesh = new THREE.Mesh(geo, mat); // mark this mesh as a collision object\n\n        collisionMesh.userData.collision = true;\n        this.collisionMesh = collisionMesh;\n      }\n\n      this.rayCastObjects.push(this.collisionMesh);\n    } // We may need some entities to be seen by the raycaster even though they are not teleportable.\n    // This prevents the user from unnesserily teleporting when clicking things like buttons or UI.\n\n\n    if (this.data.ignoreEntities !== '') {\n      const ignoreEntities = this.el.sceneEl.querySelectorAll(this.data.ignoreEntities);\n      ignoreEntities.forEach(e => {\n        e.object3D.traverse(child => {\n          if (child.isMesh) {\n            this.rayCastObjects.push(child);\n          }\n        });\n      });\n    }\n  },\n\n  getMouseState: function () {\n    const coordinates = new THREE.Vector2();\n    return function (e) {\n      const rect = this.canvas.getBoundingClientRect();\n\n      if (e.clientX != null) {\n        coordinates.x = e.clientX - rect.left;\n        coordinates.y = e.clientY - rect.top;\n        return coordinates;\n      } else if (e.touches[0] != null) {\n        coordinates.x = e.touches[0].clientX - rect.left;\n        coordinates.y = e.touches[0].clientY - rect.top;\n        return coordinates;\n      }\n    };\n  }(),\n  getTeleportPosition: function () {\n    const mouse = new THREE.Vector2();\n    return function (mouseX, mouseY) {\n      if (this.rayCastObjects.length !== 0) {\n        if (this.cam && this.canvas) {\n          const cam = this.cam;\n          const rect = this.canvas.getBoundingClientRect();\n          mouse.x = mouseX / (rect.right - rect.left) * 2 - 1;\n          mouse.y = -(mouseY / (rect.bottom - rect.top)) * 2 + 1;\n          this.rayCaster.setFromCamera(mouse, cam);\n          const intersects = this.rayCaster.intersectObjects(this.rayCastObjects);\n\n          if (intersects.length !== 0 && this.isValidNormalsAngle(intersects[0].face.normal)) {\n            if (intersects[0].object.userData.collision === true) {\n              return intersects[0].point;\n            }\n\n            return false;\n          } else {\n            return false;\n          }\n        } else {\n          return false;\n        }\n      } else {\n        return false;\n      }\n    };\n  }(),\n\n  isValidNormalsAngle(collisionNormal) {\n    const angleNormals = this.referenceNormal.angleTo(collisionNormal);\n    return THREE.MathUtils.RAD2DEG * angleNormals <= this.data.landingMaxAngle;\n  },\n\n  transition(destPos) {\n    this.transitionProgress = 0;\n    this.transitionCamPosEnd.copy(destPos);\n    this.transitionCamPosStart.copy(this.camRig.position);\n    this.transitioning = true;\n  },\n\n  mouseMove(e) {\n    const mouseState = this.getMouseState(e);\n    this.mouseX = mouseState.x;\n    this.mouseY = mouseState.y;\n  },\n\n  mouseDown(e) {\n    this.updateRaycastObjects();\n    const mouseState = this.getMouseState(e);\n    this.mouseX = mouseState.x;\n    this.mouseY = mouseState.y;\n    this.mouseXOrig = mouseState.x;\n    this.mouseYOrig = mouseState.y;\n  },\n\n  mouseUp(e) {\n    if (this.mouseX === this.mouseXOrig && this.mouseY === this.mouseYOrig) {\n      const pos = this.getTeleportPosition(this.mouseX, this.mouseY);\n\n      if (pos) {\n        this.teleportIndicator.position.copy(pos);\n        this.transition(pos);\n      }\n    }\n  },\n\n  easeInOutQuad(t) {\n    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;\n  },\n\n  tick(time, delta) {\n    if (!this.transitioning && !this.mobile) {\n      const pos = this.getTeleportPosition(this.mouseX, this.mouseY);\n\n      if (pos) {\n        this.teleportIndicator.position.copy(pos);\n      }\n    }\n\n    if (this.transitioning) {\n      this.transitionProgress += delta * this.data.transitionSpeed;\n      const easeInOutTransitionProgress = this.easeInOutQuad(this.transitionProgress); // set camera position\n\n      const camPos = this.camRig.position;\n      camPos.x = this.transitionCamPosStart.x + (this.transitionCamPosEnd.x - this.transitionCamPosStart.x) * easeInOutTransitionProgress;\n      camPos.y = this.transitionCamPosStart.y + (this.transitionCamPosEnd.y - this.transitionCamPosStart.y) * easeInOutTransitionProgress;\n      camPos.z = this.transitionCamPosStart.z + (this.transitionCamPosEnd.z - this.transitionCamPosStart.z) * easeInOutTransitionProgress;\n\n      if (this.transitionProgress >= 1) {\n        this.transitioning = false;\n        camPos.copy(this.transitionCamPosEnd);\n      }\n    }\n  }\n\n});\n\n//# sourceURL=webpack:///./index.js?");

/***/ })

/******/ });
});