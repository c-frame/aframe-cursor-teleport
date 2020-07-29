AFRAME.registerComponent('loader', {
    schema: {
        path: {
            type: 'string',
            default: ''
        }
    },
    init: function () {

        var path = this.data.path;

        el = this.el;

        var loader = new THREE.GLTFLoader();
        loader.load(
            path,
            function (gltf) {

                //recursive search to find all meshes and alter their material properties
                setMaterial = function (entity) {

                    // check if entity is a mesh
                    if (entity.type == "Mesh") {

                        // store a copy of the existing material
                        var oldMat = entity.material.clone();

                        // create a new basic material & copy over necessary properties from gltf
                        entity.material = new THREE.MeshBasicMaterial;
                        entity.material.name = oldMat.name;
                        entity.material.map = oldMat.map;
                        entity.material.color = oldMat.color;

                        //parse material name and find all materials with a light map
                        var matArguments = entity.material.name.split('|');
                        if ( typeof materials !== 'undefined') {
                            matArguments.forEach(element => {
                                //clone the corresponding material from the materials array
                                if (materials[element] != null) {
                                    entity.material = materials[element].clone();
                                }
                                //add lightmap if one is called for
                                if (element.substring(0, 3) == 'lm_') {
                                    // add light map to mesh
                                    entity.material.lightMap = lightmaps[element];
                                }
                            });
                        }
                    }
                    if (entity.type == "Group") {
                        if (entity.children.length != 0) {
                            entity.children.forEach(element => setMaterial(element));
                        }
                    }
                }

                // set up materials from gltf
                var children = gltf.scene.children;
                children.forEach(element => setMaterial(element));

                el.setObject3D('gltf', gltf.scene);
            }
        )
    }
});