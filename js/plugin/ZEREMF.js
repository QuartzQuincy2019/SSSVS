//ZEREMF.js
//ZER Extended Mathematical Functions
/**
 * @description ZEREMF.js relies on decimal.js
 */

PI = Decimal('3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789');


function gcd(a, b) {
    if (a % b == 0) return b;
    return gcd(b, a % b);
}

function isInteger() {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] % 1 != 0) return false;
    }
    return true;
}

function getQuotient(dividend, divisor) {
    if (!isInteger(dividend, divisor)) throw new Error("不允许接收小数！");
    if (dividend < 0 || divisor < 0) throw new Error("不允许接收负数！");
    var remainder = dividend % divisor;
    return (dividend - remainder) / divisor;
}

/**
 * 十进制换算任意进制。
 * @param {Number} base 基数。要求大于一。
 * @returns 
 */
Number.prototype.rebase = function (base) {
    if (base == 1 || !isInteger(base)) throw new Error("不允许使用错误的底！");
    var output = [];
    var cache = [];
    var dividend = this;
    var quotient = 0;
    // console.log(cache, dividend, quotient);
    do {
        quotient = getQuotient(dividend, base);
        cache.push(dividend % base);
        dividend = quotient;
    } while (quotient > 0);
    output = cache.reverse();
    return output;
}

Number.prototype.getFloat = function () {
    if (isInteger(this)) return this;
    if (this > 0) {
        var d = Math.floor(this);
        d = this - d;
        return d;
    } else {
        var a = Math.abs(this);
        var d = Math.abs(a);
        d = a - d;
        return -d;
    }
}

/**
 * 矩阵(Matrix)类
 */
class Matrix {
    /** 矩阵行数 */
    r;

    /** 矩阵列数 */
    c;

    /** matrix[i][j]：矩阵第i+1行第j+1列 */
    matrix;

    constructor(rows, columns) {
        this.r = rows;
        this.c = columns;
        this.matrix = new Array(rows);
        for (var i = 0; i < rows; i++) {
            this.matrix[i] = new Array(columns);
        }
    }
    clear() {
        for (var i = 0; i < this.r; i++) {
            for (var j = 0; j < this.c; j++) {
                this.matrix[i][j] = 0;
            }
        }
    }
    print(precision = 5) {
        var output = (this.r) + "×" + (this.c) + "<br>";
        for (var i = 0; i < this.r; i++) {
            for (var j = 0; j < this.c; j++) {
                output += (this.matrix[i][j].toFixed(precision) + " &emsp;");
            }
            output += "\n<br>";
        }
        return output;
    }
}

/**
 * 
 * @param {Matrix} matrix 
 * @param {Number} epsilon 
 * @returns {Matrix} 
 */
function matrixTidy(matrix) {
    var result = new Matrix(matrix.r, matrix.c);
    for (var i = 0; i < matrix.r; i++) {
        for (var j = 0; j < matrix.c; j++) {
            let cell = Decimal(matrix.matrix[i][j]);
            if (Decimal.abs(Decimal.sub(cell, 0)).lessThan(1e-8)) cell = Decimal(0);
            matrix.matrix[i][j] = cell;
        }
    }
    result = matrix;
    return result;
}

/**
 * 计算两个矩阵相乘的结果：A×B
 * @param {Matrix} A 
 * @param {Matrix} B 
 */
function matrixMultiply(A, B) {
    if (A.c != B.r) {
        throw new Error("两矩阵无法相乘。原因：A矩阵列数与B矩阵行数不相等。");
    }
    var result = new Matrix(A.r, B.c);
    var m = result.matrix;
    for (var i = 0; i < A.r; i++) {
        for (var j = 0; j < B.c; j++) {
            var u = Decimal(0);
            for (var k = 0; k < A.c; k++) {
                let a = Decimal(A.matrix[i][k]);
                let b = Decimal(B.matrix[k][j]);
                let old = Decimal(u);
                u = Decimal.add(old, Decimal.mul(a, b));
            }
            m[i][j] = u;
        }
    }
    result = matrixTidy(result);
    return result;
}

/**
 * 矩阵数乘
 * @param {Number} lambda 
 * @param {Matrix} A 
 * @returns {Matrix}
 */
function matrixScale(lambda, A) {
    var output = new Matrix(A.r, A.c);
    for (var i = 0; i < A.r; i++) {
        for (var j = 0; j < A.c; j++) {
            let cell = Decimal(A.matrix[i][j]);
            let u = Decimal(Decimal.mul(Decimal(lambda), cell))
            output.matrix[i][j] = u;
        }
    }
    output = matrixTidy(output);
    return output;
}

/**
 * 计算两个矩阵相加的结果
 * @param {Matrix} matrix1 
 * @param {Matrix} matrix2 
 * @returns 
 */
function matrixAdd(matrix1, matrix2) {
    if ((matrix1.r != matrix2.r) || (matrix1.c != matrix2.c)) {
        throw new Error("矩阵无法相加。");
    }
    var result = new Matrix(matrix1.r, matrix1.c);
    result.matrix = new Array(matrix1.r);
    for (var i = 0; i < matrix1.r; i++) {
        var row = new Array(matrix1.c);
        for (var j = 0; j < matrix1.c; j++) {
            let a = Decimal(matrix1.matrix[i][j]);
            let b = Decimal(matrix2.matrix[i][j]);
            let s = Decimal.add(a, b);
            row[j] = s;
        }
        result.matrix[i] = row;
    }
    result = matrixTidy(result);
    return result;
}

/**
 * 计算数个矩阵相乘的结果
 * @param  {...Matrix} matrices 
 * @returns 
 */
function matricesProduct(...matrices) {
    while (matrices.length > 1) {
        let newMatrix = matrixMultiply(matrices[matrices.length - 2], matrices[matrices.length - 1]);
        matrices.pop();
        matrices[matrices.length - 1] = newMatrix;
    }
    return matrices[0];
}

/**
 * 计算数个矩阵相加的结果
 * @param  {...Matrix} matrices 
 * @returns 
 */
function matricesSum(...matrices) {
    while (matrices.length > 1) {
        let newMatrix = matrixAdd(matrices[matrices.length - 2], matrices[matrices.length - 1]);
        matrices.pop();
        matrices[matrices.length - 1] = newMatrix;
    }
    return matrices[0];
}

function matrixPower(matrix, power) {
    var u = matrix;
    for (var i = 0; i < power - 1; i++) {
        u = matrixMultiply(matrix, u);
    }
    return u;
}

/**
 * 转置
 * @param {Matrix} matrix 
 */
function transpose(matrix) {
    var result = new Matrix(matrix.c, matrix.r);
    for (var i = 0; i < matrix.c; i++) {
        var n = new Array(matrix.r);
        for (var j = 0; j < matrix.r; j++) {
            n[j] = matrix.matrix[j][i];
        }
        result.matrix[i] = n;
    }
    return result;
}

/**
 * 两矩阵是否相等
 * @param {Matrix} matrix1 
 * @param {Matrix} matrix2 
 */
function areMatrixEqual(matrix1, matrix2) {
    if (matrix1.r == matrix2.r && matrix1.c == matrix2.c) {
        for (var i = 0; i < matrix1.r; i++) {
            for (var j = 0; j < matrix1.c; j++) {
                if (matrix1.matrix[i][j] != matrix2.matrix[i][j]) return false;
            }
        }
        return true;
    } else {
        return false;
    }
}

/**
 * 从原矩阵上剪取一块矩阵作为新矩阵
 * @param {Matrix} ingredientMatrix 
 * @param {Number} r1 
 * @param {Number} c1
 * @param {Number} r2
 * @param {Number} c2
 */
function clipMatrix(ingredientMatrix, r1, c1, r2, c2) {
    var minR = Math.min(r1, r2);
    var maxR = Math.max(r1, r2);
    var minC = Math.min(c1, c2);
    var maxC = Math.max(c1, c2);
    var output = new Matrix(maxR - minR + 1, maxC - minC + 1);
    var I = 0, J = 0;
    for (var i = minR; i < maxR + 1; i++) {
        for (var j = minC; j < maxC + 1; j++) {
            output.matrix[I][J] = ingredientMatrix.matrix[i][j];
            J++;
        }
        J = 0;
        I++;
    }
    return output;
}

/**
 * 
 * @param {Matrix} vector 
 */
function is3DVector(vector) {
    if ((vector.c == 1 && vector.r == 3) || (vector.c == 3 && vector.r == 1)) return true;
    return false;
}


/**
 * 判断矩阵是否是一个向量。
 * @param {Matrix} matrix 
 * @returns 
 */
function isVector(matrix) {
    if ((matrix.c == 1 && matrix.r > 1) || (matrix.c > 1 && matrix.r == 1)) return true;
    return false;
}

function isVerticalVector(vector) {
    if (vector.r > vector.c) return true;
    return false;
}

/**
 * 将数个竖向量合并为一个矩阵。
 * @param  {...Matrix} vectors 竖向量
 * @returns {Matrix}
 */
function concatenateVectors(...vectors) {
    if (vectors.length == 1) return vectors[0];
    var row = vectors[0].r;
    vectors.forEach(vector => {
        if (vector.r != row) {
            throw new Error("向量维度不相等，无法合并为矩阵。");
        }
    });
    var output = new Matrix(row, vectors.length);
    output.matrix = new Array(row);
    for (var i = 0; i < row; i++) {
        let r = new Array(vectors.length);
        for (var j = 0; j < vectors.length; j++) {
            r[j] = vectors[j].matrix[i][0];
        }
        output.matrix[i] = r;
    }
    return output;
}


var A = new Matrix(3, 3);
var B = new Matrix(2, 3);
var C = new Matrix(4, 3);
A.matrix = [[8, 5, 5], [9, 6, 7], [7, 7, 7]];
B.matrix = [[10, 12, 11], [19, 12, 16]];
C.matrix = [[24, 20, 24], [25, 21, 23], [29, 24, 28], [23, 26, 20]];
/**
 * 对列数相同或行数相同的矩阵进行合并。
 * @param  {...Matrix} matrices 
 */
function concatenateMatrices(...matrices) {
    var R = matrices[0].r;
    var C = matrices[0].c;
    if (matrices.every((mat) => mat.r == R)) {//列合并模式
        var Cf = 0;
        matrices.forEach((mat) => {
            Cf += mat.c;
        });
        var output = new Matrix(R, Cf);
        var J = 0;
        for (var i = 0; i < output.r; i++) {
            for (var j = 0; j < matrices.length; j++) {//j是矩阵数组序列号
                for (var k = 0; k < matrices[j].c; k++) {
                    output.matrix[i][J] = matrices[j].matrix[i][k];
                    J++;
                }
            }
            J = 0;
        }
        return output;
    }
    if (matrices.every((mat) => mat.c == C)) {
        var Rf = 0;
        matrices.forEach((mat) => {
            Rf += mat.r;
        });
        var output = new Matrix(Rf, C);
        var K = 0;
        for (var i = 0; i < matrices.length; i++) {
            for (var j = 0; j < matrices[i].r; j++) {
                output.matrix[K] = matrices[i].matrix[j];
                K++;
            }
        }
        return output;
    }
    throw new Error("无法合并矩阵！");
}
var D = concatenateMatrices(A, B, C);
var E = clipMatrix(D, 1, 0, 3, 2);

/**
 * 向量单位化
 * @param {Matrix} vector 
 * @returns 
 */
function uniteVector(vector) {
    var isVertical = false;
    if (isVerticalVector(vector)) {
        isVertical = true;
        vector = transpose(vector);
    }
    var dimension = vector.c;
    var commonFactor = Decimal(0);
    for (var i = 0; i < dimension; i++) {
        let c = Decimal(vector.matrix[0][i]);
        let a = Decimal(Decimal.pow(c, 2));
        let old = Decimal(commonFactor);
        commonFactor = Decimal.add(old, a);
    }
    commonFactor = Decimal.sqrt(commonFactor);
    var output = new Matrix(1, dimension);
    output.matrix = new Array(1);
    output.matrix[0] = new Array(dimension);
    for (var i = 0; i < dimension; i++) {
        output.matrix[0][i] = (Decimal.div(Decimal(vector.matrix[0][i]), commonFactor));
    }
    if (isVertical) {
        output = transpose(output);
    }
    return output;
}


/**
 * 
 * @param rad (Decimal or Number)
 */
function rad2deg(rad) {
    const d = Decimal(Decimal.div(180, PI));
    return Decimal.mul(rad, d);
}

function deg2rad(deg) {
    const d = Decimal(Decimal.div(180, PI));
    return Decimal.div(deg, d);
}