#!/usr/bin/env python3
"""
detect.py

Usage:
    python detect.py /path/to/model.pt /path/to/input.jpg [/path/to/output.jpg] [--conf 0.25] [--topk 3] [--save-txt]

This script runs a YOLO .pt model on a single image, keeps only the top-K detections
(by confidence, global across classes), draws boxes and labels, saves an annotated image,
and prints a JSON object to stdout with the detected diseases.

Logs and diagnostic prints are written to stderr so that stdout remains parseable JSON.
"""
import sys
from pathlib import Path
import argparse
import json

def parse_args():
    p = argparse.ArgumentParser(description="Run a YOLO .pt model on a single image and save annotated output.")
    p.add_argument("model_path", help="Path to model .pt file")
    p.add_argument("input_image", help="Path to input image")
    p.add_argument("output_image", nargs='?', default=None,
                   help="Path to annotated output image (optional). If omitted, will create <input>_annotated.<ext>")
    p.add_argument("--conf", type=float, default=0.25, help="Confidence threshold (default 0.25)")
    p.add_argument("--topk", type=int, default=3, help="Keep only the top-K detections by confidence (default 3)")
    p.add_argument("--save-txt", action="store_true", help="Also save bounding boxes to a .txt alongside the output image")
    p.add_argument("--line-thickness", type=int, default=2, help="Bounding box line thickness")
    return p.parse_args()


def ensure_packages():
    try:
        import ultralytics  # noqa: F401
        import cv2  # noqa: F401
        import numpy as np  # noqa: F401
    except Exception:
        print("Missing required packages. Install with: pip install ultralytics opencv-python-headless numpy", file=sys.stderr)
        raise


def draw_boxes_cv2(img, boxes, confidences, classes, names, line_thickness=2):
    import cv2
    h, w = img.shape[:2]
    tl = max(1, int(round(0.002 * (h + w) / 2)))
    tl = max(tl, line_thickness)

    for (x1, y1, x2, y2), conf, cls in zip(boxes, confidences, classes):
        x1i, y1i, x2i, y2i = map(int, (x1, y1, x2, y2))
        label = f"{names.get(int(cls), str(int(cls)))} {conf:.2f}"
        cv2.rectangle(img, (x1i, y1i), (x2i, y2i), (0, 255, 0), thickness=tl)
        ((txt_w, txt_h), _) = cv2.getTextSize(label, 0, fontScale=tl / 3, thickness=1)
        cv2.rectangle(img, (x1i, y1i - txt_h - 3), (x1i + txt_w, y1i), (0, 255, 0), -1)
        cv2.putText(img, label, (x1i, y1i - 2), 0, tl / 3, (0, 0, 0), thickness=1, lineType=cv2.LINE_AA)

    return img


def save_boxes_txt(txt_path: Path, boxes, confidences, classes, names):
    lines = []
    for (x1, y1, x2, y2), conf, cls in zip(boxes, confidences, classes):
        lines.append(f"{names.get(int(cls), int(cls))} {conf:.4f} {x1:.1f} {y1:.1f} {x2:.1f} {y2:.1f}")
    txt_path.write_text("\n".join(lines), encoding="utf-8")


def keep_topk(boxes, confidences, classes, k=3):
    """Keep only top-k detections by confidence (global across classes)."""
    if k is None or k <= 0:
        return boxes, confidences, classes
    if len(boxes) <= k:
        return boxes, confidences, classes

    sorted_idx = sorted(range(len(confidences)), key=lambda i: -confidences[i])
    keep_idx = sorted_idx[:k]
    kept_boxes = [boxes[i] for i in keep_idx]
    kept_conf = [confidences[i] for i in keep_idx]
    kept_cls = [classes[i] for i in keep_idx]
    return kept_boxes, kept_conf, kept_cls


def main():
    args = parse_args()
    model_path = Path(args.model_path)
    input_path = Path(args.input_image)

    # Determine output image path
    if args.output_image:
        output_path = Path(args.output_image)
    else:
        suffix = input_path.suffix
        output_path = input_path.with_name(input_path.stem + "_annotated" + suffix)

    # Ensure required libs exist
    try:
        ensure_packages()
    except Exception as e:
        # write JSON error to stdout for the caller to parse (with empty diseases)
        out = {"diseases": [], "error": "missing_packages", "message": str(e)}
        print(json.dumps(out))
        sys.stdout.flush()
        return out

    import numpy as np
    import cv2
    from ultralytics import YOLO

    # Validate paths
    if not model_path.exists():
        err = {"diseases": [], "error": "model_not_found", "message": str(model_path)}
        print(json.dumps(err))
        sys.stdout.flush()
        return err
    if not input_path.exists():
        err = {"diseases": [], "error": "input_not_found", "message": str(input_path)}
        print(json.dumps(err))
        sys.stdout.flush()
        return err

    # Send logs to stderr so stdout can be pure JSON
    print(f"Loading model from: {model_path}", file=sys.stderr)
    try:
        model = YOLO(str(model_path))
    except Exception as e:
        print(f"Model load failed: {e}", file=sys.stderr)
        out = {"diseases": [], "error": "model_load_failed", "message": str(e)}
        print(json.dumps(out))
        sys.stdout.flush()
        return out

    print(f"Running inference on: {input_path} (conf={args.conf})", file=sys.stderr)
    try:
        results = model.predict(source=str(input_path), conf=args.conf, verbose=False)
    except Exception as e:
        print(f"Inference failed: {e}", file=sys.stderr)
        out = {"diseases": [], "error": "inference_failed", "message": str(e)}
        print(json.dumps(out))
        sys.stdout.flush()
        return out

    if len(results) == 0:
        print("No results returned from model.", file=sys.stderr)
        out = {"diseases": [], "warning": "no_results"}
        print(json.dumps(out))
        sys.stdout.flush()
        return out

    r = results[0]
    names = getattr(model.model, 'names', {})

    boxes, confidences, classes = [], [], []

    if hasattr(r, 'boxes') and r.boxes is not None:
        try:
            xyxy = r.boxes.xyxy.cpu().numpy()
            confs = r.boxes.conf.cpu().numpy()
            clss = r.boxes.cls.cpu().numpy().astype(int)
        except Exception:
            # fallback if already numpy-like
            xyxy = r.boxes.xyxy
            confs = r.boxes.conf
            clss = r.boxes.cls

        for xy, c, cls in zip(xyxy, confs, clss):
            boxes.append(tuple(map(float, xy)))
            confidences.append(float(c))
            classes.append(int(cls))

    # Keep only top-k detections
    boxes, confidences, classes = keep_topk(boxes, confidences, classes, k=args.topk)
    print(f"Keeping top {args.topk} detections. ({len(boxes)} detections will be drawn)", file=sys.stderr)

    # Get detected diseases (unique class names)
    detected_diseases = sorted({str(names.get(c, str(c))) for c in classes})

    # Read and annotate image
    img = cv2.imdecode(np.fromfile(str(input_path), dtype=np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        img = cv2.imread(str(input_path))
    if img is None:
        out = {"diseases": [], "error": "read_image_failed", "message": str(input_path)}
        print(json.dumps(out))
        sys.stdout.flush()
        return out

    if len(boxes) > 0:
        img = draw_boxes_cv2(img, boxes, confidences, classes, names, line_thickness=args.line_thickness)

    # Save annotated image
    try:
        ext = output_path.suffix.lower() if output_path.suffix else '.jpg'
        is_written, encimg = cv2.imencode(ext, img)
        if is_written:
            encimg.tofile(str(output_path))
            print(f"Annotated image saved to: {output_path}", file=sys.stderr)
        else:
            cv2.imwrite(str(output_path), img)
            print(f"Fallback: saved annotated image to: {output_path}", file=sys.stderr)
    except Exception as e:
        print(f"Failed to save annotated image: {e}", file=sys.stderr)
        out = {"diseases": detected_diseases, "error": "save_failed", "message": str(e)}
        print(json.dumps(out))
        sys.stdout.flush()
        return out

    # Optionally save .txt
    if args.save_txt:
        try:
            txt_path = output_path.with_suffix('.txt')
            save_boxes_txt(txt_path, boxes, confidences, classes, names)
            print(f"Saved detections to: {txt_path}", file=sys.stderr)
        except Exception as e:
            print(f"Failed to save .txt: {e}", file=sys.stderr)

    # Final JSON output to STDOUT
    out = {"diseases": detected_diseases}
    print(json.dumps(out))
    sys.stdout.flush()
    return out


if __name__ == "__main__":
    main()
