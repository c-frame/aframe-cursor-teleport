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

eval("/* global AFRAME */\nif (typeof AFRAME === 'undefined') {\n  throw new Error('Component attempted to register before AFRAME was available.');\n}\n/**\n * Cursor Teleport component for A-Frame.\n */\n\n\nAFRAME.registerComponent('cursor-teleport', {\n  schema: {\n    collisionEntities: {\n      type: 'string',\n      default: ''\n    },\n    ignoreEntities: {\n      type: 'string',\n      default: ''\n    },\n    landingMaxAngle: {\n      default: '45',\n      min: 0,\n      max: 360\n    },\n    landingNormal: {\n      type: 'vec3',\n      default: '0 1 0'\n    }\n  },\n  init: function () {\n    self = this; // platform detect\n\n    self.mobile = AFRAME.utils.device.isMobile(); // main app\n\n    self.scene = this.el.sceneEl;\n    self.canvas = self.scene.renderer.domElement; // camera\n\n    self.cam = document.querySelector('#head').object3D;\n    self.camPos = new THREE.Vector3();\n    self.camRig = document.querySelector('#cameraRig').object3D;\n    self.camPos = self.camRig.position; //collision\n\n    self.rayCaster = new THREE.Raycaster();\n    self.referenceNormal = new THREE.Vector3();\n    self.rayCastObjects = []; // Update collision normal\n\n    self.referenceNormal.copy(this.data.landingNormal); // teleport indicator\n\n    var geo = new THREE.RingGeometry(.25, .3, 32, 1);\n    geo.rotateX(-Math.PI / 2);\n    geo.translate(0, .02, 0);\n    var mat = new THREE.MeshBasicMaterial();\n    self.teleportIndicator = new THREE.Mesh(geo, mat);\n    self.scene.object3D.add(self.teleportIndicator); // transition\n\n    self.transitioning = false;\n    self.transitionProgress = 0;\n    self.transitionSpeed = .01;\n    self.transitionCamPosStart = new THREE.Vector3();\n    self.transitionCamPosEnd = new THREE.Vector3();\n\n    self.updateRaycastObjects = function () {\n      // updates the array of meshes we will need to raycast to\n      // clear the array of any existing meshes\n      self.rayCastObjects = [];\n\n      if (this.data.collisionEntities != '') {\n        // traverse collision entities and add their meshes to the rayCastEntities array.\n        var collisionEntities = self.scene.querySelectorAll(this.data.collisionEntities);\n        collisionEntities.forEach(e => {\n          e.object3D.traverse(function (child) {\n            if (child instanceof THREE.Mesh) {\n              // mark this mesh as a collision object\n              child.userData.collision = true;\n              self.rayCastObjects.push(child);\n            }\n          });\n        });\n      } else {\n        // if no collision entities are specified, create a default ground plane collision.\n        var geo = new THREE.PlaneGeometry(50, 50, 1);\n        geo.rotateX(-Math.PI / 2);\n        var mat = new THREE.MeshNormalMaterial();\n        var collisionMesh = new THREE.Mesh(geo, mat); // mark this mesh as a collision object\n\n        collisionMesh.userData.collision = true;\n        self.rayCastObjects.push(collisionMesh);\n      } // We need some entities to be seen by the raycaster even though they are not teleportable.\n      // This prevents the user from unnesserily teleporting when clicking things like buttons or UI.\n\n\n      var ignoreEntities = self.scene.querySelectorAll(this.data.ignoreEntities);\n      ignoreEntities.forEach(e => {\n        e.object3D.traverse(function (child) {\n          if (child instanceof THREE.Mesh) {\n            self.rayCastObjects.push(child);\n          }\n        });\n      });\n    };\n\n    function getMouseState(canvas, e) {\n      var rect = canvas.getBoundingClientRect();\n\n      if (e.clientX != null) {\n        return {\n          x: e.clientX - rect.left,\n          y: e.clientY - rect.top\n        };\n      } else if (e.touches[0] != null) {\n        return {\n          x: e.touches[0].clientX - rect.left,\n          y: e.touches[0].clientY - rect.top\n        };\n      }\n    }\n\n    self.getTeleportPosition = function (mouse_x, mouse_y) {\n      if (self.rayCastObjects.length != 0) {\n        if (self.hasOwnProperty('cam') && self.hasOwnProperty('canvas')) {\n          var cam = self.cam.children[0];\n          var rect = self.canvas.getBoundingClientRect();\n          var mouse = new THREE.Vector2();\n          mouse.x = mouse_x / (rect.right - rect.left) * 2 - 1;\n          mouse.y = -(mouse_y / (rect.bottom - rect.top)) * 2 + 1;\n          self.rayCaster.setFromCamera(mouse, cam);\n          var intersects = self.rayCaster.intersectObjects(self.rayCastObjects);\n\n          if (intersects.length != 0 && self.isValidNormalsAngle(intersects[0].face.normal)) {\n            if (intersects[0].object.userData.collision == true) {\n              return intersects[0].point;\n            }\n\n            return false;\n          } else {\n            return false;\n          }\n        } else {\n          return false;\n        }\n      } else {\n        return false;\n      }\n    };\n\n    self.isValidNormalsAngle = function (collisionNormal) {\n      var angleNormals = self.referenceNormal.angleTo(collisionNormal);\n      return THREE.Math.RAD2DEG * angleNormals <= this.data.landingMaxAngle;\n    };\n\n    self.transition = function (destPos) {\n      self.transitionProgress = 0;\n      self.transitionCamPosEnd.x = destPos.x;\n      self.transitionCamPosEnd.y = destPos.y;\n      self.transitionCamPosEnd.z = destPos.z;\n      self.transitionCamPosStart.x = self.camPos.x;\n      self.transitionCamPosStart.y = self.camPos.y;\n      self.transitionCamPosStart.z = self.camPos.z;\n      self.transitioning = true;\n    };\n\n    function mouseMove(e) {\n      var mouseState = getMouseState(self.canvas, e);\n      self.mouseX = mouseState.x;\n      self.mouseY = mouseState.y;\n    }\n\n    function mouseDown(e) {\n      self.updateRaycastObjects();\n      var mouseState = getMouseState(self.canvas, e);\n      self.mouseX = mouseState.x;\n      self.mouseY = mouseState.y;\n      self.mouseXOrig = mouseState.x;\n      self.mouseYOrig = mouseState.y;\n    }\n\n    function mouseUp(e) {\n      if (self.mouseX == self.mouseXOrig && self.mouseY == self.mouseYOrig) {\n        var pos = self.getTeleportPosition(self.mouseX, self.mouseY);\n\n        if (pos) {\n          self.teleportIndicator.position.x = pos.x;\n          self.teleportIndicator.position.y = pos.y;\n          self.teleportIndicator.position.z = pos.z;\n          self.transition(pos);\n        }\n      }\n    }\n\n    self.updateRaycastObjects(); // event listeners\n\n    self.canvas.addEventListener('mousedown', mouseDown, false);\n    self.canvas.addEventListener('mousemove', mouseMove, false);\n    self.canvas.addEventListener('mouseup', mouseUp, false);\n    self.canvas.addEventListener('touchstart', mouseDown, false);\n    self.canvas.addEventListener('touchmove', mouseMove, false);\n    self.canvas.addEventListener('touchend', mouseUp, false); // helper functions\n\n    self.easeInOutQuad = function (t) {\n      return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;\n    };\n  },\n  tick: function () {\n    if (!self.transitioning && !self.mobile) {\n      var pos = self.getTeleportPosition(self.mouseX, self.mouseY);\n\n      if (!self.mobile && pos) {\n        self.teleportIndicator.position.x = pos.x;\n        self.teleportIndicator.position.y = pos.y;\n        self.teleportIndicator.position.z = pos.z;\n      }\n    }\n\n    if (self.transitioning) {\n      self.transitionProgress += self.transitionSpeed; // set camera position\n\n      self.camPos.x = self.transitionCamPosStart.x + (self.transitionCamPosEnd.x - self.transitionCamPosStart.x) * self.easeInOutQuad(self.transitionProgress);\n      self.camPos.y = self.transitionCamPosStart.y + (self.transitionCamPosEnd.y - self.transitionCamPosStart.y) * self.easeInOutQuad(self.transitionProgress);\n      self.camPos.z = self.transitionCamPosStart.z + (self.transitionCamPosEnd.z - self.transitionCamPosStart.z) * self.easeInOutQuad(self.transitionProgress);\n\n      if (self.transitionProgress >= 1) {\n        self.transitioning = false;\n      }\n    }\n  }\n});\n\n//# sourceURL=webpack:///./index.js?");

/***/ })

/******/ });
});