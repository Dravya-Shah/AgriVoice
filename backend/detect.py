"""detect.py

Usage:
    python detect.py /path/to/model.pt /path/to/input.jpg [/path/to/output.jpg] [--conf 0.25] [--save-txt]

This improved script accepts either *two* or *three* positional arguments:
  - model_path (required)
  - input_image (required)
  - output_image (optional). If omitted, the script will auto-generate an annotated output file
    next to the input image with suffix `_annotated` (e.g. image_annotated.jpg).

It prints clear debug messages when writing files so you can see whether the annotated image
was saved or why it wasn't.

Requirements:
    pip install ultralytics opencv-python-headless numpy

"""

import sys
from pathlib import Path
import argparse


def parse_args():
    p = argparse.ArgumentParser(description="Run a YOLO .pt model on a single image and save annotated output.")
    p.add_argument("model_path", help="Path to model .pt file")
    p.add_argument("input_image", help="Path to input image")
    p.add_argument("output_image", nargs='?', default=None, help="Path to annotated output image (optional). If omitted, will create <input>_annotated.<ext>")
    p.add_argument("--conf", type=float, default=0.25, help="Confidence threshold (default 0.25)")
    p.add_argument("--save-txt", action="store_true", help="Also save bounding boxes to a .txt alongside the output image")
    p.add_argument("--line-thickness", type=int, default=2, help="Bounding box line thickness")
    return p.parse_args()


def ensure_packages():
    try:
        import ultralytics  # noqa: F401
        import cv2  # noqa: F401
        import numpy as np  # noqa: F401
    except Exception:
        print("Missing required packages. Install them with:    pip install ultralytics opencv-python-headless numpy ", file=sys.stderr)
        raise


def draw_boxes_cv2(img, boxes, confidences, classes, names, line_thickness=2):
    import cv2

    h, w = img.shape[:2]
    tl = max(1, int(round(0.002 * (h + w) / 2)))
    tl = max(tl, line_thickness)

    for (x1, y1, x2, y2), conf, cls in zip(boxes, confidences, classes):
        x1i, y1i, x2i, y2i = map(int, (x1, y1, x2, y2))
        label = f"{names.get(cls, str(cls))} {conf:.2f}"
        cv2.rectangle(img, (x1i, y1i), (x2i, y2i), (0, 255, 0), thickness=tl)
        ((txt_w, txt_h), _) = cv2.getTextSize(label, 0, fontScale=tl / 3, thickness=1)
        cv2.rectangle(img, (x1i, y1i - txt_h - 3), (x1i + txt_w, y1i), (0, 255, 0), -1)
        cv2.putText(img, label, (x1i, y1i - 2), 0, tl / 3, (0, 0, 0), thickness=1, lineType=cv2.LINE_AA)

    return img


def save_boxes_txt(txt_path: Path, boxes, confidences, classes, names):
    lines = []
    for (x1, y1, x2, y2), conf, cls in zip(boxes, confidences, classes):
        lines.append(f"{names.get(cls, cls)} {conf:.4f} {x1:.1f} {y1:.1f} {x2:.1f} {y2:.1f}")
    txt_path.write_text("".join(lines), encoding="utf-8")


def main():
    args = parse_args()
    model_path = Path(args.model_path)
    input_path = Path(args.input_image)

    # If user omitted output, create one next to the input image
    if args.output_image:
        output_path = Path(args.output_image)
    else:
        suffix = input_path.suffix
        output_path = input_path.with_name(input_path.stem + "_annotated" + suffix)

    ensure_packages()
    import numpy as np
    import cv2

    try:
        from ultralytics import YOLO
    except Exception:
        print("ultralytics package not found or failed to import. Install it with: pip install ultralytics", file=sys.stderr)
        raise

    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")
    if not input_path.exists():
        raise FileNotFoundError(f"Input image not found: {input_path}")

    print(f"Loading model from: {model_path}")
    model = YOLO(str(model_path))

    print(f"Running inference on: {input_path} (conf={args.conf})")
    results = model.predict(source=str(input_path), conf=args.conf, verbose=False)

    if len(results) == 0:
        print("No results returned from model.")

    r = results[0]

    names = {}
    try:
        if hasattr(model, 'model') and hasattr(model.model, 'names'):
            names = {int(k): v for k, v in dict(model.model.names).items()}
    except Exception:
        names = {}

    boxes = []
    confidences = []
    classes = []

    if hasattr(r, 'boxes') and r.boxes is not None:
        try:
            xyxy = r.boxes.xyxy.cpu().numpy()
            confs = r.boxes.conf.cpu().numpy()
            clss = r.boxes.cls.cpu().numpy().astype(int)
        except Exception:
            xyxy = r.boxes.xyxy
            confs = r.boxes.conf
            clss = r.boxes.cls

        for xy, c, cls in zip(xyxy, confs, clss):
            x1, y1, x2, y2 = float(xy[0]), float(xy[1]), float(xy[2]), float(xy[3])
            boxes.append((x1, y1, x2, y2))
            confidences.append(float(c))
            classes.append(int(cls))

    # read image robustly (handles unicode paths on Windows)
    img = cv2.imdecode(np.fromfile(str(input_path), dtype=np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        img = cv2.imread(str(input_path))
    if img is None:
        raise RuntimeError(f"Failed to read image: {input_path}")

    if len(boxes) == 0:
        print("No detections above the confidence threshold. The image will still be saved (unannotated).")
    else:
        print(f"Found {len(boxes)} detections. Drawing boxes...")
        img = draw_boxes_cv2(img, boxes, confidences, classes, names, line_thickness=args.line_thickness)

    # attempt robust save and print debug info
    ext = output_path.suffix.lower() if output_path.suffix else '.jpg'
    saved = False
    try:
        is_written, encimg = cv2.imencode(ext, img)
        if is_written:
            encimg.tofile(str(output_path))
            saved = True
            print(f"Annotated image successfully saved to: {output_path}")
    except Exception as e:
        print(f"Primary save method failed: {e}")

    if not saved:
        try:
            ok = cv2.imwrite(str(output_path), img)
            if ok:
                saved = True
                print(f"Annotated image saved with fallback to cv2.imwrite: {output_path}")
            else:
                print(f"cv2.imwrite returned False when attempting to save to: {output_path}")
        except Exception as e:
            print(f"Fallback save failed: {e}")

    if not saved:
        print("Failed to save annotated image. Check path permissions and available disk space.")

    if args.save_txt:
        txt_path = output_path.with_suffix('.txt')
        try:
            save_boxes_txt(txt_path, boxes, confidences, classes, names)
            print(f"Saved detections to: {txt_path}")
        except Exception as e:
            print(f"Failed to write txt sidecar: {e}")


if __name__ == '__main__':
    main()
