#!/bin/bash

# Fix all @radix-ui imports that have version numbers
echo "Fixing @radix-ui imports with version numbers..."

# Find all TypeScript/JavaScript files and fix the imports
find src/components/ui -name "*.tsx" -o -name "*.ts" | while read file; do
    # Check if file contains problematic imports
    if grep -q '@radix-ui/[^"'"'"']*@[0-9]' "$file"; then
        echo "Fixing: $file"
        # Use sed to remove version numbers from @radix-ui imports
        sed -i '' 's/@radix-ui\/\([^@"'"'"']*\)@[0-9.]*/@radix-ui\/\1/g' "$file"
    fi
done

echo "Done fixing imports!"