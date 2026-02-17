const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
    console.log('✅ Đã giả lập ESP32 kết nối thành công!');
    
    // Giả lập gửi dữ liệu nhiệt độ mỗi 2 giây
    setInterval(() => {
        const temp = (Math.random() * 10 + 20).toFixed(2);
        const humidity = (Math.random() * 10 + 30).toFixed(2);
        const payload = JSON.stringify({sensorId:'fUBZH5TAKi5Y8hTiUhfb' ,
            current:{temperature: temp, humidity: humidity}});
            
        
        console.log('Gửi dữ liệu:', payload);
        client.publish('sensors/temp', payload);
    }, 2000);
});