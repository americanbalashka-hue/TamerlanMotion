import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Твои ключи
const SUPABASE_URL = "https://macmkxamifmwnfndzqey.supabase.co";
const SUPABASE_KEY = "sb_publishable_ctFkza51tkKuXenyk6d0Qw_OY1r0M-y";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const photoInput = document.getElementById("photo");
const videoInput = document.getElementById("video");
const mindInput = document.getElementById("mind");

const photoPreview = document.getElementById("photoPreview");
const videoPreview = document.getElementById("videoPreview");
const mindPreview = document.getElementById("mindPreview");

// Показываем выбранные файлы сразу
photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (file) {
    photoPreview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Фото" width="200">`;
  }
});

videoInput.addEventListener("change", () => {
  const file = videoInput.files[0];
  if (file) {
    videoPreview.innerHTML = `<video width="300" controls>
      <source src="${URL.createObjectURL(file)}" type="${file.type}">
    </video>`;
  }
});

mindInput.addEventListener("change", () => {
  const file = mindInput.files[0];
  if (file) {
    mindPreview.innerHTML = `<p>Выбран файл: ${file.name}</p>`;
  }
});

// Кнопка загрузки
document.getElementById("uploadBtn").addEventListener("click", async () => {
  const photo = photoInput.files[0];
  const video = videoInput.files[0];
  const mind = mindInput.files[0];

  if (!photo || !video || !mind) {
    alert("Загрузи все три файла!");
    return;
  }

  const timestamp = Date.now();

  try {
    const { data: photoData, error: photoError } = await supabase
      .storage.from("clients")
      .upload(`client-${timestamp}/photo.jpg`, photo);
    if (photoError) throw photoError;

    const { data: publicData } = supabase
      .storage.from("clients")
      .getPublicUrl(photoData.path);

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `
      <h3>Загрузка успешна ✅</h3>
      <p><a href="${publicData.publicUrl}" target="_blank">Ссылка на фото</a></p>
      <canvas id="qrcode"></canvas>
    `;

    QRCode.toCanvas(document.getElementById("qrcode"), publicData.publicUrl, function (error) {
      if (error) console.error(error);
      console.log("QR готов!");
    });

  } catch (err) {
    console.error(err);
    alert("Ошибка при загрузке файлов ❌");
  }
});