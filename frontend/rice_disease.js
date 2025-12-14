const input_image = document.getElementById("input_image");
const back = document.getElementById("back");
const preview = document.getElementById("preview");
const dg = document.getElementById("dg");

input_image.addEventListener("change", () => {
  const file = input_image.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
  }
});
back.onclick = () => {
  window.location.href = "index.html";
};
async function upload_image() {
  const file = input_image.files[0];
  if (!file) {
    alert("Vui lòng chọn ảnh!");
    return;
  }

  const formData = new FormData();
  formData.append("file", file); // 🔥 đúng key cho FastAPI

  const API_URL = "/detect";

  const resultBox = document.getElementById("result");
  resultBox.style.display = "block";
  resultBox.innerHTML = "⏳ Đang xử lý...";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!data.predictions || data.predictions.length === 0) {
      resultBox.innerHTML = "❌ Không phát hiện đối tượng";
      return;
    }

    const p = data.predictions[0];
    resultBox.innerHTML = `
      <b>Kết quả chuẩn đoán:</b><br>
      Class ID: ${p.class_id}<br>
      Bệnh: ${p.class_name}<br>
      Độ tin cậy: ${(p.confidence * 100).toFixed(2)}%
    `;
  } catch (err) {
    console.error(err);
    resultBox.innerHTML = "❌ Lỗi kết nối đến API!";
  }
}
