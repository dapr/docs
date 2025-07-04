#!/bin/bash

# Script to validate tabpane and tab shortcode structure in markdown files
# Usage: ./validate-tabpanes.sh [directory]

# Set the directory to search (default to current directory)
SEARCH_DIR="${1:-.}"

echo "Validating tabpane and tab shortcode structure in: $SEARCH_DIR"
echo "================================================================"

# Counters for summary
total_files=0
files_with_tabpanes=0
files_with_errors=0
total_errors=0

# Find all .md files and validate them
while IFS= read -r -d '' file; do
    total_files=$((total_files + 1))
    
    # Check if file contains tabpane shortcodes
    if ! grep -q '{{% tabpane' "$file"; then
        continue
    fi
    
    files_with_tabpanes=$((files_with_tabpanes + 1))
    echo ""
    echo "Validating: $file"
    echo "$(printf '=%.0s' {1..80})"
    
    file_errors=0
    
    # Extract line numbers and content for analysis
    temp_file=$(mktemp)
    grep -n '{{% \(tab\|/tab\|tabpane\|/tabpane\)' "$file" > "$temp_file"
    
    if [ ! -s "$temp_file" ]; then
        echo "No tabpane/tab shortcodes found (false positive)"
        rm "$temp_file"
        continue
    fi
    
    # Use a single stack to track all opening shortcodes with their types
    declare -a stack=()
    
    # Process each shortcode line
    while IFS= read -r line; do
        line_num=$(echo "$line" | cut -d: -f1)
        content=$(echo "$line" | cut -d: -f2-)
        
        # Check for tabpane opening
        if echo "$content" | grep -q '{{% tabpane'; then
            stack+=("tabpane:$line_num")
            
        # Check for tabpane closing
        elif echo "$content" | grep -q '{{% /tabpane'; then
            # Find the most recent unmatched tabpane
            found_match=false
            for ((i=${#stack[@]}-1; i>=0; i--)); do
                if [[ "${stack[i]}" == tabpane:* ]]; then
                    unset "stack[$i]"
                    # Reindex array
                    temp_array=()
                    for item in "${stack[@]}"; do
                        if [ -n "$item" ]; then
                            temp_array+=("$item")
                        fi
                    done
                    stack=("${temp_array[@]}")
                    found_match=true
                    break
                fi
            done
            
            if [ "$found_match" = false ]; then
                echo "ERROR (Line $line_num): Closing /tabpane found without matching opening tabpane."
                file_errors=$((file_errors + 1))
            fi
            
        # Check for tab opening
        elif echo "$content" | grep -q '{{% tab'; then
            # Check if we're inside a tabpane
            in_tabpane=false
            for item in "${stack[@]}"; do
                if [[ "$item" == tabpane:* ]]; then
                    in_tabpane=true
                    break
                fi
            done
            
            if [ "$in_tabpane" = false ]; then
                echo "ERROR (Line $line_num): Tab shortcode found outside of tabpane."
                file_errors=$((file_errors + 1))
            else
                stack+=("tab:$line_num")
            fi
            
        # Check for tab closing
        elif echo "$content" | grep -q '{{% /tab'; then
            # Find the most recent unmatched tab
            found_match=false
            for ((i=${#stack[@]}-1; i>=0; i--)); do
                if [[ "${stack[i]}" == tab:* ]]; then
                    unset "stack[$i]"
                    # Reindex array
                    temp_array=()
                    for item in "${stack[@]}"; do
                        if [ -n "$item" ]; then
                            temp_array+=("$item")
                        fi
                    done
                    stack=("${temp_array[@]}")
                    found_match=true
                    break
                fi
            done
            
            if [ "$found_match" = false ]; then
                # Check if we're inside a tabpane
                in_tabpane=false
                for item in "${stack[@]}"; do
                    if [[ "$item" == tabpane:* ]]; then
                        in_tabpane=true
                        break
                    fi
                done
                
                if [ "$in_tabpane" = false ]; then
                    echo "ERROR (Line $line_num): Closing /tab found outside of tabpane."
                else
                    echo "ERROR (Line $line_num): Closing /tab found without matching opening tab."
                fi
                file_errors=$((file_errors + 1))
            fi
        fi
        
    done < "$temp_file"
    
    # Check for unclosed elements at end of file
    if [ ${#stack[@]} -gt 0 ]; then
        echo "ERROR (End of file): ${#stack[@]} element(s) are never closed:"
        for item in "${stack[@]}"; do
            element_type="${item%:*}"
            element_line="${item#*:}"
            echo "  - ${element_type^} opened at line $element_line"
        done
        file_errors=$((file_errors + 1))
    fi
    
    # Report results for this file
    if [ $file_errors -eq 0 ]; then
        echo "✓ No errors found"
    else
        echo "✗ Found $file_errors error(s)"
        files_with_errors=$((files_with_errors + 1))
        total_errors=$((total_errors + file_errors))
    fi
    
    rm "$temp_file"
    
done < <(find "$SEARCH_DIR" -name "*.md" -type f -print0)

echo ""
echo "Summary:"
echo "========"
echo "Total markdown files scanned: $total_files"
echo "Files with tabpane shortcodes: $files_with_tabpanes"
echo "Files with errors: $files_with_errors"
echo "Total errors found: $total_errors"

if [ $total_errors -eq 0 ]; then
    echo "🎉 All tabpane structures are valid!"
    exit 0
else
    echo "⚠️  Found structural issues that need to be fixed."
    exit 1
fi
