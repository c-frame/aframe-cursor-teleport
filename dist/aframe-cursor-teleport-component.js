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

eval("/* global AFRAME */\nif (typeof AFRAME === 'undefined') {\n  throw new Error('Component attempted to register before AFRAME was available.');\n}\n/**\r\n * Cursor Teleport component for A-Frame.\r\n */\n\n\nAFRAME.registerComponent('cursor-teleport', {\n  schema: {\n    cameraHead: {\n      type: 'string',\n      default: ''\n    },\n    cameraRig: {\n      type: 'string',\n      default: ''\n    },\n    collisionEntities: {\n      type: 'string',\n      default: ''\n    },\n    ignoreEntities: {\n      type: 'string',\n      default: ''\n    },\n    landingMaxAngle: {\n      default: '45',\n      min: 0,\n      max: 360\n    },\n    landingNormal: {\n      type: 'vec3',\n      default: '0 1 0'\n    }\n  },\n  init: function () {\n    console.log(\"Fixed self\");\n    teleporter = this; // platform detect\n\n    teleporter.mobile = AFRAME.utils.device.isMobile(); // main app\n\n    teleporter.scene = this.el.sceneEl;\n    teleporter.canvas = teleporter.scene.renderer.domElement; // camera\n\n    document.querySelector(this.data.cameraHead).object3D.traverse(function (child) {\n      if (child instanceof THREE.Camera) {\n        teleporter.cam = child;\n      }\n    });\n    teleporter.camPos = new THREE.Vector3();\n    teleporter.camRig = document.querySelector(this.data.cameraRig).object3D;\n    teleporter.camPos = teleporter.camRig.position; //collision\n\n    teleporter.rayCaster = new THREE.Raycaster();\n    teleporter.referenceNormal = new THREE.Vector3();\n    teleporter.rayCastObjects = []; // Update collision normal\n\n    teleporter.referenceNormal.copy(this.data.landingNormal); // teleport indicator\n\n    var geo = new THREE.RingGeometry(.25, .3, 32, 1);\n    geo.rotateX(-Math.PI / 2);\n    geo.translate(0, .02, 0);\n    var mat = new THREE.MeshBasicMaterial();\n    teleporter.teleportIndicator = new THREE.Mesh(geo, mat);\n    teleporter.scene.object3D.add(teleporter.teleportIndicator); // transition\n\n    teleporter.transitioning = false;\n    teleporter.transitionProgress = 0;\n    teleporter.transitionSpeed = .01;\n    teleporter.transitionCamPosStart = new THREE.Vector3();\n    teleporter.transitionCamPosEnd = new THREE.Vector3();\n\n    teleporter.updateRaycastObjects = function () {\n      // updates the array of meshes we will need to raycast to\n      // clear the array of any existing meshes\n      teleporter.rayCastObjects = [];\n\n      if (this.data.collisionEntities != '') {\n        // traverse collision entities and add their meshes to the rayCastEntities array.\n        var collisionEntities = teleporter.scene.querySelectorAll(this.data.collisionEntities);\n        collisionEntities.forEach(e => {\n          e.object3D.traverse(function (child) {\n            if (child instanceof THREE.Mesh) {\n              // mark this mesh as a collision object\n              child.userData.collision = true;\n              teleporter.rayCastObjects.push(child);\n            }\n          });\n        });\n      } else {\n        // if no collision entities are specified, create a default ground plane collision.\n        var geo = new THREE.PlaneGeometry(50, 50, 1);\n        geo.rotateX(-Math.PI / 2);\n        var mat = new THREE.MeshNormalMaterial();\n        var collisionMesh = new THREE.Mesh(geo, mat); // mark this mesh as a collision object\n\n        collisionMesh.userData.collision = true;\n        teleporter.rayCastObjects.push(collisionMesh);\n      } // We may need some entities to be seen by the raycaster even though they are not teleportable.\n      // This prevents the user from unnesserily teleporting when clicking things like buttons or UI.\n\n\n      if (this.data.ignoreEntities != '') {\n        var ignoreEntities = teleporter.scene.querySelectorAll(this.data.ignoreEntities);\n        ignoreEntities.forEach(e => {\n          e.object3D.traverse(function (child) {\n            if (child instanceof THREE.Mesh) {\n              teleporter.rayCastObjects.push(child);\n            }\n          });\n        });\n      }\n    };\n\n    function getMouseState(canvas, e) {\n      var rect = canvas.getBoundingClientRect();\n\n      if (e.clientX != null) {\n        return {\n          x: e.clientX - rect.left,\n          y: e.clientY - rect.top\n        };\n      } else if (e.touches[0] != null) {\n        return {\n          x: e.touches[0].clientX - rect.left,\n          y: e.touches[0].clientY - rect.top\n        };\n      }\n    }\n\n    teleporter.getTeleportPosition = function (mouse_x, mouse_y) {\n      if (teleporter.rayCastObjects.length != 0) {\n        if (teleporter.hasOwnProperty('cam') && teleporter.hasOwnProperty('canvas')) {\n          var cam = teleporter.cam;\n          var rect = teleporter.canvas.getBoundingClientRect();\n          var mouse = new THREE.Vector2();\n          mouse.x = mouse_x / (rect.right - rect.left) * 2 - 1;\n          mouse.y = -(mouse_y / (rect.bottom - rect.top)) * 2 + 1;\n          teleporter.rayCaster.setFromCamera(mouse, cam);\n          var intersects = teleporter.rayCaster.intersectObjects(teleporter.rayCastObjects);\n\n          if (intersects.length != 0 && teleporter.isValidNormalsAngle(intersects[0].face.normal)) {\n            if (intersects[0].object.userData.collision == true) {\n              return intersects[0].point;\n            }\n\n            return false;\n          } else {\n            return false;\n          }\n        } else {\n          return false;\n        }\n      } else {\n        return false;\n      }\n    };\n\n    teleporter.isValidNormalsAngle = function (collisionNormal) {\n      var angleNormals = teleporter.referenceNormal.angleTo(collisionNormal);\n      return THREE.Math.RAD2DEG * angleNormals <= this.data.landingMaxAngle;\n    };\n\n    teleporter.transition = function (destPos) {\n      teleporter.transitionProgress = 0;\n      teleporter.transitionCamPosEnd.x = destPos.x;\n      teleporter.transitionCamPosEnd.y = destPos.y;\n      teleporter.transitionCamPosEnd.z = destPos.z;\n      teleporter.transitionCamPosStart.x = teleporter.camPos.x;\n      teleporter.transitionCamPosStart.y = teleporter.camPos.y;\n      teleporter.transitionCamPosStart.z = teleporter.camPos.z;\n      teleporter.transitioning = true;\n    };\n\n    function mouseMove(e) {\n      var mouseState = getMouseState(teleporter.canvas, e);\n      teleporter.mouseX = mouseState.x;\n      teleporter.mouseY = mouseState.y;\n    }\n\n    function mouseDown(e) {\n      teleporter.updateRaycastObjects();\n      var mouseState = getMouseState(teleporter.canvas, e);\n      teleporter.mouseX = mouseState.x;\n      teleporter.mouseY = mouseState.y;\n      teleporter.mouseXOrig = mouseState.x;\n      teleporter.mouseYOrig = mouseState.y;\n    }\n\n    function mouseUp(e) {\n      if (teleporter.mouseX == teleporter.mouseXOrig && teleporter.mouseY == teleporter.mouseYOrig) {\n        var pos = teleporter.getTeleportPosition(teleporter.mouseX, teleporter.mouseY);\n\n        if (pos) {\n          teleporter.teleportIndicator.position.x = pos.x;\n          teleporter.teleportIndicator.position.y = pos.y;\n          teleporter.teleportIndicator.position.z = pos.z;\n          teleporter.transition(pos);\n        }\n      }\n    }\n\n    teleporter.updateRaycastObjects(); // event listeners\n\n    teleporter.canvas.addEventListener('mousedown', mouseDown, false);\n    teleporter.canvas.addEventListener('mousemove', mouseMove, false);\n    teleporter.canvas.addEventListener('mouseup', mouseUp, false);\n    teleporter.canvas.addEventListener('touchstart', mouseDown, false);\n    teleporter.canvas.addEventListener('touchmove', mouseMove, false);\n    teleporter.canvas.addEventListener('touchend', mouseUp, false); // helper functions\n\n    teleporter.easeInOutQuad = function (t) {\n      return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;\n    };\n  },\n  tick: function () {\n    if (!teleporter.transitioning && !teleporter.mobile) {\n      var pos = teleporter.getTeleportPosition(teleporter.mouseX, teleporter.mouseY);\n\n      if (!teleporter.mobile && pos) {\n        teleporter.teleportIndicator.position.x = pos.x;\n        teleporter.teleportIndicator.position.y = pos.y;\n        teleporter.teleportIndicator.position.z = pos.z;\n      }\n    }\n\n    if (teleporter.transitioning) {\n      teleporter.transitionProgress += teleporter.transitionSpeed; // set camera position\n\n      teleporter.camPos.x = teleporter.transitionCamPosStart.x + (teleporter.transitionCamPosEnd.x - teleporter.transitionCamPosStart.x) * teleporter.easeInOutQuad(teleporter.transitionProgress);\n      teleporter.camPos.y = teleporter.transitionCamPosStart.y + (teleporter.transitionCamPosEnd.y - teleporter.transitionCamPosStart.y) * teleporter.easeInOutQuad(teleporter.transitionProgress);\n      teleporter.camPos.z = teleporter.transitionCamPosStart.z + (teleporter.transitionCamPosEnd.z - teleporter.transitionCamPosStart.z) * teleporter.easeInOutQuad(teleporter.transitionProgress);\n\n      if (teleporter.transitionProgress >= 1) {\n        teleporter.transitioning = false;\n      }\n    }\n  }\n});\n\n//# sourceURL=webpack:///./index.js?");

/***/ })

/******/ });
});