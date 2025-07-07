#!/bin/bash

# Script to format tabpane shortcodes in Hugo markdown files
# Converts {{% tab %}} to {{% tab header="Language" %}} format
# Ensures {{< tabpane >}} always has text=true parameter
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
    has_text_param = 0
}

# Find the tabpane line and extract languages
/^{{< tabpane / {
    # Reset for each tabpane
    has_text_param = 0
    
    # Extract everything after "tabpane " and before ">}}"
    line = $0
    gsub(/^{{< tabpane /, "", line)
    gsub(/>}}$/, "", line)
    # Remove any trailing spaces
    gsub(/ +$/, "", line)
    
    # Parse quoted and unquoted strings, ignoring text=true parameter
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
                token = substr(line, start, i - start)
                # Skip text=true parameter
                if (token != "text=true") {
                    languages[++lang_count] = token
                } else {
                    # Remember that text=true was present
                    has_text_param = 1
                }
                i++ # Skip closing quote
            }
        } else {
            # Unquoted token - read until space or end
            start = i
            while (i <= length(line) && substr(line, i, 1) != " ") {
                i++
            }
            token = substr(line, start, i - start)
            # Remove any trailing >}} that might have been missed
            gsub(/>}}$/, "", token)
            # Skip text=true parameter and empty tokens
            if (token != "" && token != "text=true") {
                languages[++lang_count] = token
            } else if (token == "text=true") {
                # Remember that text=true was present
                has_text_param = 1
            }
        }
    }
    
    languages_found = lang_count
    tab_index = 0
    
    # Always output tabpane with text=true
    print "{{< tabpane text=true >}}"
    next
}

# Replace {{% tab %}} with language-specific versions using header parameter
/^{{% tab %}}$/ {
    if (languages_found > 0 && tab_index < languages_found) {
        tab_index++
        print "{{% tab header=\"" languages[tab_index] "\" %}}"
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
