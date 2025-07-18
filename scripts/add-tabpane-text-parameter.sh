#!/bin/bash

# Script to add text=true parameter to tabpane shortcodes if missing
# Usage: ./add-tabpane-text-parameter.sh [directory]

# Default directory to search
SEARCH_DIR="${1:-/workspaces/dapr-docs}"

if [ ! -d "$SEARCH_DIR" ]; then
    echo "Error: Directory '$SEARCH_DIR' not found." >&2
    exit 1
fi

# Log file
LOGFILE="/tmp/tabpane-script.log"
exec 1> >(tee "$LOGFILE")
exec 2>&1

echo "Adding text=true parameter to tabpane shortcodes in: $SEARCH_DIR"
echo "================================================================"

# Counters
files_processed=0
files_modified=0
tabpanes_modified=0

# Create a temporary file list
temp_filelist=$(mktemp)
find "$SEARCH_DIR" -type f -name "*.md" > "$temp_filelist"

echo "Found $(wc -l < "$temp_filelist") markdown files"

# Process each file
while IFS= read -r file; do
    echo "Checking file: $file"
    
    # Skip files that don't contain tabpane shortcodes
    if ! grep -q 'tabpane' "$file"; then
        echo "  No tabpane found, skipping"
        continue
    fi
    
    echo "  Found tabpane, processing..."
    files_processed=$((files_processed + 1))
    
    # Create a backup of the original file
    cp "$file" "${file}.backup"
    
    # Process the file and check if any changes were made
    modified=false
    temp_file=$(mktemp)
    
    # Use sed to process each line
    while IFS= read -r line; do
        # Check if this line contains an opening tabpane shortcode (not closing)
        if echo "$line" | grep -q '{{% tabpane' && ! echo "$line" | grep -q '{{% /tabpane'; then
            echo "    Found tabpane line: $line"
            # Check if it already contains text=true parameter
            if echo "$line" | grep -q 'text=true'; then
                # Already has text=true, keep as is
                echo "    Already has text=true"
                echo "$line" >> "$temp_file"
            else
                # Need to add text=true parameter
                echo "    Adding text=true parameter"
                
                # Check if it's a simple tabpane with no parameters
                if echo "$line" | grep -q '^{{% tabpane %}}$'; then
                    # Simple case: just {{% tabpane %}}
                    modified_line="{{% tabpane text=true %}}"
                else
                    # Complex case: has other parameters
                    # Insert text=true after "tabpane "
                    modified_line=$(echo "$line" | sed 's/{{% tabpane /{{% tabpane text=true /')
                fi
                
                echo "$modified_line" >> "$temp_file"
                modified=true
                tabpanes_modified=$((tabpanes_modified + 1))
                
                echo "Modified: $file"
                echo "  Before: $line"
                echo "  After:  $modified_line"
                echo ""
            fi
        else
            # Not an opening tabpane line, keep as is
            echo "$line" >> "$temp_file"
        fi
    done < "$file"
    
    # Replace the original file with the modified version
    mv "$temp_file" "$file"
    
    if [ "$modified" = true ]; then
        files_modified=$((files_modified + 1))
    else
        # No changes made, remove the backup
        rm "${file}.backup"
    fi
    
done < "$temp_filelist"

# Clean up
rm "$temp_filelist"

echo "Summary:"
echo "========"
echo "Files processed: $files_processed"
echo "Files modified: $files_modified"
echo "Tabpanes modified: $tabpanes_modified"
echo ""
echo "Note: Backup files (.backup) have been created for all modified files."
echo "Log saved to: $LOGFILE"
