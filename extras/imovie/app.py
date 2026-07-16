import argparse
import os
import sys
from glob import glob

import cv2


def parse_args():
    parser = argparse.ArgumentParser(
        description="Split a video into chunks and optionally infuse an MP3 track into each chunk."
    )
    parser.add_argument("--input-video", default="input.mp4", help="Input video file path")
    parser.add_argument("--input-mp3", default="", help="Optional MP3 file to infuse")
    parser.add_argument("--output-dir", default="output_chunks", help="Output directory")
    parser.add_argument(
        "--chunk-minutes",
        type=float,
        default=1.0,
        help="Chunk duration in minutes (default: 1.0)",
    )
    parser.add_argument(
        "--skip-split",
        action="store_true",
        help="Skip video splitting and infuse MP3 into existing chunk files in output-dir",
    )
    return parser.parse_args()


def split_video(input_video, output_dir, chunk_minutes):
    cap = cv2.VideoCapture(input_video)
    if not cap.isOpened():
        raise RuntimeError(f"Could not open video: {input_video}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        cap.release()
        raise RuntimeError("Could not detect FPS from input video")

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    if width <= 0 or height <= 0:
        cap.release()
        raise RuntimeError("Could not detect video dimensions")

    frames_per_chunk = max(1, int(fps * 60 * chunk_minutes))
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")

    chunk = 1
    frame_count = 0
    written_chunks = []

    current_path = os.path.join(output_dir, f"part_{chunk:03d}.mp4")
    out = cv2.VideoWriter(current_path, fourcc, fps, (width, height))
    written_chunks.append(current_path)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        out.write(frame)
        frame_count += 1
        if frame_count % max(1, int(fps * 10)) == 0:
            print(f"Chunk {chunk:03d}: wrote {frame_count} frames", flush=True)

        if frame_count >= frames_per_chunk:
            out.release()
            chunk += 1
            frame_count = 0
            current_path = os.path.join(output_dir, f"part_{chunk:03d}.mp4")
            out = cv2.VideoWriter(current_path, fourcc, fps, (width, height))
            written_chunks.append(current_path)

    cap.release()
    out.release()

    # Remove empty last chunk that can be created on exact frame boundaries.
    if written_chunks:
        last_path = written_chunks[-1]
        if os.path.exists(last_path) and os.path.getsize(last_path) == 0:
            os.remove(last_path)
            written_chunks.pop()

    return written_chunks


def infuse_mp3(chunks, input_mp3):
    from moviepy import AudioFileClip, VideoFileClip

    output_files = []
    for index, chunk_path in enumerate(chunks, start=1):
        base, ext = os.path.splitext(chunk_path)
        out_with_audio = f"{base}_mp3{ext}"

        # MoviePy handles muxing without shelling out to an ffmpeg command here.
        with VideoFileClip(chunk_path) as video_clip, AudioFileClip(input_mp3) as audio_clip:
            infused_clip = video_clip.with_audio(audio_clip.subclipped(0, video_clip.duration))
            infused_clip.write_videofile(
                out_with_audio,
                codec="libx264",
                audio_codec="aac",
                logger=None,
            )
            infused_clip.close()

        output_files.append(out_with_audio)
        print(f"Infused {index}/{len(chunks)} -> {os.path.basename(out_with_audio)}", flush=True)

    return output_files


def find_existing_chunks(output_dir):
    paths = sorted(glob(os.path.join(output_dir, "part_*.mp4")))
    return [p for p in paths if not p.endswith("_mp3.mp4")]


def main():
    args = parse_args()

    if args.chunk_minutes <= 0:
        print("--chunk-minutes must be greater than 0")
        sys.exit(1)

    os.makedirs(args.output_dir, exist_ok=True)

    if args.skip_split:
        chunks = find_existing_chunks(args.output_dir)
        if not chunks:
            print(f"No existing chunks found in {args.output_dir}. Run without --skip-split first.")
            sys.exit(1)
        print(f"Using {len(chunks)} existing chunks from {args.output_dir}")
    else:
        if not os.path.isfile(args.input_video):
            print(f"Input video not found: {args.input_video}")
            sys.exit(1)
        chunks = split_video(args.input_video, args.output_dir, args.chunk_minutes)
        print(f"Chunking done. Generated {len(chunks)} files in {args.output_dir}")

    if args.input_mp3:
        if not os.path.isfile(args.input_mp3):
            print(f"Input MP3 not found: {args.input_mp3}")
            sys.exit(1)

        print("Starting MP3 infusion...", flush=True)
        infused = infuse_mp3(chunks, args.input_mp3)
        print(f"MP3 infused into {len(infused)} chunks (files end with _mp3.mp4)")
    else:
        print("No MP3 provided. Skipping audio infusion.")

    print("Done!")


if __name__ == "__main__":
    main()