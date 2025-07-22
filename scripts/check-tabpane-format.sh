#!/bin/bash

# Script to check markdown files for correct tabpane format
# Usage: ./check-tabpane-format.sh [directory]
# If no directory is provided, it will check the current directory

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default directory is current directory if not provided
CHECK_PATH="${1:-.}"

# Check if path exists (file or directory)
if [ ! -e "$CHECK_PATH" ]; then
    echo -e "${RED}Error: Path '$CHECK_PATH' does not exist${NC}"
    exit 1
fi

echo "Checking markdown files in: $CHECK_PATH"
echo "========================================="

# Initialize counters
total_files=0
files_with_issues=0
files_checked=0

# Function to check a single markdown file
check_markdown_file() {
    local file="$1"
    local has_issues=false
    local issues=()
    
    # Read file content
    content=$(cat "$file")
    
    # Check 1: If file contains tabpane
    if echo "$content" | grep -q "tabpane"; then
        files_checked=$((files_checked + 1))
        
        # Check 2: tabpane format should be {{< tabpane text=true >}}
        if ! echo "$content" | grep -qE '\{\{<\s*tabpane\s+text=true\s*>\}\}'; then
            has_issues=true
            issues+=("Missing or incorrect tabpane opening format - should be '{{< tabpane text=true >}}'")
        fi
        
        # Check 3: Should contain one or more tab elements if tabpane exists
        if ! echo "$content" | grep -q "{% tab"; then
            has_issues=true
            issues+=("tabpane exists but no tab elements found")
        fi
        
        # Check 4: Tab element format should be {{% tab header=VALUE %}}
        # Allow VALUE to be a word with/without quotes or multiple words within quotes
        tab_lines=$(echo "$content" | grep -n "{% tab")
        while IFS= read -r line; do
            if [ -n "$line" ]; then
                line_content=$(echo "$line" | cut -d: -f2-)
                if ! echo "$line_content" | grep -qE '\{\{%\s*tab\s+header=(("[^"]*")|([a-zA-Z0-9_-]+))\s*%\}\}'; then
                    has_issues=true
                    line_num=$(echo "$line" | cut -d: -f1)
                    issues+=("Line $line_num: Incorrect tab opening format - should be '{{% tab header=VALUE %}}' where VALUE can be a word or quoted string")
                fi
            fi
        done <<< "$tab_lines"
        
        # Check 5 & 6: For each opening tab, there should be a closing /tab with format {{% /tab %}}
        opening_tabs=$(echo "$content" | grep -c "{% tab" || true)
        closing_tabs=$(echo "$content" | grep -cE '\{\{%\s*/tab\s*%\}\}' || true)
        
        if [ "$opening_tabs" -ne "$closing_tabs" ]; then
            has_issues=true
            issues+=("Mismatched tab elements: $opening_tabs opening tabs but $closing_tabs closing tabs")
        fi
        
        # Check closing tab format
        invalid_closing_tabs=$(echo "$content" | grep "{% /tab" | grep -vcE '\{\{%\s*/tab\s*%\}\}' || true)
        if [ "$invalid_closing_tabs" -gt 0 ]; then
            has_issues=true
            issues+=("$invalid_closing_tabs closing tab elements have incorrect format - should be '{{% /tab %}}'")
        fi
        
        # Check 7 & 8: For each opening tabpane, there should be a closing /tabpane with format {{< /tabpane >}}
        opening_tabpanels=$(echo "$content" | grep -c "{{< tabpane" || true)
        closing_tabpanels=$(echo "$content" | grep -cE '\{\{<\s*/tabpane\s*>\}\}' || true)
        
        if [ "$opening_tabpanels" -ne "$closing_tabpanels" ]; then
            has_issues=true
            issues+=("Mismatched tabpane elements: $opening_tabpanels opening tabpanels but $closing_tabpanels closing tabpanels")
        fi
        
        # Check closing tabpane format
        invalid_closing_tabpanels=$(echo "$content" | grep "/tabpane" | grep -vcE '\{\{<\s*/tabpane\s*>\}\}' || true)
        if [ "$invalid_closing_tabpanels" -gt 0 ]; then
            has_issues=true
            issues+=("$invalid_closing_tabpanels closing tabpane elements have incorrect format - should be '{{< /tabpane >}}'")
        fi
        
        # Report issues
        if [ "$has_issues" = true ]; then
            files_with_issues=$((files_with_issues + 1))
            echo -e "${RED}Issues found in: $file${NC}"
            for issue in "${issues[@]}"; do
                echo -e "  ${YELLOW}• $issue${NC}"
            done
            echo ""
        fi
    fi
}

# Find and process all markdown files
if [ -f "$CHECK_PATH" ] && [[ "$CHECK_PATH" == *.md ]]; then
    # Single file
    total_files=1
    check_markdown_file "$CHECK_PATH"
else
    # Directory - find all markdown files
    while IFS= read -r -d '' file; do
        total_files=$((total_files + 1))
        check_markdown_file "$file"
    done < <(find "$CHECK_PATH" -name "*.md" -type f -print0)
fi

# Summary
echo "========================================="
echo "Summary:"
echo "- Total markdown files found: $total_files"
echo "- Files with tabpanels checked: $files_checked"
if [ "$files_with_issues" -eq 0 ]; then
    echo -e "- Files with issues: ${GREEN}$files_with_issues${NC}"
    echo -e "${GREEN}✓ All tabpane formats are correct!${NC}"
else
    echo -e "- Files with issues: ${RED}$files_with_issues${NC}"
    echo -e "${RED}✗ Found formatting issues in tabpane elements${NC}"
fi
