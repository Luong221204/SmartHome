const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
    console.log('✅ Đã giả lập ESP32 kết nối thành công!');  
 
    setInterval(() => {
       const temp = (Math.random() * 10 + 20).toFixed(2);
const humidity = (Math.random() * 10 + 30).toFixed(2);

const payloadObj = {
  sensorId: 'fUBZH5TAKi5Y8hTiUhfb',
  current: {
    temperature: temp,
    humidity: humidity
  }
};

// Destructure từ object
const { sensorId, current } = payloadObj;

// Chuyển sang Map đã chuẩn hóa số
const currentMap = new Map(
  Object.entries(current).map(([key, value]) => [key, parseFloat(value)])
);

console.log(`Sensor ID: ${sensorId}`);

for (const [type, value] of currentMap) {
  console.log(`Lưu dữ liệu - Loại: ${type}, Giá trị: ${value}`);
}

// Khi gửi MQTT mới stringify
const payload = JSON.stringify(payloadObj);
console.log('Gửi dữ liệu:', payload);

        client.publish('sensors/temp', payload);
    }, 5000);
});


