(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, () => {
return /******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/* global AFRAME, THREE */

if (typeof AFRAME === 'undefined') {
  throw new Error(
    'Component attempted to register before AFRAME was available.'
  );
}

/**
 * Cursor Teleport component for A-Frame.
 */
AFRAME.registerComponent('cursor-teleport', {
  schema: {
    cameraHead: { type: 'selector', default: '' },
    cameraRig: { type: 'selector', default: '' },
    collisionEntities: { type: 'string', default: '' },
    defaultPlaneSize: { type: 'number', default: 100 },
    ignoreEntities: { type: 'string', default: '' },
    landingMaxAngle: { default: 45, min: 0, max: 360 },
    landingNormal: { type: 'vec3', default: { x: 0, y: 1, z: 0 } },
    transitionSpeed: { type: 'number', default: 0.0006 }
  },

  init() {
    // platform detect
    this.mobile =
      AFRAME.utils.device.isMobile() ||
      AFRAME.utils.device.isMobileDeviceRequestingDesktopSite();

    // main app
    const sceneEl = this.el.sceneEl;
    this.canvas = sceneEl.renderer.domElement;

    // camera
    this.data.cameraHead.object3D.traverse((child) => {
      if (child instanceof THREE.Camera) {
        this.cam = child;
      }
    });
    this.camForRotation = this.data.cameraHead.object3D; // This is the Group, parent of the PerspectiveCamera

    this.camRig = this.data.cameraRig.object3D;

    // collision
    this.rayCaster = new THREE.Raycaster();
    this.collisionObjectNormalMatrix = new THREE.Matrix3();
    this.collisionWorldNormal = new THREE.Vector3();
    this.referenceNormal = new THREE.Vector3();
    this.rayCastObjects = [];

    // Update collision normal
    this.referenceNormal.copy(this.data.landingNormal);

    // teleport indicator
    const geo = new THREE.RingGeometry(0.25, 0.3, 32, 1);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0.02, 0);
    const mat = new THREE.MeshBasicMaterial();
    const indicatorRing = new THREE.Mesh(geo, mat);
    this.teleportIndicator = indicatorRing;
    this.teleportIndicator.visible = false;

    sceneEl.object3D.add(this.teleportIndicator);

    // transition
    this.transitioning = false;
    this.transitionProgress = 0;
    this.transitionCamPosStart = new THREE.Vector3();
    this.transitionCamPosEnd = new THREE.Vector3();
    this.transitionCamQuaternionStart = new THREE.Quaternion();
    this.transitionCamQuaternionEnd = new THREE.Quaternion();

    // Bind functions
    this.updateRaycastObjects = this.updateRaycastObjects.bind(this);
    this.getMouseState = this.getMouseState.bind(this);
    this.getTeleportPosition = this.getTeleportPosition.bind(this);
    this.isValidNormalsAngle = this.isValidNormalsAngle.bind(this);
    this.transition = this.transition.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.easeInOutQuad = this.easeInOutQuad.bind(this);
    this.teleportTo = this.teleportTo.bind(this);
    this.hideCursor = this.hideCursor.bind(this);

    this.updateRaycastObjects();
  },

  remove() {
    this.cam = null;
    this.canvas = null;
    this.rayCastObjects.length = 0;
    this.el.sceneEl.object3D.remove(this.teleportIndicator);
    this.teleportIndicator.material.dispose();
    this.teleportIndicator.geometry.dispose();
    this.teleportIndicator = null;
    if (this.collisionMesh) {
      this.collisionMesh.geometry.dispose();
      this.collisionMesh.material.dispose();
      this.collisionMesh = null;
    }
  },

  play() {
    const canvas = this.canvas;
    canvas.addEventListener('mousedown', this.mouseDown, false);
    canvas.addEventListener('mousemove', this.mouseMove, false);
    canvas.addEventListener('mouseup', this.mouseUp, false);
    canvas.addEventListener('touchstart', this.mouseDown, false);
    canvas.addEventListener('touchmove', this.mouseMove, false);
    canvas.addEventListener('touchend', this.mouseUp, false);
    window.addEventListener('keydown', this.hideCursor, false);
  },

  pause() {
    this.transitioning = false;
    this.hideCursor();
    const canvas = this.canvas;
    canvas.removeEventListener('mousedown', this.mouseDown);
    canvas.removeEventListener('mousemove', this.mouseMove);
    canvas.removeEventListener('mouseup', this.mouseUp);
    canvas.removeEventListener('touchstart', this.mouseDown);
    canvas.removeEventListener('touchmove', this.mouseMove);
    canvas.removeEventListener('touchend', this.mouseUp);
    window.removeEventListener('keydown', this.hideCursor);
  },

  updateRaycastObjects() {
    // updates the array of meshes we will need to raycast to
    // clear the array of any existing meshes
    this.rayCastObjects.length = 0;

    if (this.data.collisionEntities !== '') {
      // traverse collision entities and add their meshes to the rayCastEntities array.
      const collisionEntities = this.el.sceneEl.querySelectorAll(
        this.data.collisionEntities
      );

      collisionEntities.forEach((e) => {
        e.object3D.traverse((child) => {
          if (child.isMesh) {
            // mark this mesh as a collision object
            child.userData.collision = true;
            this.rayCastObjects.push(child);
          }
        });
      });
    } else {
      if (!this.collisionMesh) {
        // if no collision entities are specified, create a default ground plane collision.
        const geo = new THREE.PlaneGeometry(this.data.defaultPlaneSize, this.data.defaultPlaneSize, 1);
        geo.rotateX(-Math.PI / 2);
        const mat = new THREE.MeshNormalMaterial();
        const collisionMesh = new THREE.Mesh(geo, mat);
        // mark this mesh as a collision object
        collisionMesh.userData.collision = true;
        this.collisionMesh = collisionMesh;
      }
      this.rayCastObjects.push(this.collisionMesh);
    }

    // We may need some entities to be seen by the raycaster even though they are not teleportable.
    // This prevents the user from unnesserily teleporting when clicking things like buttons or UI.
    if (this.data.ignoreEntities !== '') {
      const ignoreEntities = this.el.sceneEl.querySelectorAll(
        this.data.ignoreEntities
      );
      ignoreEntities.forEach((e) => {
        e.object3D.traverse((child) => {
          if (child.isMesh) {
            this.rayCastObjects.push(child);
          }
        });
      });
    }
  },

  getMouseState: (function () {
    const coordinates = new THREE.Vector2();
    return function (e) {
      const rect = this.canvas.getBoundingClientRect();
      if (e.clientX != null) {
        coordinates.x = e.clientX - rect.left;
        coordinates.y = e.clientY - rect.top;
        return coordinates;
      } else if (e.touches[0] != null) {
        coordinates.x = e.touches[0].clientX - rect.left;
        coordinates.y = e.touches[0].clientY - rect.top;
        return coordinates;
      }
    };
  })(),

  getTeleportPosition: (function () {
    const mouse = new THREE.Vector2();
    return function (mouseX, mouseY) {
      if (this.rayCastObjects.length !== 0) {
        if (this.cam && this.canvas) {
          const cam = this.cam;
          const rect = this.canvas.getBoundingClientRect();

          mouse.x = (mouseX / (rect.right - rect.left)) * 2 - 1;
          mouse.y = -(mouseY / (rect.bottom - rect.top)) * 2 + 1;
          this.rayCaster.setFromCamera(mouse, cam);
          const intersects = this.rayCaster.intersectObjects(
            this.rayCastObjects
          );
          if (
            intersects.length !== 0 &&
            this.isValidNormalsAngle(intersects[0].face.normal, intersects[0].object)
          ) {
            if (intersects[0].object.userData.collision === true) {
              return intersects[0].point;
            }
            return false;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    };
  })(),

  isValidNormalsAngle(collisionNormal, collisionObject) {
    this.collisionObjectNormalMatrix.getNormalMatrix(collisionObject.matrixWorld);
    this.collisionWorldNormal.copy(collisionNormal).applyNormalMatrix(this.collisionObjectNormalMatrix);
    const angleNormals = this.referenceNormal.angleTo(this.collisionWorldNormal);
    return THREE.MathUtils.RAD2DEG * angleNormals <= this.data.landingMaxAngle;
  },

  transition(destPos, destQuaternion = undefined) {
    this.transitionProgress = 0;
    this.transitionCamPosEnd.copy(destPos);
    this.transitionCamPosStart.copy(this.camRig.position);
    if (destQuaternion) {
      this.transitionCamQuaternionEnd.copy(destQuaternion);
      this.transitionCamQuaternionStart.copy(this.camRig.quaternion);
    } else {
      this.transitionCamQuaternionEnd.copy(this.camRig.quaternion);
      this.transitionCamQuaternionStart.copy(this.transitionCamQuaternionEnd);
    }
    this.transitioning = true;
    this.el.emit('navigation-start');
  },

  hideCursor() {
    this.teleportIndicator.visible = false;
  },

  mouseMove(e) {
    const mouseState = this.getMouseState(e);
    this.mouseX = mouseState.x;
    this.mouseY = mouseState.y;
  },

  mouseDown(e) {
    this.updateRaycastObjects();

    const mouseState = this.getMouseState(e);
    this.mouseX = mouseState.x;
    this.mouseY = mouseState.y;

    this.mouseXOrig = mouseState.x;
    this.mouseYOrig = mouseState.y;
  },

  mouseUp(e) {
    if (this.mouseX === this.mouseXOrig && this.mouseY === this.mouseYOrig) {
      const pos = this.getTeleportPosition(this.mouseX, this.mouseY);
      if (pos) {
        this.teleportIndicator.visible = true;
        this.teleportIndicator.position.copy(pos);
        this.transition(pos);
      }
    }
  },

  teleportTo(pos, quaternion = undefined) {
    this.teleportIndicator.position.copy(pos);
    if (!quaternion) {
      this.transition(pos);
    } else {
      const destQuaternion = new THREE.Quaternion();
      destQuaternion.setFromEuler(new THREE.Euler(0, this.camForRotation.rotation.y, 0));
      destQuaternion.invert();
      destQuaternion.multiply(quaternion);
      this.transition(pos, destQuaternion);
    }
    // don't show the indicator when using via api
    this.hideCursor();
  },

  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },

  tick(time, delta) {
    if (!this.transitioning && !this.mobile) {
      const pos = this.getTeleportPosition(this.mouseX, this.mouseY);
      if (pos) {
        this.teleportIndicator.position.copy(pos);
      }
    }
    if (this.transitioning) {
      this.transitionProgress += delta * this.data.transitionSpeed;
      const easeInOutTransitionProgress = this.easeInOutQuad(
        this.transitionProgress
      );

      // set camera position
      const camPos = this.camRig.position;
      camPos.lerpVectors(
        this.transitionCamPosStart,
        this.transitionCamPosEnd,
        easeInOutTransitionProgress
      );

      this.camRig.quaternion.slerpQuaternions(
        this.transitionCamQuaternionStart,
        this.transitionCamQuaternionEnd,
        easeInOutTransitionProgress
      );

      if (this.transitionProgress >= 1) {
        this.transitioning = false;
        camPos.copy(this.transitionCamPosEnd);
        this.camRig.quaternion.copy(this.transitionCamQuaternionEnd);
        this.el.emit('navigation-end');
      }
    }
  }
});

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=aframe-cursor-teleport-component.js.map