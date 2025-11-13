# Script to add space between paragraphs in all mwaka2* and mwaka3* HTML files

# Function to add paragraph spacing to an HTML file
function Add-ParagraphSpacing {
    param (
        [Parameter(Mandatory=$true)]
        [string]$FilePath
    )

    # Check if file exists
    if (-not (Test-Path $FilePath)) {
        Write-Error "File not found: $FilePath"
        return
    }

    # Read the HTML content
    $content = Get-Content -Path $FilePath -Raw

    # Add CSS for paragraph spacing to the head section
    if ($content -match "<head[^>]*>.*?</head>") {
        # Add style tag in the head
        $content = $content -replace "(<head[^>]*>)(.*?)(</head>)", '$1$2<style>p { margin-bottom: 1.5em; }</style>$3'
    } else {
        # If no head tag, add it before the html closing tag
        $content = $content -replace "(<html[^>]*>)(.*?)(</html>)", '$1$2<style>p { margin-bottom: 1.5em; }</style>$3'
    }

    # Write the modified content back to the file
    $content | Set-Content -Path $FilePath

    Write-Host "Paragraph spacing added to $FilePath"
}

# Get all mwaka2* and mwaka3* HTML files
$mwaka2Files = Get-ChildItem -Path . -Filter "mwaka2*.html"
$mwaka3Files = Get-ChildItem -Path . -Filter "mwaka3*.html"

# Process mwaka2 files
Write-Host "Processing mwaka2* files..."
foreach ($file in $mwaka2Files) {
    Add-ParagraphSpacing -FilePath $file.FullName
}

# Process mwaka3 files
Write-Host "Processing mwaka3* files..."
foreach ($file in $mwaka3Files) {
    Add-ParagraphSpacing -FilePath $file.FullName
}

Write-Host "All files processed successfully!"