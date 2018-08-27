var projectionMatrix;

var shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute,
    shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

var duration = 5000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
var vertexShaderSource =
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
var fragmentShaderSource =
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas)
{
    var gl = null;
    var msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try
    {
        gl = canvas.getContext("experimental-webgl");
    }
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;
 }

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 10000);
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

// Create the vertex, color and index data for a multi-colored cube
function createPyramid(gl, translation, rotationAxis)
{
    // Vertex Data
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let pentagonVerts = [
      [Math.cos((-126*Math.PI)/180), -1.0,  (-1*Math.sin((-126*Math.PI)/180))], // 1 - 0
      [Math.cos((-54*Math.PI)/180), -1.0,  (-1*Math.sin((-54*Math.PI)/180))], // 2 - 1
      [Math.cos((18*Math.PI)/180), -1.0,  (-1*Math.sin((18*Math.PI)/180))], // 3 - 2
      [0.0, -1.0, -1.0], // 4 - 3
      [Math.cos((162*Math.PI)/180), -1.0,  (-1*Math.sin((162*Math.PI)/180))] // 5 - 4
    ]
    let pointVertex = [0.0,  1.0,  0.0];
    var verts = [];
    verts = verts.concat(pentagonVerts[0]);
    verts = verts.concat(pentagonVerts[1]);
    verts = verts.concat(pentagonVerts[2]);
    verts = verts.concat(pentagonVerts[3]);
    verts = verts.concat(pentagonVerts[4]);

    verts = verts.concat(pentagonVerts[0]);
    verts = verts.concat(pentagonVerts[1]);
    verts = verts.concat(pointVertex);

    verts = verts.concat(pentagonVerts[1]);
    verts = verts.concat(pentagonVerts[2]);
    verts = verts.concat(pointVertex);

    verts = verts.concat(pentagonVerts[2]);
    verts = verts.concat(pentagonVerts[3]);
    verts = verts.concat(pointVertex);

    verts = verts.concat(pentagonVerts[3]);
    verts = verts.concat(pentagonVerts[4]);
    verts = verts.concat(pointVertex);

    verts = verts.concat(pentagonVerts[4]);
    verts = verts.concat(pentagonVerts[0]);
    verts = verts.concat(pointVertex);
    console.log("verts",verts);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Bse face
        [0.0, 1.0, 0.0, 1.0], // 1 face
        [0.0, 0.0, 1.0, 1.0], // 2 face
        [1.0, 1.0, 0.0, 1.0], // 3 face
        [1.0, 0.0, 1.0, 1.0], // 4 face
        [0.0, 1.0, 1.0, 1.0]  // 5 face
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    var vertexColors = [];
    // for (var i in faceColors)
    // {
    //     var color = faceColors[i];
    //     for (var j=0; j < 4; j++)
    //         vertexColors = vertexColors.concat(color);
    // }
    for(let i = 0; i<5;i++)
    vertexColors = vertexColors.concat(faceColors[0]);
    for(let i = 0; i<5;i++)
    {
      console.log("i",i);
        for (var j=0; j < 3; j++)
            vertexColors = vertexColors.concat(faceColors[i+1]);
    }
    console.log("vertexColors",vertexColors.length,verts.length);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    var cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
    var cubeIndices = [
        0, 1, 2,  0, 2, 4,  4, 2, 3,  // Base face
        5, 6, 7,     // Face 1 - 2 - 6
        8, 9, 10,    // Face 2 - 3 - 6
        11, 12, 13,  // Face 3 - 4 - 6
        14, 15, 16,  // Face 4 - 5 - 6
        17, 18, 19,  // Face 5 - 1 - 6
    ];
    console.log("cubeIndices",cubeIndices.length);
    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    var cube = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:cubeIndexBuffer,
            vertSize:3, nVerts:20, colorSize:4, nColors: 20, nIndices:24,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(cube.modelViewMatrix, cube.modelViewMatrix, translation);

    cube.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return cube;
}

function createScutoid(gl, translation, rotationAxis)
{
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let pentagonVerts = [
      [Math.cos((-126*Math.PI)/180), -2.0,  (-1*Math.sin((-126*Math.PI)/180))], // 0
      [Math.cos((-54*Math.PI)/180), -2.0,  (-1*Math.sin((-54*Math.PI)/180))], // 1
      [Math.cos((18*Math.PI)/180), -2.0,  (-1*Math.sin((18*Math.PI)/180))], // 2
      [0.0, -2.0, -1.0], // 3
      [Math.cos((162*Math.PI)/180), -2.0,  (-1*Math.sin((162*Math.PI)/180))] // 4
    ]
    let pointVertex = [0.0,  0.0,  -1.0];
    let hexagonVerts = [
      [Math.cos((-120*Math.PI)/180), 2.0,  (-1*Math.sin((-120*Math.PI)/180))], // 0 - 5
      [Math.cos((-60*Math.PI)/180), 2.0,  (-1*Math.sin((-60*Math.PI)/180))], // 1 - 6
      [Math.cos((0*Math.PI)/180), 2.0,  (-1*Math.sin((0*Math.PI)/180))], // 2 - 7
      [Math.cos((60*Math.PI)/180), 2.0,  (-1*Math.sin((60*Math.PI)/180))], // 3 - 8
      [Math.cos((120*Math.PI)/180), 2.0,  (-1*Math.sin((120*Math.PI)/180))], // 4 - 9
      [Math.cos((180*Math.PI)/180), 2.0,  (-1*Math.sin((180*Math.PI)/180))] // 5 - 10
    ]
    let verts = [];
    verts = verts.concat(pentagonVerts[0]); // 0
    verts = verts.concat(pentagonVerts[1]); // 1
    verts = verts.concat(pentagonVerts[2]); // 2
    verts = verts.concat(pentagonVerts[3]); // 3
    verts = verts.concat(pentagonVerts[4]); // 4

    verts = verts.concat(pentagonVerts[0]); // 5
    verts = verts.concat(pentagonVerts[1]); // 6
    verts = verts.concat(hexagonVerts[1]); // 7
    verts = verts.concat(hexagonVerts[0]); // 8

    verts = verts.concat(pentagonVerts[1]); // 9
    verts = verts.concat(pentagonVerts[2]); // 10
    verts = verts.concat(hexagonVerts[2]); // 11
    verts = verts.concat(hexagonVerts[1]); // 12

    verts = verts.concat(pentagonVerts[2]); // 13
    verts = verts.concat(pentagonVerts[3]); // 14
    verts = verts.concat(pointVertex); // 15
    verts = verts.concat(hexagonVerts[3]); // 16
    verts = verts.concat(hexagonVerts[2]); // 17

    verts = verts.concat(pointVertex); // 18
    verts = verts.concat(hexagonVerts[4]); // 19
    verts = verts.concat(hexagonVerts[3]); // 20


    verts = verts.concat(pentagonVerts[3]); // 21
    verts = verts.concat(pentagonVerts[4]); // 22
    verts = verts.concat(hexagonVerts[5]); // 23
    verts = verts.concat(hexagonVerts[4]); // 24
    verts = verts.concat(pointVertex); // 25

    verts = verts.concat(pentagonVerts[4]); // 26
    verts = verts.concat(pentagonVerts[0]); // 27
    verts = verts.concat(hexagonVerts[0]); // 28
    verts = verts.concat(hexagonVerts[5]); // 29

    verts = verts.concat(hexagonVerts[0]); // 30
    verts = verts.concat(hexagonVerts[1]); // 31
    verts = verts.concat(hexagonVerts[2]); // 32
    verts = verts.concat(hexagonVerts[3]); // 33
    verts = verts.concat(hexagonVerts[4]); // 34
    verts = verts.concat(hexagonVerts[5]); // 35

    console.log("verts",verts);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Bse face
        [0.0, 1.0, 0.0, 1.0], // 1 face
        [0.0, 0.0, 1.0, 1.0], // 2 face
        [1.0, 1.0, 0.0, 1.0], // 3 face
        [1.0, 0.0, 1.0, 1.0], // 4 face
        [0.0, 1.0, 1.0, 1.0],  // 5 face
        [1.0, 0.5, 1.0, 1.0],  // 6 face
        [0.5, 0.0, 0.5, 1.0], // Bse face
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    var vertexColors = [];
    for(let i = 0; i<5;i++) // Pentagon face
    vertexColors = vertexColors.concat(faceColors[0]);
    for(let i = 0; i<4;i++) // First face
    vertexColors = vertexColors.concat(faceColors[1]);
    for(let i = 0; i<4;i++) // Second face
    vertexColors = vertexColors.concat(faceColors[2]);
    for(let i = 0; i<5;i++) // Third face
    vertexColors = vertexColors.concat(faceColors[3]);
    for(let i = 0; i<3;i++) // Triangle face
    vertexColors = vertexColors.concat(faceColors[4]);
    for(let i = 0; i<5;i++) // Fourth face
    vertexColors = vertexColors.concat(faceColors[5]);
    for(let i = 0; i<4;i++) // Fifth face
    vertexColors = vertexColors.concat(faceColors[6]);
    for(let i = 0; i<6;i++) // Hexagon face
    vertexColors = vertexColors.concat(faceColors[7]);

    console.log("vertexColors scutoid",vertexColors.length,verts.length);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
    let cubeIndices = [
        0, 1, 2,   0, 2, 4,   4, 2, 3,  // Pentagon face
        5, 6, 8,   6, 8, 7,    // Face 1
        9, 10, 11,   11, 12, 9,   // Face 2
        13, 16, 17,   13, 14, 16,  14,  15, 16, // Face 3
        18, 19, 20,  // Face 4 (triangle)
        21, 24, 25,   21, 22, 24,   22, 23, 24,  // Face 5
        26, 27, 28,   26, 28, 29, // Face 6
        30, 31, 32,   30, 32, 35,   32, 35, 33,   33, 34, 35
    ];
    console.log("verts 24",verts[24]);
    console.log("cubeIndices",cubeIndices.length);
    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    var cube = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:cubeIndexBuffer,
            vertSize:3, nVerts:36, colorSize:4, nColors: 36, nIndices: cubeIndices.length,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(cube.modelViewMatrix, cube.modelViewMatrix, translation);

    // translate(mat4,cube,translation);
    cube.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return cube;
}

// function translate(mat4,cube,translation){
//   setTimeout(()=>{
//     console.log("translate",translation[0]);
//     mat4.translate(cube.modelViewMatrix, cube.modelViewMatrix, translation);
//     translation[0] = ((translation[0]+0.1)%1);
//     translate(mat4,cube,translation);
//   },100);
// }

function createOchtahedron(gl, translation, rotationAxis)
{
    // Vertex Data
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let rectangleVerts = [
      [-1.0, 0.0, -1.0], // 0
      [1.0, 0.0, -1.0], // 1
      [1.0, 0.0, 1.0], // 2
      [-1.0, 0.0, 1.0], // 3
    ];
    let pointTopVertex = [0.0,  1.5,  0.0];
    console.log("pointTopVertex",pointTopVertex);
    let pointBottomVertex = [0.0,  -1.5,  0.0];
    console.log("pointBottomVertex",pointBottomVertex);
    var verts = [];
    for(let rectangleVert in rectangleVerts){
      verts = verts.concat(rectangleVerts[rectangleVert]);
      verts = verts.concat(rectangleVerts[(parseInt(rectangleVert)+1)%4]);
      verts = verts.concat(pointBottomVertex);
    }
    for(let rectangleVert in rectangleVerts){
      verts = verts.concat(rectangleVerts[rectangleVert]);
      verts = verts.concat(rectangleVerts[(parseInt(rectangleVert)+1)%4]);
      verts = verts.concat(pointTopVertex);
    }
    console.log("verts",verts);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [1.0, 0.0, 0.0, 1.0], // 0 face
        [0.0, 1.0, 0.0, 1.0], // 1 face
        [0.0, 0.0, 1.0, 1.0], // 2 face
        [1.0, 1.0, 0.0, 1.0], // 3 face
        [1.0, 0.0, 1.0, 1.0], // 4 face
        [0.0, 1.0, 1.0, 1.0], // 5 face
        [0.72, 0.1, 1, 1.0], // 6 face
        [0.5, 0.25, 0.0, 1.0], // 7 face
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    var vertexColors = [];
    // for (var i in faceColors)
    // {
    //     var color = faceColors[i];
    //     for (var j=0; j < 4; j++)
    //         vertexColors = vertexColors.concat(color);
    // }
    for(let i = 0; i<8;i++)
    {
      // console.log("i",i);
        for (var j=0; j < 3; j++)
            vertexColors = vertexColors.concat(faceColors[i]);
    }
    console.log("vertexColors",vertexColors.length,verts.length);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    var cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
    var cubeIndices = [];
    for(let i = 0; i  <= (verts.length/3);i++)
    // console.log("i",i);
    cubeIndices.push(i)
    console.log("cubeIndices",cubeIndices.length);
    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    var cube = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:cubeIndexBuffer,
            vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices:24,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(cube.modelViewMatrix, cube.modelViewMatrix, translation);

    cube.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
        if(!this.position)
        this.position = 0;
        this.position = (this.position+(this.isUp?0.01:-0.01));
        if(this.position>=1)
        this.isUp = false;
        if(this.position<=-1)
        this.isUp = true;
        mat4.translate(cube.modelViewMatrix, cube.modelViewMatrix, [0,this.isUp?0.01:-0.01,0]);

    };

    return cube;
}

function createShader(gl, str, type)
{
    var shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl)
{
    // load and compile the fragment and vertex shader
    var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    var vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);

    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs)
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i<objs.length; i++)
    {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs)
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });
    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}
