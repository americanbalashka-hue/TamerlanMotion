import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import { createCanvas, loadImage } from '@napi-rs/canvas'; // работает на Vercel

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const uploadBtn = document.getElementById('uploadBtn');

uploadBtn.addEventListener('click', async () => {
  const photoFile = document.getElementById('photo').files[0];
  const videoFile = document.getElementById('video').files[0];
  const mindFile = document.getElementById('mind').files[0];

  const clientId = Date.now().toString(); // уникальный ID клиента

  // 1️⃣ Загружаем видео и mind в Storage
  const { data: videoData } = await supabase.storage
    .from('clients')
    .upload(`${clientId}/video.mp4`, videoFile);

  const { data: mindData } = await supabase.storage
    .from('clients')
    .upload(`${clientId}/mind.mind`, mindFile);

  // 2️⃣ Генерируем QR-код
  const arUrl = `${window.location.origin}/ar.html?id=${clientId}`;
  const qrDataUrl = await QRCode.toDataURL(arUrl);

  // 3️⃣ Накладываем QR-код на фото
  const photo = await loadImage(photoFile);
  const canvas = createCanvas(photo.width, photo.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(photo, 0, 0, photo.width, photo.height);
  const qr = await loadImage(qrDataUrl);
  const qrSize = photo.width * 0.2;
  ctx.drawImage(qr, 10, photo.height - qrSize - 10, qrSize, qrSize);

  const finalPhotoBuffer = canvas.toBuffer();

  const { data: photoData } = await supabase.storage
    .from('clients')
    .upload(`${clientId}/photo_with_qr.jpg`, finalPhotoBuffer);

  // 4️⃣ Записываем в таблицу
  await supabase.from('clients').insert([{
    clientId,
    photoUrl: photoData.path,
    videoUrl: videoData.path,
    mindUrl: mindData.path,
    qrUrl: qrDataUrl
  }]);

  alert('Файлы загружены и QR-код добавлен!');
});
