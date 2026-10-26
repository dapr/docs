#!/usr/bin/env bash
# Pulls what you need from a source animation (MP4 or GIF) before redrawing it:
# frame count and rate, numbered contact sheets of every 4th frame (to time each
# element), and full frames at 1200px wide (to measure layout and sample colors).
#
#   skills/d3-2d-diagrams/scripts/video-frames.sh <video> <out-dir> [frame numbers...]
#
# Sheet labels are sheet indexes k: the frame is 4k, the time is 4k / fps.
# Frame numbers default to the last frame. Sample a color from a frame with:
#   skills/d3-2d-diagrams/scripts/video-frames.sh --color <png> <x> <y>
set -euo pipefail

if [[ "${1:-}" == "--color" ]]; then
  # 1x1 crop: sample the middle of a stroke, not its antialiased edge
  ffmpeg -v error -i "$2" -vf "crop=1:1:$3:$4" -f rawvideo -pix_fmt rgb24 - | xxd -p | sed 's/^/#/'
  exit 0
fi

video="$1"; out="$2"; shift 2
mkdir -p "$out"
frames=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$video")
info=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of csv=p=0 "$video")
echo "frames: $frames  width,height,fps: $info"

ffmpeg -v error -y -i "$video" \
  -vf "select='not(mod(n\,4))',scale=360:-1,drawtext=text='%{n}':x=6:y=6:fontsize=22:fontcolor=red,tile=6x4:padding=4:color=white" \
  -vsync 0 "$out/sheet-%02d.png"

picks=("$@"); [[ ${#picks[@]} -eq 0 ]] && picks=($((frames - 1)))
for n in "${picks[@]}"; do
  ffmpeg -v error -y -i "$video" -vf "select='eq(n\,$n)',scale=1200:-1" -vsync 0 -frames:v 1 "$out/frame-$n.png"
done
ls "$out"
