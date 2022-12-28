/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Cursor Teleport component for A-Frame.
 */
AFRAME.registerComponent('cursor-teleport', {
  schema: {
    cameraHead: { type: 'string', default: '' },
    cameraRig: { type: 'string', default: '' },
    collisionEntities: { type: 'string', default: '' },
    ignoreEntities: { type: 'string', default: '' },
    landingMaxAngle: { default: 45, min: 0, max: 360 },
    landingNormal: { type: 'vec3', default: '0 1 0' },
    transitionSpeed: { type: 'number', default: 0.0006 }
  },
  init: function () {

    console.log( "Fixed self" );

    teleporter = this;

    // platform detect
    teleporter.mobile = AFRAME.utils.device.isMobile();

    // main app
    teleporter.scene = this.el.sceneEl;
    teleporter.canvas = teleporter.scene.renderer.domElement;

    // camera
    document.querySelector(this.data.cameraHead).object3D.traverse(function (child) {
      if (child instanceof THREE.Camera) {
        teleporter.cam = child;
      }
    });

    teleporter.camPos = new THREE.Vector3();
    teleporter.camRig = document.querySelector(this.data.cameraRig).object3D;
    teleporter.camPos = teleporter.camRig.position;

    //collision
    teleporter.rayCaster = new THREE.Raycaster();
    teleporter.referenceNormal = new THREE.Vector3();
    teleporter.rayCastObjects = [];

    // Update collision normal
    teleporter.referenceNormal.copy(this.data.landingNormal);

    // teleport indicator
    var geo = new THREE.RingGeometry(.25, .3, 32, 1);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, .02, 0);
    var mat = new THREE.MeshBasicMaterial();
    teleporter.teleportIndicator = new THREE.Mesh(geo, mat);
    teleporter.scene.object3D.add(teleporter.teleportIndicator);

    // transition
    teleporter.transitioning = false;
    teleporter.transitionProgress = 0;
    teleporter.transitionCamPosStart = new THREE.Vector3();
    teleporter.transitionCamPosEnd = new THREE.Vector3();

    teleporter.updateRaycastObjects = function () {

      // updates the array of meshes we will need to raycast to

      // clear the array of any existing meshes
      teleporter.rayCastObjects = [];

      if (this.data.collisionEntities != '') {
        // traverse collision entities and add their meshes to the rayCastEntities array.
        var collisionEntities = teleporter.scene.querySelectorAll(this.data.collisionEntities);

        collisionEntities.forEach(e => {
          e.object3D.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
              // mark this mesh as a collision object
              child.userData.collision = true;
              teleporter.rayCastObjects.push(child);
            }
          });
        });
      } else {
        if (!teleporter.collisionMesh) {
          // if no collision entities are specified, create a default ground plane collision.
          var geo = new THREE.PlaneGeometry(50, 50, 1);
          geo.rotateX(-Math.PI / 2);
          var mat = new THREE.MeshNormalMaterial();
          var collisionMesh = new THREE.Mesh(geo, mat);
          // mark this mesh as a collision object
          collisionMesh.userData.collision = true;
          teleporter.collisionMesh = collisionMesh;
        }
        teleporter.rayCastObjects.push(teleporter.collisionMesh);
      }

      // We may need some entities to be seen by the raycaster even though they are not teleportable.
      // This prevents the user from unnesserily teleporting when clicking things like buttons or UI.
      
      if(this.data.ignoreEntities != '') {
        var ignoreEntities = teleporter.scene.querySelectorAll(this.data.ignoreEntities);
        ignoreEntities.forEach(e => {
          e.object3D.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
              teleporter.rayCastObjects.push(child);
            }
          });
        });
      }
    }

    function getMouseState(canvas, e) {
      var rect = canvas.getBoundingClientRect();
      if (e.clientX != null) {
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
      } else if (e.touches[0] != null) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        }
      }
    }

    teleporter.getTeleportPosition = function (mouse_x, mouse_y) {

      if (teleporter.rayCastObjects.length != 0) {
        if (teleporter.hasOwnProperty('cam') && teleporter.hasOwnProperty('canvas')) {
          var cam = teleporter.cam;
          var rect = teleporter.canvas.getBoundingClientRect();
          var mouse = new THREE.Vector2();

          mouse.x = (mouse_x / (rect.right - rect.left)) * 2 - 1;
          mouse.y = -(mouse_y / (rect.bottom - rect.top)) * 2 + 1;

          teleporter.rayCaster.setFromCamera(mouse, cam);
          var intersects = teleporter.rayCaster.intersectObjects(teleporter.rayCastObjects);

          if (intersects.length != 0 && teleporter.isValidNormalsAngle(intersects[0].face.normal)) {
            if (intersects[0].object.userData.collision == true) {
              return intersects[0].point;
            }
            return false
          } else {
            return false
          }
        } else {
          return false
        }
      } else {
        return false
      }
    }

    teleporter.isValidNormalsAngle = function (collisionNormal) {
      var angleNormals = teleporter.referenceNormal.angleTo(collisionNormal);
      return (THREE.MathUtils.RAD2DEG * angleNormals <= this.data.landingMaxAngle);
    }

    teleporter.transition = function (destPos) {
      teleporter.transitionProgress = 0;

      teleporter.transitionCamPosEnd.x = destPos.x;
      teleporter.transitionCamPosEnd.y = destPos.y;
      teleporter.transitionCamPosEnd.z = destPos.z;

      teleporter.transitionCamPosStart.x = teleporter.camPos.x;
      teleporter.transitionCamPosStart.y = teleporter.camPos.y;
      teleporter.transitionCamPosStart.z = teleporter.camPos.z;

      teleporter.transitioning = true;
    }

    function mouseMove(e) {
      var mouseState = getMouseState(teleporter.canvas, e);

      teleporter.mouseX = mouseState.x;
      teleporter.mouseY = mouseState.y;

    }

    function mouseDown(e) {
      teleporter.updateRaycastObjects();

      var mouseState = getMouseState(teleporter.canvas, e);
      teleporter.mouseX = mouseState.x;
      teleporter.mouseY = mouseState.y;

      teleporter.mouseXOrig = mouseState.x;
      teleporter.mouseYOrig = mouseState.y;

    }

    function mouseUp(e) {
      if (teleporter.mouseX == teleporter.mouseXOrig && teleporter.mouseY == teleporter.mouseYOrig) {
        var pos = teleporter.getTeleportPosition(teleporter.mouseX, teleporter.mouseY);
        if (pos) {
          teleporter.teleportIndicator.position.x = pos.x;
          teleporter.teleportIndicator.position.y = pos.y;
          teleporter.teleportIndicator.position.z = pos.z;
          teleporter.transition(pos);
        }
      }
    }

    teleporter.updateRaycastObjects();

    // event listeners
    teleporter.canvas.addEventListener('mousedown', mouseDown, false);
    teleporter.canvas.addEventListener('mousemove', mouseMove, false);
    teleporter.canvas.addEventListener('mouseup', mouseUp, false);
    teleporter.canvas.addEventListener('touchstart', mouseDown, false);
    teleporter.canvas.addEventListener('touchmove', mouseMove, false);
    teleporter.canvas.addEventListener('touchend', mouseUp, false);

    // helper functions
    teleporter.easeInOutQuad = function (t) {
      return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
  },
  tick: function (time, delta) {
    if (!teleporter.transitioning && !teleporter.mobile) {
      var pos = teleporter.getTeleportPosition(teleporter.mouseX, teleporter.mouseY);
      if (!teleporter.mobile && pos) {
        teleporter.teleportIndicator.position.x = pos.x;
        teleporter.teleportIndicator.position.y = pos.y;
        teleporter.teleportIndicator.position.z = pos.z;
      }
    }
    if (teleporter.transitioning) {
      teleporter.transitionProgress += delta * teleporter.data.transitionSpeed;

      // set camera position
      teleporter.camPos.x = teleporter.transitionCamPosStart.x + ((teleporter.transitionCamPosEnd.x - teleporter.transitionCamPosStart.x) * teleporter.easeInOutQuad(teleporter.transitionProgress));
      teleporter.camPos.y = teleporter.transitionCamPosStart.y + ((teleporter.transitionCamPosEnd.y - teleporter.transitionCamPosStart.y) * teleporter.easeInOutQuad(teleporter.transitionProgress));
      teleporter.camPos.z = teleporter.transitionCamPosStart.z + ((teleporter.transitionCamPosEnd.z - teleporter.transitionCamPosStart.z) * teleporter.easeInOutQuad(teleporter.transitionProgress));

      if (teleporter.transitionProgress >= 1) {
        teleporter.transitioning = false;
      }
    }
  }
});
