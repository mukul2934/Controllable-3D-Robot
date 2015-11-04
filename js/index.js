// from require to global var
var OSG = window.OSG;
OSG.globalify();

var osg = window.osg;
var osgViewer = window.osgViewer;
var osgGA = window.osgGA;
var viewer;
var world, shoulder, elbow, wrist, root;

var main = function () {
    // The 3D canvas.
    var canvas = document.getElementById( '3DView' );

    //try {
        viewer = new osgViewer.Viewer( canvas, {
            antialias: true,
            //alpha: true
        } );
        viewer.init();
        mvMatrix = new osg.MatrixTransform();
        mvMatrix.addChild( createScene() );
        viewer.setSceneData( mvMatrix );


        viewer.setupManipulator();
        // set distance
        viewer.getManipulator().setDistance( 18.0 );
        setPose();

        viewer.run();

        var mousedown = function ( ev ) {
            ev.stopPropagation();
        };
    //} catch ( er ) {
    //    osg.log( 'exception in osgViewer ' + er );
    //    alert( 'exception in osgViewer ' + er );
    //}
};

var SimpleUpdateCallback = function ( material ) {
    this.material = material;
};

SimpleUpdateCallback.prototype = {
    // rotation angle
    alpha: 0,

    update: function ( node, nv ) {
        var t = nv.getFrameStamp().getSimulationTime();
        var dt = t - node._lastUpdate;
        if ( dt < 0 ) {
            return true;
        }
        node._lastUpdate = t;
        document.getElementById( 'update' ).innerHTML = node._lastUpdate.toFixed( 2 );
        document.getElementById( 'alpha' ).innerHTML = this.alpha.toFixed( 2 );

        this.alpha += 0.01;
        if ( this.alpha > 1.0 ) this.alpha = 0.0;
        var channel;

        channel = this.material.getDiffuse();
        channel[ 3 ] = this.alpha;

        return true;
    }
};




function createScene() {
    root = new osg.Node();

    // Base world transform
    world = new osg.MatrixTransform();
    world.setName('world');
    root.addChild(world);


    // Reference to center
    var cubeModel = osg.createTexturedBoxGeometry(0, 0, 0, 1, 1, 1);
    var rightEyeModel = osg.createTexturedBoxGeometry(0.25, -0.5, 0.25, 0.25, 0.25, 0.25);
    var leftEyeModel = osg.createTexturedBoxGeometry(-0.25, -0.5, 0.25, 0.25, 0.25, 0.25);
    var mouthModel = osg.createTexturedBoxGeometry(0.0, -0.5, -0.15, 0.50, 0.25, 0.25);

    // Create Torso Chest and Mid
    var torsoChestModel = osg.createTexturedBoxGeometry(0, 0, 0, 3, 1, 2);
    var torsoMidModel = osg.createTexturedBoxGeometry(0, 0, -2, 2, 1, 2);

    // Create Neck and Head
    var neckModel = osg.createTexturedBoxGeometry(0, 0, 0, 0.5, 0.5, 1);
    var headModel = osg.createTexturedBoxGeometry(0, 0, 0, 1, 1, 1);

    // Arm Models
    var shoulderModel = osg.createTexturedBoxGeometry(0, 0, 0, 2, 1, 1);
    var elbowModel = osg.createTexturedBoxGeometry(0, 0, 0, 1.5, 1, 1);
    var wristModel = osg.createTexturedBoxGeometry(0, 0, 0, 1, 1, 1);

    // Leg Models
    var hipModel = osg.createTexturedBoxGeometry(0, 0, 0, 1, 1, 2);
    var kneeModel = osg.createTexturedBoxGeometry(0, 0, 0, 1, 1, 2.5);
    var footModel = osg.createTexturedBoxGeometry(0, 0, 0, 1, 1, 1);


    // Torso and Chest
    torsoChest = createSegment(torsoChestModel, [0.8, 0.0, 0.0, 0.8]);
    torsoChest.setName("torsoChest");
    world.addChild(torsoChest);

    torsoMid = createSegment(torsoMidModel, [0.8, 0.0, 0.0, 0.8]);
    torsoMid.setName("torsoMid");
    torsoChest.addChild(torsoMid);

    // Neck and Head
    neck = createSegment(neckModel, [0.8, 0.0, 0.0, 0.8]);
    neck.setName("neck");
    neck.setMatrix(osg.Matrix.makeTranslate(0, 0, 1, osg.Matrix.create()));
    torsoChest.addChild(neck);

    head = createSegment(headModel, [0.8, 0.0, 0.0, 0.8]);
    head.setName("head");
    head.setMatrix(osg.Matrix.makeTranslate(0, 0, 1, osg.Matrix.create()));
    neck.addChild(head);

    rightEye = createSegment(rightEyeModel, [0.0, 0.8, 0.0, 0.8]);
    head.addChild(rightEye);

    leftEye = createSegment(leftEyeModel, [0.0, 0.8, 0.0, 0.8]);
    head.addChild(leftEye);

    mouth = createSegment(mouthModel, [0.0, 0.8, 0.0, 0.8]);
    head.addChild(mouth);

    // Right Arm
    rightShoulder = createSegment(shoulderModel, [0.8, 0.0, 0.0, 0.8]);
    rightShoulder.setName("rightShoulder");
    rightShoulder.setMatrix(osg.Matrix.makeTranslate(2.0, 0, 0.5, osg.Matrix.create()));
    torsoChest.addChild(rightShoulder);

    rightElbow = createSegment(elbowModel, [0.8, 0.0, 0.0, 0.8]);
    rightElbow.setName("rightElbow");
    rightElbow.setMatrix(osg.Matrix.makeTranslate(1.5, 0, 0, osg.Matrix.create()));
    rightShoulder.addChild(rightElbow);

    rightWrist = createSegment(wristModel, [0.8, 0.0, 0.0, 0.8]);
    rightWrist.setName("rightWrist");
    rightWrist.setMatrix(osg.Matrix.makeTranslate(1, 0, 0, osg.Matrix.create()));
    rightElbow.addChild(rightWrist);

    // Left Arm
    leftShoulder = createSegment(shoulderModel, [0.8, 0.0, 0.0, 0.8]);
    leftShoulder.setName("leftShoulder");
    leftShoulder.setMatrix(osg.Matrix.makeTranslate(-2.0, 0, 0.5, osg.Matrix.create()));
    torsoChest.addChild(leftShoulder);

    leftElbow = createSegment(elbowModel, [0.8, 0.0, 0.0, 0.8]);
    leftElbow.setName("leftElbow");
    leftElbow.setMatrix(osg.Matrix.makeTranslate(-1.5, 0, 0, osg.Matrix.create()));
    leftShoulder.addChild(leftElbow);

    leftWrist = createSegment(wristModel, [0.8, 0.0, 0.0, 0.8]);
    leftWrist.setName("leftWrist");
    leftWrist.setMatrix(osg.Matrix.makeTranslate(-1, 0, 0, osg.Matrix.create()));
    leftElbow.addChild(leftWrist);

    // Right Leg
    rightHip = createSegment(hipModel, [0.8, 0.0, 0.0, 0.8]);
    rightHip.setName("rightHip");
    rightHip.setMatrix(osg.Matrix.makeTranslate(1, 0, -4, osg.Matrix.create()));
    torsoMid.addChild(rightHip);

    rightKnee = createSegment(kneeModel, [0.8, 0.0, 0.0, 0.8]);
    rightKnee.setName("rightKnee");
    rightKnee.setMatrix(osg.Matrix.makeTranslate(0, 0, -2, osg.Matrix.create()));
    rightHip.addChild(rightKnee);

    rightFoot = createSegment(footModel, [0.8, 0.0, 0.0, 0.8]);
    rightFoot.setName("rightAnkle");
    rightFoot.setMatrix(osg.Matrix.makeTranslate(0, 0, -1, osg.Matrix.create()));
    rightKnee.addChild(rightFoot);

    // Left Leg
    leftHip = createSegment(hipModel, [0.8, 0.0, 0.0, 0.8]);
    leftHip.setName("leftHip");
    leftHip.setMatrix(osg.Matrix.makeTranslate(-1, 0, -4, osg.Matrix.create()));
    torsoMid.addChild(leftHip);

    leftKnee = createSegment(kneeModel, [0.8, 0.0, 0.0, 0.8]);
    leftKnee.setName("leftKnee");
    leftKnee.setMatrix(osg.Matrix.makeTranslate(0, 0, -2, osg.Matrix.create()));
    leftHip.addChild(leftKnee);

    leftFoot = createSegment(footModel, [0.8, 0.0, 0.0, 0.8]);
    leftFoot.setName("leftAnkle");
    leftFoot.setMatrix(osg.Matrix.makeTranslate(0, 0, -1, osg.Matrix.create()));
    leftKnee.addChild(leftFoot);

    return root;
}

function createSegment(geom, color) {
    var seg = new osg.MatrixTransform();
    seg.addChild( geom );

    seg.getOrCreateStateSet().setRenderingHint( 'TRANSPARENT_BIN' );
    seg.getOrCreateStateSet().setAttributeAndModes( new osg.BlendFunc( 'SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA' ) );
    seg.getOrCreateStateSet().setAttributeAndModes( new osg.CullFace( 'DISABLE' ) );

    // add a stateSet of texture to cube
    var material = new osg.Material();
    material.setDiffuse( color );
    material.setAmbient( color );
    material.setSpecular( [ 1.0, 1.0, 0.0, 0.0 ] );
    material.setEmission( [ 0.0, 0.0, 0.0, 0.5 ] );
    seg.getOrCreateStateSet().setAttributeAndMode( material );
    return seg;
}

var poseData = [{part: "head", orient: "x", val: 20},
                {part: "rightShoulder", orient: "y", val: 320},
                {part: "rightElbow", orient: "z", val: 60},
                {part: "rightWrist", orient: "z", val: 45},
                {part: "leftShoulder", orient: "y", val: 40},
                {part: "leftElbow", orient: "z", val: 300},
                {part: "leftWrist", orient: "z", val: 320},
                {part: "rightHip", orient: "x", val: 45},
                {part: "rightKnee", orient: "x", val: 340},
                {part: "rightAnkle", orient: "x", val: 30},
                {part: "leftHip", orient: "x", val: 315},
                {part: "leftKnee", orient: "x", val: 20},
                {part: "leftAnkle", orient: "x", val: 315}];


function resetPose() {
  var parts = ["head", "rightShoulder", "rightElbow", "rightWrist", "leftShoulder",
                "leftElbow", "leftWrist", "rightHip", "rightKnee", "rightAnkle",
                "leftHip", "leftKnee", "leftAnkle"];

  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];
    var finder = new FindByNameVisitor(part);
    root.accept(finder);
    elem = finder.found;
    osg.Matrix.makeRotate(degToRad(0), 1.0, 0.0, 0.0, elem.getMatrix());
    osg.Matrix.makeRotate(degToRad(0), 0.0, 1.0, 0.0, elem.getMatrix());
    osg.Matrix.makeRotate(degToRad(0), 0.0, 0.0, 1.0, elem.getMatrix());
  }
}

function setPose() {
  for (var i = 0; i < poseData.length; i++) {
    // Get part data
    var part = poseData[i].part;
    var ori = poseData[i].orient;
    var val = poseData[i].val;

    // Set the orientation
    var finder = new FindByNameVisitor(part);
    root.accept(finder);

    if (finder.found !== undefined) {
        elem = finder.found;
        switch (ori) { // (angle, x, y, z, result)
            case 'x':
                osg.Matrix.makeRotate(degToRad(val), 1.0, 0.0, 0.0, elem.getMatrix() );
                break;
            case'y':
                osg.Matrix.makeRotate(degToRad(val), 0.0, 1.0, 0.0, elem.getMatrix() );
                break;
            case 'z':
                osg.Matrix.makeRotate(degToRad(val), 0.0, 0.0, 1.0, elem.getMatrix() );
                break;
        }
    }
  }


  // var finder = new FindByNameVisitor("world");
  // root.accept(finder);
  //
  // elem = finder.found;
  // osg.Matrix.makeRotate(degToRad(180), 1.0, 0.0, 0.0, elem.getMatrix() );

}


function handleScroll(slider) {
    var part = slider.name;
    var ori = slider.attributes["orien"].nodeValue;
    var val = slider.value;

    // Find the node
    var finder = new FindByNameVisitor( part );
    root.accept( finder );

    if (finder.found !== undefined) {
        elem = finder.found;
        switch (ori) { // (angle, x, y, z, result)
            case 'x':
                osg.Matrix.makeRotate(degToRad(val), 1.0, 0.0, 0.0, elem.getMatrix() );
                break;
            case'y':
                osg.Matrix.makeRotate(degToRad(val), 0.0, 1.0, 0.0, elem.getMatrix() );
                break;
            case 'z':
                osg.Matrix.makeRotate(degToRad(val), 0.0, 0.0, 1.0, elem.getMatrix() );
                break;
        }
    }

}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

// Here we create a new form of
// Scene Graph Visitor
var FindByNameVisitor = function ( name ) {
    osg.NodeVisitor.call( this, osg.NodeVisitor.TRAVERSE_ALL_CHILDREN );
    this._name = name;
};

FindByNameVisitor.prototype = osg.objectInherit( osg.NodeVisitor.prototype, {
    // in found we'll store our resulting matching node
    init: function () {
        this.found = undefined;
    },
    // the crux of it
    apply: function ( node ) {
        if ( node.getName() == this._name ) {
            this.found = node;
            return;
        }
        this.traverse( node );
    }
} );


window.addEventListener( 'load', main, true );
