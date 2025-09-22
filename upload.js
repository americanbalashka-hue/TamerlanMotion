import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Вставь свои ключи сюда
const SUPABASE_URL = "https://macmkxamifmwnfndzqey.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hY21reGFtaWZtd25mbmR6cWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0OTk3MjgsImV4cCI6MjA3NDA3NTcyOH0.Fb5-uRm2YqUwrY8wXBlK7vKq_S-5Wz9o2nDkqnFIqnY";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const photoInput = document.getElementById("photo");
const videoInput = document.getElementById("video");
const mindInput = document.getElementById("mind");

const photoPreview = document.getElementById("photoPreview");
const videoPreview = document.getElementById("videoPreview");
const mindPreview = document.getElementById("mindPreview");
const resultDiv = document.getElementById("result");

// Показываем выбранные файлы
photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  photoPreview.innerHTML = file ? `<img src="${URL.createObjectURL(file)}" width="200">` : "";
});

videoInput.addEventListener("change", () => {
  const file = videoInput.files[0];
  videoPreview.innerHTML = file ? `<video width="300" controls><source src="${URL.createObjectURL(file)}" type="${file.type}"></video>` : "";
});

mindInput.addEventListener("change", () => {
  const file = mindInput.files[0];
  mindPreview.innerHTML = file ? `<p>Выбран файл: ${file.name}</p>` : "";
});

// Кнопка загрузки
document.getElementById("uploadBtn").addEventListener("click", async () => {
  const photo = photoInput.files[0];
  const video = videoInput.files[0];
  const mind = mindInput.files[0];

  if (!photo || !video || !mind) {
    alert("Выберите все три файла!");
    return;
  }

  const timestamp = Date.now();
  const folder = `client-${timestamp}`;

  try {
    // Загружаем фото
    const { data: photoData, error: photoError } = await supabase.storage.from("clients").upload(`${folder}/photo.jpg`, photo);
    if (photoError) throw photoError;

    // Загружаем видео
    const { data: videoData, error: videoError } = await supabase.storage.from("clients").upload(`${folder}/video.mp4`, video);
    if (videoError) throw videoError;

    // Загружаем .mind
    const { data: mindData, error: mindError } = await supabase.storage.from("clients").upload(`${folder}/scene.mind`, mind);
    if (mindError) throw mindError;

    // Получаем публичный URL для фото (можно для видео тоже)
    const { publicUrl } = supabase.storage.from("clients").getPublicUrl(`${folder}/photo.jpg`);

    // Показываем результат
    resultDiv.innerHTML = `
      <h3>Загрузка успешна ✅</h3>
      <p><a href="${publicUrl}" target="_blank">Ссылка на фото</a></p>
      <canvas id="qrcode"></canvas>
    `;

    // Генерируем QR
    QRCode.toCanvas(document.getElementById("qrcode"), publicUrl, function (error) {
      if (error) console.error(error);
      console.log("QR-код готов!");
    });

  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = `<p style="color:red">Ошибка при загрузке файлов ❌<br>${err.message}</p>`;
  }
});