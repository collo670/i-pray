# Script to add <br> tags between paragraphs in all mwaka2* and mwaka3* HTML files

# Function to add <br> tags between paragraphs in an HTML file
function Add-BrTags {
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

    # Add <br> tags after each </p> tag
    $content = $content -replace "</p>", "</p><br><br>"

    # Write the modified content back to the file
    $content | Set-Content -Path $FilePath

    Write-Host "Added <br> tags between paragraphs in $FilePath"
}

# Get all mwaka2* and mwaka3* HTML files
$mwaka2Files = Get-ChildItem -Path . -Filter "mwaka2*.html"
$mwaka3Files = Get-ChildItem -Path . -Filter "mwaka3*.html"

# Process mwaka2 files
Write-Host "Processing mwaka2* files..."
foreach ($file in $mwaka2Files) {
    Add-BrTags -FilePath $file.FullName
}

# Process mwaka3 files
Write-Host "Processing mwaka3* files..."
foreach ($file in $mwaka3Files) {
    Add-BrTags -FilePath $file.FullName
}

Write-Host "All files processed successfully!"