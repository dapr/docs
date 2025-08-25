#!/bin/bash

# Script to find all markdown files with tabpane shortcodes and format them
# Usage: ./format-all-tabpanes.sh [directory]

# Set the directory to search (default to current directory)
SEARCH_DIR="${1:-.}"

# Check if format-tabpane.sh script exists
SCRIPT_PATH="$(dirname "$0")/format-tabpane.sh"
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "Error: format-tabpane.sh script not found at $SCRIPT_PATH"
    echo "Make sure format-tabpane.sh is in the same directory as this script."
    exit 1
fi

# Make sure format-tabpane.sh is executable
if [ ! -x "$SCRIPT_PATH" ]; then
    echo "Making format-tabpane.sh executable..."
    chmod +x "$SCRIPT_PATH"
fi

echo "Searching for markdown files with tabpane shortcodes in: $SEARCH_DIR"
echo "============================================================"

# Find all .md files and check for tabpane shortcodes
processed_count=0
found_count=0

# Use find to get all .md files, then check each one for tabpane shortcodes
while IFS= read -r -d '' file; do
    # Check if the file contains a tabpane shortcode with parameters
    # This pattern matches tabpane with at least one non-whitespace character between "tabpane" and "%}}"
    if grep -q '{{% tabpane [^%]*[^[:space:]%][^%]*%}}' "$file"; then
        found_count=$((found_count + 1))
        echo ""
        echo "Found tabpane in: $file"
        echo "Processing..."
        
        # Call the format-tabpane.sh script on this file
        if "$SCRIPT_PATH" "$file"; then
            processed_count=$((processed_count + 1))
            echo "✓ Successfully processed: $file"
        else
            echo "✗ Failed to process: $file"
        fi
        
        echo "----------------------------------------"
    fi
done < <(find "$SEARCH_DIR" -name "*.md" -type f -print0)

echo ""
echo "Summary:"
echo "========"
echo "Found $found_count markdown files with tabpane shortcodes"
echo "Successfully processed $processed_count files"

if [ $found_count -eq 0 ]; then
    echo "No markdown files with tabpane shortcodes found in $SEARCH_DIR"
elif [ $processed_count -eq $found_count ]; then
    echo "All files processed successfully!"
else
    failed_count=$((found_count - processed_count))
    echo "Warning: $failed_count files failed to process"
fi
