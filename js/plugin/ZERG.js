// ZERG.js

// 使用 Fetch API 读取 JSON 文件
// 
fetch('data/cube1.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('网络响应不是 OK');
    }
    return response.json(); // 解析 JSON 数据
  })
  .then(cubeData => {
    // 打印顶点坐标
    console.log('顶点坐标：');
    cubeData.vertices.forEach((vertex, index) => {
      console.log(`顶点 ${index + 1}: (${vertex.x}, ${vertex.y}, ${vertex.z})`);
    });
    
    // 打印面的顶点索引
    console.log('面的顶点索引：');
    cubeData.faces.forEach((face, index) => {
      console.log(`面 ${index + 1}: ${face.vertices}`);
    });
    
    // 打印材质信息
    console.log('材质信息：');
    console.log(`颜色：(${cubeData.material.color.r}, ${cubeData.material.color.g}, ${cubeData.material.color.b})`);
    console.log(`环境光系数：${cubeData.material.ambient}`);
    console.log(`漫反射光系数：${cubeData.material.diffuse}`);
    console.log(`镜面反射光系数：${cubeData.material.specular}`);
    console.log(`光泽度：${cubeData.material.shininess}`);
  })
  .catch(error => {
    console.error('读取 JSON 文件时出现错误：', error);
  });