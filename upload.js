import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js';

// ====== Подключение Supabase ======
const supabaseUrl = "https://macmkxamifmwnfndzqey.supabase.co"; // твой URL Supabase
const supabaseKey = "sb_publishable_ctFkza51tkKuXenyk6d0Qw_OY1r0M-y"; // твой publishable key
const supabase = createClient(supabaseUrl, supabaseKey);

document.getElementById('uploadBtn').addEventListener('click', async () => {
  const photoFile = document.getElementById('photo').files[0];
  const videoFile = document.getElementById('video').files[0];
  const mindFile = document.getElementById('mind').files[0];

  if (!photoFile || !videoFile || !mindFile) {
    alert("Выберите все 3 файла!");
    return;
  }

  try {
    const clientId = Date.now().toString(); // уникальный id для клиента

    // ====== Загружаем файлы в Supabase Storage ======
    const { data: photoData, error: photoError } = await supabase.storage
      .from('uploads')
      .upload(`photos/${clientId}_${photoFile.name}`, photoFile);

    if (photoError) throw photoError;

    const { data: videoData, error: videoError } = await supabase.storage
      .from('uploads')
      .upload(`videos/${clientId}_${videoFile.name}`, videoFile);

    if (videoError) throw videoError;

    const { data: mindData, error: mindError } = await supabase.storage
      .from('uploads')
      .upload(`mind/${clientId}_${mindFile.name}`, mindFile);

    if (mindError) throw mindError;

    // ====== Генерируем уникальную ссылку и QR-код ======
    const arUrl = `${window.location.origin}/ar.html?id=${clientId}`;
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, arUrl, { width: 100 });

    // ====== Вставляем QR-код на фото ======
    const img = new Image();
    img.src = URL.createObjectURL(photoFile);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      ctx.drawImage(qrCanvas, 10, img.height - qrCanvas.height - 10); // нижний левый угол
      canvas.toBlob(async (blob) => {
        const { data: finalPhotoData, error: finalPhotoError } = await supabase.storage
          .from('uploads')
          .upload(`photos_with_qr/${clientId}_${photoFile.name}`, blob);
        if (finalPhotoError) throw finalPhotoError;

        const qrUrl = supabase.storage.from('uploads').getPublicUrl(`photos_with_qr/${clientId}_${photoFile.name}`).publicURL;

        // ====== Сохраняем все ссылки в таблицу Supabase ======
        const { data: dbData, error: dbError } = await supabase
          .from('Base 1')
          .insert([{
            clientId,
            photoUrl: photoData.path,
            videoUrl: videoData.path,
            mindUrl: mindData.path,
            qrUrl,
          }]);

        if (dbError) throw dbError;

        alert("Файлы загружены и QR-код создан!");
      });
    };
  } catch (err) {
    console.error(err);
    alert("Ошибка при загрузке файлов: " + err.message);
  }
});