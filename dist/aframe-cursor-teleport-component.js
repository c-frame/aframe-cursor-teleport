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
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Cursor Teleport component for A-Frame.
 */
AFRAME.registerComponent('cursor-teleport', {
  schema: {
    enabled: { type: 'boolean', default: true },
    cameraHead: { type: 'selector', default: '' },
    cameraRig: { type: 'selector', default: '' },
    collisionEntities: { type: 'string', default: '' },
    cursorColor: { type: 'color', default: '#4d93fd' },
    cursorType: { type: 'string', default: 'cylinder', oneOf: ['ring', 'cylinder'] },
    defaultPlaneSize: { type: 'number', default: 100 },
    ignoreEntities: { type: 'string', default: '' },
    landingMaxAngle: { default: 45, min: 0, max: 360 },
    landingNormal: { type: 'vec3', default: { x: 0, y: 1, z: 0 } },
    transitionSpeed: { type: 'number', default: 0.0006 }
  },

  init() {
    // platform detect
    this.mobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileDeviceRequestingDesktopSite();

    // main app
    const sceneEl = this.el.sceneEl;
    this.canvas = sceneEl.renderer.domElement;

    // camera
    this.data.cameraHead.object3D.traverse((child) => {
      if (child instanceof THREE.Camera) {
        this.cam = child; // This is the PerspectiveCamera
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

    // RING teleport indicator
    const geo = new THREE.RingGeometry(0.25, 0.3, 32, 1);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0.02, 0);
    const mat = new THREE.MeshBasicMaterial({ color: this.data.cursorColor });
    const indicatorRing = new THREE.Mesh(geo, mat);
    const group = new THREE.Group();
    group.add(indicatorRing);
    this.teleportIndicator = group;
    this.teleportIndicator.visible = false;

    if (this.data.cursorType === 'cylinder') {
      // CYLINDER teleport indicator
      const geoCyl = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 32, 1, true);
      geoCyl.translate(0, 0.25, 0);
      // texture source MIT license https://github.com/fernandojsg/aframe-teleport-controls/blob/master/lib/cylinderTexture.js
      const textureString =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAQCAYAAADXnxW3AAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAADJJREFUeNpEx7ENgDAAAzArK0JA6f8X9oewlcWStU1wBGdwB08wgjeYm79jc2nbYH0DAC/+CORJxO5fAAAAAElFTkSuQmCC';
      const textureCyl = new THREE.TextureLoader().load(textureString);
      const matCyl = new THREE.MeshBasicMaterial({
        color: this.data.cursorColor,
        side: 'double',
        map: textureCyl,
        transparent: true,
        depthTest: false
      });
      const indicatorCyl = new THREE.Mesh(geoCyl, matCyl);
      group.add(indicatorCyl);
    }

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
    for (const child of this.teleportIndicator.children) {
      child.material.dispose();
      child.geometry.dispose();
    }
    this.teleportIndicator = null;
    if (this.collisionMesh) {
      this.collisionMesh.geometry.dispose();
      this.collisionMesh.material.dispose();
      this.collisionMesh = null;
    }
  },

  update(oldData) {
    if (typeof oldData.enabled === 'undefined') return;
    if (!oldData.enabled && this.data.enabled) {
      this.registerEventListeners();
    }
    if (oldData.enabled && !this.data.enabled) {
      // Call unregisterEventListeners instead of pause that is a wrapped method unregistering tick method
      // because we still want the tick method to use the component via the teleportTo api.
      this.unregisterEventListeners();
    }
  },

  registerEventListeners() {
    const canvas = this.canvas;
    canvas.addEventListener('mousedown', this.mouseDown, false);
    canvas.addEventListener('mousemove', this.mouseMove, false);
    canvas.addEventListener('mouseup', this.mouseUp, false);
    canvas.addEventListener('touchstart', this.mouseDown, false);
    canvas.addEventListener('touchmove', this.mouseMove, false);
    canvas.addEventListener('touchend', this.mouseUp, false);
    window.addEventListener('keydown', this.hideCursor, false);
  },

  unregisterEventListeners() {
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

  play() {
    if (!this.data.enabled) return;
    this.registerEventListeners();
  },

  pause() {
    this.unregisterEventListeners();
  },

  updateRaycastObjects() {
    // updates the array of meshes we will need to raycast to
    // clear the array of any existing meshes
    this.rayCastObjects.length = 0;

    if (this.data.collisionEntities !== '') {
      // traverse collision entities and add their meshes to the rayCastEntities array.
      const collisionEntities = this.el.sceneEl.querySelectorAll(this.data.collisionEntities);

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
      const ignoreEntities = this.el.sceneEl.querySelectorAll(this.data.ignoreEntities);
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
          const intersects = this.rayCaster.intersectObjects(this.rayCastObjects);
          if (intersects.length !== 0 && this.isValidNormalsAngle(intersects[0].face.normal, intersects[0].object)) {
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
      const easeInOutTransitionProgress = this.easeInOutQuad(this.transitionProgress);
      const value =
        easeInOutTransitionProgress < 0.5 ? easeInOutTransitionProgress : 0.5 - 1 * (easeInOutTransitionProgress - 0.5);
      this.teleportIndicator.scale.set(0.5 + value, 1, 0.5 + value);

      // set camera position
      const camPos = this.camRig.position;
      camPos.lerpVectors(this.transitionCamPosStart, this.transitionCamPosEnd, easeInOutTransitionProgress);

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