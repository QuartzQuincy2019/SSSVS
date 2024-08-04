//ZERSCF.js
//ZER Space Calculation Functions
/**
 * @description ZERSCF.js relies on ZEREMF.js
 * @description ZEREMF.js relies on decimal.js
 */

const VECTOR0 = new Matrix(4, 1);
VECTOR0.matrix = [[0], [0], [0], [0]];
const vectorMvInit = new Matrix(4, 1);
vectorMvInit.matrix = [[0], [0], [0], [1]];
const V03H = new Matrix(1, 3);
V03H.matrix = [[0, 0, 0]];
const V03V = new Matrix(3, 1);
V03V.matrix = [[0], [0], [0]];

const matrixMvInit = new Matrix(4, 3);
matrixMvInit.matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, 0]];


/**
 * 
 * @param {Matrix} matrix 
 */
function isExpanded3DMatrix(matrix) {
    if (!(matrix.r == 4 && matrix.c == 4)) return false;
    if (matrix.matrix[3][3] != 1) return false;
    if (matrix.matrix[2][0] == 0 && matrix.matrix[2][1] == 0 && matrix.matrix[2][2] == 0) return true;
    return false;
}


/**
 * 计算三维旋转矩阵
 * @param {Matrix} axisVector 
 * @param {Number} rotationAngle 
 * @returns {Matrix} 返回一个3*3旋转矩阵
 */
function calculateRotationMatrix(axisVector, rotationAngle) {
    axisVector = uniteVector(axisVector);
    if (!is3DVector(axisVector)) {
        throw new Error("旋转轴向量不是三维向量！");
    }
    if (axisVector.r == 1 && axisVector.c == 3) {
        axisVector = transpose(axisVector);
    }
    var x = Decimal(axisVector.matrix[0][0]);
    var y = Decimal(axisVector.matrix[1][0]);
    var z = Decimal(axisVector.matrix[2][0]);
    var S = Decimal.sin(rotationAngle);
    var C = Decimal.cos(rotationAngle);
    var Vx = new Matrix(3, 1);
    var Vy = new Matrix(3, 1);
    var Vz = new Matrix(3, 1);
    var u = new Decimal(1).minus(C);
    var x2 = Decimal.pow(x, 2);
    var y2 = Decimal.pow(y, 2);
    var z2 = Decimal.pow(z, 2);
    var xy = Decimal.mul(x, y);
    var xz = Decimal.mul(x, z);
    var yz = Decimal.mul(y, z);
    var xS = Decimal.mul(x, S);
    var yS = Decimal.mul(y, S);
    var zS = Decimal.mul(z, S);
    var uxy = Decimal.mul(u, xy);
    var uyz = Decimal.mul(u, yz);
    var uxz = Decimal.mul(u, xz);
    Vx.matrix = [
        [Decimal(Decimal.add(Decimal.mul(u, x2), C))],
        [Decimal(Decimal.add(uxy, zS))],
        [Decimal(Decimal.sub(uxz, yS))]
    ];
    Vy.matrix = [
        [Decimal(Decimal.sub(uxy, zS))],
        [Decimal(Decimal.add(Decimal.mul(u, y2), C))],
        [Decimal(Decimal.add(uyz, xS))]
    ];
    Vz.matrix = [
        [Decimal(Decimal.add(uxz, yS))],
        [Decimal(Decimal.sub(uyz, xS))],
        [Decimal(Decimal.add(Decimal.mul(u, z2), C))]
    ];
    var M = concatenateVectors(Vx, Vy, Vz).matrix;
    var result = new Matrix(3, 3);
    result.matrix = M;
    result = matrixTidy(result);
    return result;
}

/**
 * 
 * @param {Matrix} matrix 
 * @returns 
 */
function isMovementMatrix(matrix) {
    if (!isExpanded3DMatrix(matrix)) return false;
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            if (i == j && matrix.matrix[i][j] != 1) return false;
        }
    }
    if (matrix.matrix[3][3] != 1) return false;
    return true;
}


/**
 * 生成单位正交基底矩阵
 * @param {Number} dimensions 
 */
function generateOrthogonalCoordinateMatrix(dimensions = 4) {
    var output = new Matrix(dimensions, dimensions);
    output.matrix = new Array(dimensions);
    for (var i = 0; i < dimensions; i++) {
        output.matrix[i] = new Array(dimensions);
        for (var j = 0; j < dimensions; j++) {
            (i == j) ? output.matrix[i][j] = 1 : output.matrix[i][j] = 0;
        }
    }
    return output;
}

var O = new Matrix(4, 1);
O.matrix = [[Decimal(0)], [Decimal(0)], [Decimal(0)], [Decimal(0)]];
var O1 = new Matrix(4, 1);
O1.matrix = [[Decimal(0)], [Decimal(0)], [Decimal(0)], [Decimal(1)]];
var BrokenO = new Matrix(1, 1);
BrokenO.matrix = [[Decimal(0)]];
var StOCM3 = generateOrthogonalCoordinateMatrix(4);
var ObOCM3 = StOCM3;

/**
 * 移动坐标系
 * @param {Matrix} originCoordinate 4*4
 * @param {Matrix} movementMatrix 4*4
 */
function moveCoordinate(originCoordinate, movementMatrix) {
    return matrixMultiply(movementMatrix, originCoordinate)
}

/**
 * 
 * @param {Matrix} originCoordinate 原观测者相对坐标
 * @param {...Matrix} rotationMatrix 
 */
function rotateCoordinate3(originCoordinate, ...rotationMatrix) {
    var c = [originCoordinate];
    var d = rotationMatrix.concat(c);
    while (d.length > 1) {
        let newMatrix = matrixMultiply(d[d.length - 2], d[d.length - 1]);
        d.pop();
        d[d.length - 1] = newMatrix;
    }
    return d[0];
}


//用户坐标系统
var OBSERVER_COORDINATE = generateOrthogonalCoordinateMatrix(4);
var TOTAL_ROTATION_MATRIX = new Matrix(4, 4);
var DISTANCE_TO_ORIGIN = new Decimal(0);

/**
 * 获取观测者坐标系的朝向单位向量（观测者坐标系的某个轴的单位向量）和位移向量
 * @param {Matrix} observer_coordinate 
 * @param {String} info
 * @returns {Matrix} 获取信息矩阵的4*1单位分量
 */
function getPDMatrixInfo(observer_coordinate, info) {
    var m = observer_coordinate;
    var dimensions = 4;
    var infoCode = 0;
    switch (info) {
        case "X":
        case "x": infoCode = 0; break;
        case "Y":
        case "y": infoCode = 1; break;
        case "Z":
        case "z": infoCode = 2; break;
        case "m":
        case "M": infoCode = 3; break;
    }
    var dv = new Matrix(dimensions, 1);
    for (var i = 0; i < dimensions; i++) {
        dv.matrix[i][0] = m.matrix[i][infoCode];
    }
    //当前获得了4*1矩阵，但如果要进行单位化，需要进行判断
    if (infoCode < 3) {//即旋转矩阵或方向矩阵的分量，需要进行单位化
        var t = clipMatrix(dv, 0, 0, 2, 0);
        t = uniteVector(t);
        dv = concatenateMatrices(t, BrokenO);
    }
    return dv;
}

/**
 * 获取任意维空间中2点距离，必须是竖向量
 * @param {Matrix} point1 
 * @param {Matrix} point2 
 */
function getDistanceBetweenPoints(point1, point2) {
    var V1 = transpose(point1);
    var V2 = transpose(point2);
    var S = Decimal(0);
    for (var i = 0; i < V1.c; i++) {
        let a = Decimal(V1.matrix[0][i]);
        let b = Decimal(V2.matrix[0][i]);
        S = Decimal.add(S, Decimal.pow(Decimal.sub(a, b), 2));
    }
    let s = Decimal.sqrt(S);
    return s;
}

/**
 * 截取当前坐标系的方向矩阵
 * @param {Matrix} observer_coordinate 
 * @returns 
 */
function getDirectionMatrix(observer_coordinate) {
    return clipMatrix(observer_coordinate, 0, 0, 2, 2);
}

//Y轴——前方；X轴——右侧；Z轴——头顶
var PHI = Decimal.div(PI, 6);//单次旋转角
var OCPrecision = 4;
function refreshDisplay() {
    this.document.getElementById("origin_displayer").innerHTML = OBSERVER_COORDINATE.print(OCPrecision);
    this.document.getElementById("distance_displayer").innerHTML = "OS=" + DISTANCE_TO_ORIGIN.toNumber().toFixed(7);
}
window.addEventListener("keydown", function (e) {
    e.preventDefault();
    if (e.key == "w") {
        var movement = getPDMatrixInfo(OBSERVER_COORDINATE, "y");
        movement.matrix[3][0] = Decimal(1);
        movement = concatenateMatrices(matrixMvInit, movement);
        OBSERVER_COORDINATE = moveCoordinate(OBSERVER_COORDINATE, movement);
        DISTANCE_TO_ORIGIN = getDistanceBetweenPoints(getPDMatrixInfo(OBSERVER_COORDINATE, "m"), O1);
    }
    refreshDisplay();
});
window.addEventListener("keydown", function (e) {
    e.preventDefault();
    if (e.key == "s") {
        var movement = matrixScale(-1, getPDMatrixInfo(OBSERVER_COORDINATE, "y"));
        movement.matrix[3][0] = Decimal(1);
        movement = concatenateMatrices(matrixMvInit, movement);
        OBSERVER_COORDINATE = moveCoordinate(OBSERVER_COORDINATE, movement);
        DISTANCE_TO_ORIGIN = getDistanceBetweenPoints(getPDMatrixInfo(OBSERVER_COORDINATE, "m"), O1);
    }
    refreshDisplay();
});
window.addEventListener("keydown", function (e) {
    e.preventDefault();
    if (e.key == "d") {//右
        var movement = getPDMatrixInfo(OBSERVER_COORDINATE, "x");
        movement.matrix[3][0] = Decimal(1);
        movement = concatenateMatrices(matrixMvInit, movement);
        OBSERVER_COORDINATE = moveCoordinate(OBSERVER_COORDINATE, movement);
        DISTANCE_TO_ORIGIN = getDistanceBetweenPoints(getPDMatrixInfo(OBSERVER_COORDINATE, "m"), O1);
    }
    refreshDisplay();
});
window.addEventListener("keydown", function (e) {
    e.preventDefault();
    if (e.key == "a") {//左
        var movement = matrixScale(-1, getPDMatrixInfo(OBSERVER_COORDINATE, "x"));
        movement.matrix[3][0] = Decimal(1);
        movement = concatenateMatrices(matrixMvInit, movement);
        OBSERVER_COORDINATE = moveCoordinate(OBSERVER_COORDINATE, movement);
        DISTANCE_TO_ORIGIN = getDistanceBetweenPoints(getPDMatrixInfo(OBSERVER_COORDINATE, "m"), O1);
    }
    refreshDisplay();
});
window.addEventListener("keydown", function (e) {
    e.preventDefault();
    if (e.key == "Shift") {//上
        var movement = getPDMatrixInfo(OBSERVER_COORDINATE, "z");
        movement.matrix[3][0] = Decimal(1);
        movement = concatenateMatrices(matrixMvInit, movement);
        OBSERVER_COORDINATE = moveCoordinate(OBSERVER_COORDINATE, movement);
        DISTANCE_TO_ORIGIN = getDistanceBetweenPoints(getPDMatrixInfo(OBSERVER_COORDINATE, "m"), O1);
    }
    refreshDisplay();
});
window.addEventListener("keydown", function (e) {
    e.preventDefault();
    if (e.key == "Control") {//下
        var movement = matrixScale(-1, getPDMatrixInfo(OBSERVER_COORDINATE, "z"));
        movement.matrix[3][0] = Decimal(1);
        movement = concatenateMatrices(matrixMvInit, movement);
        OBSERVER_COORDINATE = moveCoordinate(OBSERVER_COORDINATE, movement);
        DISTANCE_TO_ORIGIN = getDistanceBetweenPoints(getPDMatrixInfo(OBSERVER_COORDINATE, "m"), O1);
    }
    refreshDisplay();
});
window.addEventListener("keydown", function (e) {
    e.preventDefault();
    if (e.key == "z") {//向左转30
        let axis = getPDMatrixInfo(OBSERVER_COORDINATE, "z");
        let position = getPDMatrixInfo(OBSERVER_COORDINATE, "m");
        axis = clipMatrix(axis, 0, 0, 2, 0);
        let R = calculateRotationMatrix(axis, PHI);
        let newDir = matrixMultiply(getDirectionMatrix(OBSERVER_COORDINATE), R);
        OBSERVER_COORDINATE = concatenateMatrices(concatenateMatrices(newDir, V03H), position);
    }
    refreshDisplay();
});
window.addEventListener("keydown", function (e) {
    e.preventDefault();
    if (e.key == "x") {//向右转30
        let axis = getPDMatrixInfo(OBSERVER_COORDINATE, "z");
        let position = getPDMatrixInfo(OBSERVER_COORDINATE, "m");
        axis = clipMatrix(axis, 0, 0, 2, 0);
        let R = calculateRotationMatrix(axis, -PHI);
        let newDir = matrixMultiply(getDirectionMatrix(OBSERVER_COORDINATE), R);
        OBSERVER_COORDINATE = concatenateMatrices(concatenateMatrices(newDir, V03H), position);
    }
    refreshDisplay();
});
window.addEventListener("keydown", function (e) {
    e.preventDefault();
    if (e.key == "q") {//向左翻滚30
        let axis = getPDMatrixInfo(OBSERVER_COORDINATE, "y");
        let position = getPDMatrixInfo(OBSERVER_COORDINATE, "m");
        axis = clipMatrix(axis, 0, 0, 2, 0);
        let R = calculateRotationMatrix(axis, PHI);
        let newDir = matrixMultiply(getDirectionMatrix(OBSERVER_COORDINATE), R);
        OBSERVER_COORDINATE = concatenateMatrices(concatenateMatrices(newDir, V03H), position);
    }
    refreshDisplay();
});
window.addEventListener("keydown", function (e) {
    e.preventDefault();
    if (e.key == "e") {//向右翻滚30
        let axis = getPDMatrixInfo(OBSERVER_COORDINATE, "y");
        let position = getPDMatrixInfo(OBSERVER_COORDINATE, "m");
        axis = clipMatrix(axis, 0, 0, 2, 0);
        let R = calculateRotationMatrix(axis, -PHI);
        let newDir = matrixMultiply(getDirectionMatrix(OBSERVER_COORDINATE), R);
        OBSERVER_COORDINATE = concatenateMatrices(concatenateMatrices(newDir, V03H), position);
    }
    refreshDisplay();
});
window.addEventListener("keydown", function (e) {
    e.preventDefault();
    if (e.key == "f") {//低头:x,-phi
        let axis = getPDMatrixInfo(OBSERVER_COORDINATE, "x");
        let position = getPDMatrixInfo(OBSERVER_COORDINATE, "m");
        axis = clipMatrix(axis, 0, 0, 2, 0);
        let R = calculateRotationMatrix(axis, -PHI);
        let newDir = matrixMultiply(getDirectionMatrix(OBSERVER_COORDINATE), R);
        OBSERVER_COORDINATE = concatenateMatrices(concatenateMatrices(newDir, V03H), position);
    }
    refreshDisplay();
});
window.addEventListener("keydown", function (e) {
    e.preventDefault();
    if (e.key == "r") {//仰头:x,+phi
        let axis = getPDMatrixInfo(OBSERVER_COORDINATE, "x");
        let position = getPDMatrixInfo(OBSERVER_COORDINATE, "m");
        axis = clipMatrix(axis, 0, 0, 2, 0);
        let R = calculateRotationMatrix(axis, PHI);
        let newDir = matrixMultiply(getDirectionMatrix(OBSERVER_COORDINATE), R);
        OBSERVER_COORDINATE = concatenateMatrices(concatenateMatrices(newDir, V03H), position);
    }
    refreshDisplay();
});