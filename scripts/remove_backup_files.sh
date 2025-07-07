#!/bin/bash

# Script to remove all .backup files from a given folder
# Usage: ./remove_backup_files.sh [folder_path]

# Function to display usage information
usage() {
    echo "Usage: $0 [folder_path]"
    echo "  folder_path: Path to the folder to clean (optional, defaults to current directory)"
    echo "  -h, --help: Display this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Remove .backup files from current directory"
    echo "  $0 /path/to/folder          # Remove .backup files from specified folder"
    echo "  $0 -r /path/to/folder       # Remove .backup files recursively"
}

# Default values
FOLDER_PATH="."
RECURSIVE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -r|--recursive)
            RECURSIVE=true
            shift
            ;;
        -*)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
        *)
            FOLDER_PATH="$1"
            shift
            ;;
    esac
done

# Check if the folder exists
if [[ ! -d "$FOLDER_PATH" ]]; then
    echo "Error: Folder '$FOLDER_PATH' does not exist."
    exit 1
fi

# Check if we have read permissions for the folder
if [[ ! -r "$FOLDER_PATH" ]]; then
    echo "Error: No read permission for folder '$FOLDER_PATH'."
    exit 1
fi

echo "Removing .backup files from: $FOLDER_PATH"

# Count files before removal
if [[ "$RECURSIVE" == true ]]; then
    BACKUP_FILES=$(find "$FOLDER_PATH" -name "*.backup" -type f 2>/dev/null)
else
    BACKUP_FILES=$(find "$FOLDER_PATH" -maxdepth 1 -name "*.backup" -type f 2>/dev/null)
fi

# Count the number of files found
if [[ -n "$BACKUP_FILES" ]]; then
    FILE_COUNT=$(echo "$BACKUP_FILES" | wc -l)
else
    FILE_COUNT=0
fi

if [[ "$FILE_COUNT" -eq 0 ]]; then
    echo "No .backup files found."
    exit 0
fi

echo "Found $FILE_COUNT .backup file(s):"

# List files that will be removed
echo "$BACKUP_FILES"

# Ask for confirmation
read -p "Do you want to remove these files? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 0
fi

# Remove the files
REMOVED_COUNT=0
FAILED_COUNT=0

while IFS= read -r file; do
    if [[ -n "$file" ]]; then
        if rm "$file" 2>/dev/null; then
            echo "Removed: $file"
            ((REMOVED_COUNT++))
        else
            echo "Failed to remove: $file"
            ((FAILED_COUNT++))
        fi
    fi
done <<< "$BACKUP_FILES"

# Summary
echo ""
echo "Summary:"
echo "  Successfully removed: $REMOVED_COUNT file(s)"
if [[ "$FAILED_COUNT" -gt 0 ]]; then
    echo "  Failed to remove: $FAILED_COUNT file(s)"
    exit 1
else
    echo "  All .backup files removed successfully!"
fi
