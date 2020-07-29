

// initialize scene textures, materials, and lightmaps

// textures
var uv = new THREE.TextureLoader().load( 'models/textures/uv-checker.jpg ' );
uv.wrapS = THREE.RepeatWrapping;
uv.wrapT = THREE.RepeatWrapping;

// materials
var materials = {
    'uv' : new THREE.MeshBasicMaterial(),
};

materials['uv'].map = uv;

// lightmaps
var lightmaps = {
    'lm_environment' : new THREE.TextureLoader().load('models/textures/lm_environment.jpg')
};

lightmaps['lm_environment'].flipY = false;