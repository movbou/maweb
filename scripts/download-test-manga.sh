#!/bin/bash

# Script to download test manga pages

MANGA_DIR="/workspaces/maweb/public/manga/test"

echo "Downloading test manga pages..."

# Download pages for Chapter 1
cd "$MANGA_DIR/chapter1"
for i in {1..5}; do
  echo "Downloading Chapter 1, Page $i..."
  curl -s -o "page${i}.jpg" "https://via.placeholder.com/800x1200/0a0e27/ffffff.jpg?text=Chapter+1+Page+${i}"
done

# Download pages for Chapter 2
cd "$MANGA_DIR/chapter2"
for i in {1..5}; do
  echo "Downloading Chapter 2, Page $i..."
  curl -s -o "page${i}.jpg" "https://via.placeholder.com/800x1200/16213e/ffffff.jpg?text=Chapter+2+Page+${i}"
done

# Download pages for Chapter 3
cd "$MANGA_DIR/chapter3"
for i in {1..5}; do
  echo "Downloading Chapter 3, Page $i..."
  curl -s -o "page${i}.jpg" "https://via.placeholder.com/800x1200/1a2332/ffffff.jpg?text=Chapter+3+Page+${i}"
done

echo "Done! Test manga pages created."
ls -R "$MANGA_DIR"
