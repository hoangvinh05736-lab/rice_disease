from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
import uvicorn

app = FastAPI()

# =====================
# LOAD MODEL (1 LẦN)
# =====================
model = YOLO("lua_best.pt")

# =====================
# CORS
# =====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# WARM-UP MODEL (CỰC QUAN TRỌNG)
# =====================
dummy_img = np.zeros((512, 512, 3), dtype=np.uint8)
model.predict(dummy_img, imgsz=512, conf=0.4, device="cpu", verbose=False)

# =====================
# API DETECT
# =====================
@app.post("/detect")
async def detect_image(file: UploadFile = File(...)):
    # đọc ảnh
    bytes_data = await file.read()
    img_array = np.frombuffer(bytes_data, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    # inference tối ưu
    results = model.predict(
        img,
        imgsz=512,
        conf=0.4,
        iou=0.5,
        device="cpu",
        verbose=False
    )

    preds = []
    for r in results:
        if r.boxes is None:
            continue
        for box in r.boxes:
            cls_id = int(box.cls)
            preds.append({
                "class": cls_id,
                "class_name": model.names.get(cls_id, str(cls_id)),
                "confidence": float(box.conf),
                "bbox": box.xyxy.tolist()
            })

    return JSONResponse(content={"predictions": preds})


# =====================
# HEALTH CHECK (GIỮ SERVER TỈNH)
# =====================
@app.get("/")
def root():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, workers=1)
