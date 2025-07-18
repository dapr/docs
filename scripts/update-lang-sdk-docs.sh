#!/bin/bash

# Script to convert Hugo tabs shortcodes to tabpane format in markdown files
# Usage: ./convert-tabs-to-tabpanes.sh <directory>

# Removed set -e to prevent immediate exit on errors

if [ $# -eq 0 ]; then
    echo "Usage: $0 <directory>"
    echo "Example: $0 /path/to/markdown/files"
    exit 1
fi

DIRECTORY="$1"

if [ ! -d "$DIRECTORY" ]; then
    echo "Error: Directory '$DIRECTORY' not found."
    exit 1
fi

# Counter for processed files
processed_files=0
files_with_changes=0

# Function to safely get numeric count from grep
safe_count() {
    local pattern="$1"
    local file="$2"
    local result
    
    # Check if pattern contains regex characters that need -E flag
    if [[ "$pattern" =~ .*[\.\*\+\?\[\]\{\}\(\)\|].*$ ]]; then
        result=$(grep -E -c "$pattern" "$file" 2>/dev/null || echo "0")
    else
        result=$(grep -c "$pattern" "$file" 2>/dev/null || echo "0")
    fi
    
    # Ensure we have a valid number
    if [[ "$result" =~ ^[0-9]+$ ]]; then
        echo "$result"
    else
        echo "0"
    fi
}

# Function to process a single markdown file
process_file() {
    local file="$1"
    echo "Processing: $file"
    
    # Create a backup
    cp "$file" "${file}.backup"
    
    # Use a temporary file for processing
    local temp_file=$(mktemp)
    cp "$file" "$temp_file"
    
    # Track if any changes were made
    local changes_made=false
    
    # Step 1: Replace [codetabs] with [tabpane]
    if grep -q '\[codetabs\]' "$temp_file"; then
        sed -i 's/\[codetabs\]/[tabpane]/g' "$temp_file"
        changes_made=true
        echo "  - Replaced [codetabs] with [tabpane]"
    fi
    
    # Step 2: Change {{< ref filename >}} to {{% ref filename %}}
    # Handle both formats: with and without space before >}}
    # Use non-greedy matching to handle multiple links on the same line
    if grep -q '{{< ref [^}]*>}}' "$temp_file"; then
        sed -i 's/{{< ref \([^}]*\) >}}/{{% ref \1 %}}/g; s/{{< ref \([^}]*\)>}}/{{% ref \1 %}}/g' "$temp_file"
        changes_made=true
        echo "  - Updated ref links from {{< >}} to {{% %}}"
    fi
    
    # Step 3: Check if file has codetab or tabs elements to determine if further processing is needed
    local has_codetabs=$(safe_count '{{% codetab' "$temp_file")
    local has_tabs_elements=$(safe_count '{{< tabs.*>}}' "$temp_file")
    
    if [ "$has_codetabs" -eq 0 ] && [ "$has_tabs_elements" -eq 0 ]; then
        echo "  - No codetab or tabs elements found, skipping tab processing"
    else
        echo "  - Found tab elements, processing..."
        local tabs_processed=false
        
        # Step 4: Replace opening {{% codetab %}} with {{% tab %}}
        if [ "$has_codetabs" -gt 0 ]; then
            if grep -q '{{% codetab' "$temp_file"; then
                sed -i 's/{{% codetab/{{% tab/g' "$temp_file"
                changes_made=true
                tabs_processed=true
                echo "  - Replaced {{% codetab with {{% tab"
            fi
            
            # Step 5: Replace closing {{% /codetab %}} with {{% /tab %}}
            if grep -q '{{% /codetab' "$temp_file"; then
                sed -i 's/{{% \/codetab/{{% \/tab/g' "$temp_file"
                changes_made=true
                echo "  - Replaced {{% /codetab with {{% /tab"
            fi
        fi
        
        # Step 6 & 7: Process tabs with languages using AWK
        if [ "$has_tabs_elements" -gt 0 ]; then
            awk '
            BEGIN {
                in_tabs = 0
                tab_index = 0
                languages_count = 0
                file_has_changes = 0
            }
            
            # Step 6: Find {{< tabs LANGUAGES >}} and extract languages
            /^{{< tabs.*>}}/ {
                in_tabs = 1
                tab_index = 0
                
                # Extract everything after "tabs" and before ">}}"
                line = $0
                # Remove the opening {{< tabs part (handle optional space after tabs)
                # This handles cases like "{{< tabs SDK HTTP>}}" and "{{< tabs SDK HTTP >}}"
                gsub(/^{{< tabs */, "", line)
                gsub(/>}}$/, "", line)
                gsub(/^ +/, "", line)  # Remove leading spaces
                gsub(/ +$/, "", line)  # Remove trailing spaces
                
                # Parse quoted and unquoted strings with improved logic
                languages_count = 0
                i = 1
                while (i <= length(line)) {
                    # Skip whitespace
                    while (i <= length(line) && substr(line, i, 1) == " ") {
                        i++
                    }
                    
                    if (i > length(line)) break
                    
                    # Check if this token starts with a quote
                    if (substr(line, i, 1) == "\"") {
                        # Find the closing quote - handle quoted strings with spaces
                        i++ # Skip opening quote
                        start = i
                        while (i <= length(line) && substr(line, i, 1) != "\"") {
                            i++
                        }
                        if (i <= length(line)) {
                            # Found closing quote
                            token = substr(line, start, i - start)
                            if (token != "") {
                                languages[++languages_count] = token
                            }
                            i++ # Skip closing quote
                        }
                    } else {
                        # Unquoted token - read until space or end
                        # This handles single words and dash-separated words
                        start = i
                        while (i <= length(line) && substr(line, i, 1) != " ") {
                            i++
                        }
                        token = substr(line, start, i - start)
                        if (token != "") {
                            languages[++languages_count] = token
                        }
                    }
                }
                
                print "{{< tabpane text=true >}}"
                file_has_changes = 1
                next
            }
            
            # Step 7: Replace {{< /tabs >}} with {{< /tabpane >}}
            /^{{< \/tabs *>}}$/ {
                in_tabs = 0
                print "{{< /tabpane >}}"
                file_has_changes = 1
                next
            }
            
            # Update {{% tab %}} within tabs to include header parameter
            /^{{% tab *%}}$/ && in_tabs {
                if (tab_index < languages_count) {
                    tab_index++
                    print "{{% tab header=\"" languages[tab_index] "\" %}}"
                    file_has_changes = 1
                } else {
                    print $0
                }
                next
            }
            
            # Print all other lines as-is
            {
                print $0
            }
            
            END {
                # Return 0 if changes were made, 1 if no changes
                exit(file_has_changes ? 0 : 1)
            }
            ' "$temp_file" > "${temp_file}.awk"
            
            # Check if AWK made changes and copy result back to temp file
            if [ $? -eq 0 ]; then
                mv "${temp_file}.awk" "$temp_file"
                changes_made=true
                tabs_processed=true
                echo "  - Processed tabs/tabpane conversions"
            else
                rm -f "${temp_file}.awk"
            fi
        fi
        
        # Step 8: Final validation check (only if tabs were processed)
        if [ "$tabs_processed" = true ]; then
            echo "  - Running validation checks..."
            
            # Get counts safely from the processed temp file
            local opening_tabs=$(safe_count '{{% tab' "$temp_file")
            local closing_tabs=$(safe_count '{{% /tab' "$temp_file")
            local opening_tabpanes=$(safe_count '{{< tabpane' "$temp_file")
            local closing_tabpanes=$(safe_count '{{< /tabpane' "$temp_file")
            
            # Check for mismatches only if elements exist
            local validation_issues=false
            
            if [ "$opening_tabs" -gt 0 ] || [ "$closing_tabs" -gt 0 ]; then
                if [ "$opening_tabs" -ne "$closing_tabs" ]; then
                    echo "  ⚠️  WARNING: Unmatched tab elements - Opening: $opening_tabs, Closing: $closing_tabs"
                    validation_issues=true
                fi
            fi
            
            if [ "$opening_tabpanes" -gt 0 ] || [ "$closing_tabpanes" -gt 0 ]; then
                if [ "$opening_tabpanes" -ne "$closing_tabpanes" ]; then
                    echo "  ⚠️  WARNING: Unmatched tabpane elements - Opening: $opening_tabpanes, Closing: $closing_tabpanes"
                    validation_issues=true
                fi
            fi
            
            if [ "$validation_issues" = false ]; then
                echo "  ✅ Validation passed: All tab and tabpane elements are properly matched"
            fi
        fi
    fi
    
    # Copy temp file back to original if changes were made
    if [ "$changes_made" = true ]; then
        cp "$temp_file" "$file"
    fi
    
    # Clean up temp file
    rm "$temp_file"
    
    if [ "$changes_made" = true ]; then
        echo "  ✅ File processed with changes"
        ((files_with_changes++))
    else
        echo "  ℹ️  No changes needed"
        # Remove backup if no changes were made
        rm "${file}.backup"
    fi
    
    ((processed_files++))
    echo ""
}

echo "Starting conversion of tabs to tabpanes in directory: $DIRECTORY"
echo "============================================================="
echo ""

# Debug: Show what files will be processed
echo "Discovering markdown files..."
file_count=0
while IFS= read -r -d '' file; do
    echo "Found: $file"
    ((file_count++))
done < <(find "$DIRECTORY" -name "*.md" -type f -print0)
echo "Total files found: $file_count"
echo ""

# Find all markdown files recursively and process them
while IFS= read -r -d '' file; do
    process_file "$file"
done < <(find "$DIRECTORY" -name "*.md" -type f -print0)

echo "============================================================="
echo "Conversion completed!"
echo "Files processed: $processed_files"
echo "Files with changes: $files_with_changes"
echo ""

if [ $files_with_changes -gt 0 ]; then
    echo "Backup files created with .backup extension for files that were modified."
    echo "You can remove them with: find $DIRECTORY -name '*.backup' -delete"
fi

echo ""
echo "Summary of transformations applied:"
echo "1. ✅ [codetabs] → [tabpane]"
echo "2. ✅ {{< ref filename>}} → {{% ref filename %}}"
echo "3. ✅ Conditional processing based on presence of codetab/tabs elements"
echo "4. ✅ {{% codetab %}} → {{% tab %}} (if codetabs found)"
echo "5. ✅ {{% /codetab %}} → {{% /tab %}} (if codetabs found)"
echo "6. ✅ {{< tabs LANGUAGES >}} → {{< tabpane text=true >}} (if tabs found)"
echo "7. ✅ {{< /tabs >}} → {{< /tabpane >}} (if tabs found)"
echo "8. ✅ Validation check (only for files with processed tabs)"

exit 0
