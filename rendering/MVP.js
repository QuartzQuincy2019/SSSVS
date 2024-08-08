
//Camera Transform
/**
 * 进行相机变换
 * 后期会进行修改
 * @description 对所有点进行坐标变换。方法是：先将点的坐标与位移向量M相减，再乘以S坐标系方向矩阵的逆。
 * @param {Matrix} point 3*1的坐标矩阵
 */
function cameraTransform(point) {
    var Mv = clipMatrix(OBSERVER_COORDINATE, 0, 3, 2, 3);
    let n = matrixAdd(point, matrixScale(-1, Mv));
    var Rt = clipMatrix(OBSERVER_COORDINATE, 0, 0, 2, 2);
    var RtV = Rt.getInverse();
    n = matrixMultiply(RtV, n);
    return n;
}


