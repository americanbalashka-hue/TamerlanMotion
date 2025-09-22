import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://macmkxamifmwnfndzqey.supabase.co';
const supabaseKey = 'sb_publishable_ctFkza51tkKuXenyk6d0Qw_OY1r0M-y';
const supabase = createClient(supabaseUrl, supabaseKey);

const output = document.getElementById('output');
const qrcodeDiv = document.getElementById('qrcode');

async function uploadFile(file) {
  if (!file) return null;

  const fileName = `${Date.now()}_${file.name}`;

  try {
    const { data, error } = await supabase
      .storage
      .from('clients')  // имя bucket в Supabase
      .upload(fileName, file);

    if (error) {
      output.innerHTML += `<p style="color:red">Ошибка при загрузке ${file.name}: ${error.message}</p>`;
      return null;
    }

    output.innerHTML += `<p style="color:green">Файл ${file.name} загружен ✅</p>`;
    return fileName;
  } catch (err) {
    output.innerHTML += `<p style="color:red">Ошибка с ${file.name}: ${err.message}</p>`;
    return null;
  }
}

function generateLink(clientId) {
  return `${window.location.origin}/ar.html?id=${clientId}`;
}

async function generateQRCode(link) {
  qrcodeDiv.innerHTML = '';
  try {
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, link);
    qrcodeDiv.appendChild(canvas);
    output.innerHTML += `<p>Ссылка на AR-страницу: <a href="${link}" target="_blank">${link}</a></p>`;
  } catch (err) {
    output.innerHTML += `<p style="color:red">Ошибка генерации QR: ${err.message}</p>`;
  }
}

document.getElementById('uploadBtn').addEventListener('click', async () => {
  output.innerHTML = '';
  qrcodeDiv.innerHTML = '';

  const photo = document.getElementById('photo').files[0];
  const video = document.getElementById('video').files[0];
  const mind = document.getElementById('mind').files[0];

  if (!photo && !video && !mind) {
    output.innerHTML = '<p style="color:red">Выберите хотя бы один файл!</p>';
    return;
  }

  const clientId = Date.now(); // уникальный id для клиента

  await uploadFile(photo);
  await uploadFile(video);
  await uploadFile(mind);

  const link = generateLink(clientId);
  await generateQRCode(link);
});