#!/bin/bash

# Script to format tabpane shortcodes in Hugo markdown files
# Usage: ./format-tabpane.sh <markdown-file>

if [ $# -eq 0 ]; then
    echo "Usage: $0 <markdown-file>"
    echo "Example: $0 actors-runtime-config.md"
    exit 1
fi

FILE="$1"

if [ ! -f "$FILE" ]; then
    echo "Error: File '$FILE' not found."
    exit 1
fi

# Create a backup of the original file
cp "$FILE" "${FILE}.backup"

# Use a temporary file for processing
TEMP_FILE=$(mktemp)
cp "$FILE" "$TEMP_FILE"

# Process the file using awk
awk '
BEGIN {
    languages_found = 0
    tab_index = 0
}

# Find the tabpane line and extract languages
/^{{% tabpane / {
    # Extract everything after "tabpane " and before "%}}"
    line = $0
    gsub(/^{{% tabpane /, "", line)
    gsub(/%}}$/, "", line)
    # Remove any trailing spaces
    gsub(/ +$/, "", line)
    
    # Parse quoted and unquoted strings
    lang_count = 0
    i = 1
    while (i <= length(line)) {
        # Skip whitespace
        while (i <= length(line) && substr(line, i, 1) == " ") {
            i++
        }
        
        if (i > length(line)) break
        
        # Check if this token starts with a quote
        if (substr(line, i, 1) == "\"") {
            # Find the closing quote
            i++ # Skip opening quote
            start = i
            while (i <= length(line) && substr(line, i, 1) != "\"") {
                i++
            }
            if (i <= length(line)) {
                # Found closing quote
                languages[++lang_count] = substr(line, start, i - start)
                i++ # Skip closing quote
            }
        } else {
            # Unquoted token - read until space or end
            start = i
            while (i <= length(line) && substr(line, i, 1) != " ") {
                i++
            }
            token = substr(line, start, i - start)
            # Remove any trailing %}} that might have been missed
            gsub(/%}}$/, "", token)
            if (token != "") {
                languages[++lang_count] = token
            }
        }
    }
    
    languages_found = lang_count
    tab_index = 0
    
    # Output empty tabpane
    print "{{% tabpane %}}"
    next
}

# Replace {{% tab %}} with language-specific versions
/^{{% tab %}}$/ {
    if (languages_found > 0 && tab_index < languages_found) {
        tab_index++
        print "{{% tab \"" languages[tab_index] "\" %}}"
    } else {
        print $0
    }
    next
}

# Print all other lines as-is
{
    print $0
}
' "$TEMP_FILE" > "$FILE"

# Clean up
rm "$TEMP_FILE"

echo "Processed $FILE successfully."
echo "Original file backed up as ${FILE}.backup"

# Show the changes made
echo ""
echo "Changes made:"
echo "============="

# Show the tabpane line changes
echo "Tabpane shortcode:"
grep -n "tabpane" "${FILE}.backup" | head -1
echo "  ↓"
grep -n "tabpane" "$FILE" | head -1

echo ""
echo "Tab shortcodes:"
grep -n "{{% tab" "${FILE}.backup" | head -5
echo "  ↓"
grep -n "{{% tab" "$FILE" | head -5
