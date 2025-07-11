#!/bin/bash

# Directory containing your videos
VIDEO_DIR="./public/videos"

# Loop through all mp4 files in the directory
for f in "$VIDEO_DIR"/*.mp4; do
  # Skip if no files found
  [ -e "$f" ] || continue
  # Output filename
  out="${f%.mp4}-10fps.mp4"
  echo "Converting $f to $out ..."
  ffmpeg -i "$f" -r 10 -c:v libx264 -preset veryfast -crf 28 -an "$out"
done

echo "All videos processed. Review the -10fps.mp4 files and replace originals if satisfied." 