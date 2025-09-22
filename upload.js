import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js';

const supabaseUrl = 'https://macmkxamifmwnfndzqey.supabase.co'; // твой Supabase URL
const supabaseKey = 'sb_publishable_ctFkza51tkKuXenyk6d0Qw_OY1r0M-y'; // твой anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const photoInput = document.getElementById('photo');
const videoInput = document.getElementById('video');
const mindInput = document.getElementById('mind');
const uploadBtn = document.getElementById('uploadBtn');
const resultDiv = document.createElement('div');
document.body.appendChild(resultDiv);

uploadBtn.addEventListener('click', async () => {
  resultDiv.innerHTML = ''; // очищаем результат
  const files = [
    { file: photoInput.files[0], type: 'photo' },
    { file: videoInput.files[0], type: 'video' },
    { file: mindInput.files[0], type: 'mind' }
  ];

  for (let f of files) {
    if (!f.file) continue;

    const fileName = `${Date.now()}_${f.file.name}`;
    const { data, error } = await supabase
      .storage
      .from('clients') // bucket
      .upload(fileName, f.file, { upsert: true });

    if (error) {
      resultDiv.innerHTML += `<p style="color:red">Ошибка загрузки ${f.type}: ${error.message}</p>`;
      console.error(error);
    } else {
      const fileUrl = supabase.storage.from('clients').getPublicUrl(fileName).data.publicUrl;
      resultDiv.innerHTML += `<p style="color:green">${f.type} загружен: <a href="${fileUrl}" target="_blank">Открыть</a></p>`;

      // Генерация QR-кода для файла
      const qrCanvas = document.createElement('canvas');
      resultDiv.appendChild(qrCanvas);
      QRCode.toCanvas(qrCanvas, fileUrl, { width: 100 }, function (err) {
        if (err) console.error(err);
      });
    }
  }
});