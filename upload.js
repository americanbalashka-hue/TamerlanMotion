import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';

// Подключение Supabase
const supabaseUrl = 'https://macmkxamifmwnfndzqey.supabase.co';
const supabaseKey = 'sb_publishable_ctFkza51tkKuXenyk6d0Qw_OY1r0M-y';
const supabase = createClient(supabaseUrl, supabaseKey);

// Кнопка и файлы
const uploadBtn = document.getElementById('uploadBtn');

uploadBtn.addEventListener('click', async () => {
  const photo = document.getElementById('photo').files[0];
  const video = document.getElementById('video').files[0];
  const mind = document.getElementById('mind').files[0];

  if (!photo || !video || !mind) {
    alert('Выберите все файлы!');
    return;
  }

  try {
    // Генерируем уникальный clientId (timestamp)
    const clientId = Date.now().toString();

    // Загружаем файлы в Supabase Storage
    const { error: photoError, data: photoData } = await supabase
      .storage
      .from('clients')
      .upload(`${clientId}/${photo.name}`, photo);

    const { error: videoError, data: videoData } = await supabase
      .storage
      .from('clients')
      .upload(`${clientId}/${video.name}`, video);

    const { error: mindError, data: mindData } = await supabase
      .storage
      .from('clients')
      .upload(`${clientId}/${mind.name}`, mind);

    if (photoError || videoError || mindError) {
      alert(`Ошибка при загрузке файлов: ${photoError?.message || videoError?.message || mindError?.message}`);
      return;
    }

    // Получаем публичные URL файлов
    const { publicURL: photoUrl } = supabase.storage.from('clients').getPublicUrl(`${clientId}/${photo.name}`);
    const { publicURL: videoUrl } = supabase.storage.from('clients').getPublicUrl(`${clientId}/${video.name}`);
    const { publicURL: mindUrl } = supabase.storage.from('clients').getPublicUrl(`${clientId}/${mind.name}`);

    // Генерируем уникальную ссылку для AR страницы
    const arLink = `https://yourdomain.com/ar/${clientId}`;

    // Генерируем QR-код
    const qrDataUrl = await QRCode.toDataURL(arLink);

    // Сохраняем запись в таблицу Base 1
    const { error: insertError } = await supabase
      .from('Base 1')
      .insert([{
        clientId,
        photoUrl,
        videoUrl,
        mindUrl,
        qrUrl: qrDataUrl,
      }]);

    if (insertError) {
      alert('Ошибка при сохранении данных: ' + insertError.message);
      return;
    }

    // Показываем результат на странице
    const resultDiv = document.getElementById('result') || document.createElement('div');
    resultDiv.id = 'result';
    resultDiv.innerHTML = `
      <h3>Файлы успешно загружены ✅</h3>
      <p>Ссылка AR: <a href="${arLink}" target="_blank">${arLink}</a></p>
      <img src="${qrDataUrl}" alt="QR Code" width="150">
    `;
    document.body.appendChild(resultDiv);

  } catch (err) {
    console.error(err);
    alert('Произошла ошибка при загрузке файлов ❌');
  }
});