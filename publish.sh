#!/bin/bash

# Load environment variables from .env.local
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
else
    echo "Error: .env.local file not found!"
    echo "Please create .env.local with your VSCE_PAT token"
    exit 1
fi

# Check if token is set
if [ -z "$VSCE_PAT" ] || [ "$VSCE_PAT" = "YOUR_PERSONAL_ACCESS_TOKEN_HERE" ]; then
    echo "Error: Please set your Personal Access Token in .env.local"
    echo "Get your token from: https://dev.azure.com/_usersSettings/tokens"
    exit 1
fi

# Compile the extension
echo "Compiling extension..."
npm run compile

# Package and publish
echo "Publishing extension..."
npx vsce publish -p $VSCE_PAT

echo "Extension published successfully!"