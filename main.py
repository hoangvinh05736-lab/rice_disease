from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from ultralytics import YOLO
import cv2
import numpy as np
import os

app = FastAPI()

# ===== LOAD MODEL (CHỐNG LỖI ĐƯỜNG DẪN) =====
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app.mount(
    "/static",
    StaticFiles(directory=os.path.join(BASE_DIR, "frontend")),
    name="static"
)

MODEL_PATH = os.path.join(BASE_DIR, "lua_best.pt")
model = YOLO(MODEL_PATH)

# ===== CORS =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== ROUTE TEST =====
@app.get("/")
def home():
    return {"message": "API YOLO đang chạy OK"}

@app.get("/rice")
def rice_page():
    return FileResponse(os.path.join(BASE_DIR, "frontend", "rice.html"))

@app.get("/")
def home_page():
    return FileResponse(os.path.join(BASE_DIR, "frontend", "index.html"))


# ===== API DETECT =====
@app.post("/detect")
async def detect_image(file: UploadFile = File(...)):
    try:
        # đọc ảnh từ upload
        bytes_data = await file.read()
        nparr = np.frombuffer(bytes_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return JSONResponse(
                status_code=400,
                content={"error": "Ảnh không hợp lệ"}
            )

        results = model.predict(img)

        preds = []
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls)
                cls_name = model.names[cls_id]

                preds.append({
                    "class_id": cls_id,
                    "class_name": cls_name,
                    "confidence": float(box.conf),
                    "bbox": box.xyxy.tolist()
                })

        return JSONResponse(content={"predictions": preds})

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
