# Script to standardize CSS in HTML files by linking to a stylesheet and removing inline styles.

# Define the path to the 'ofisi ya masomo' directory
$basePath = "c:\Users\otien\Desktop\i-pray-1\ofisi ya masomo"
if (-not (Test-Path $basePath)) {
    Write-Error "Directory not found: $basePath"
    return
}

# Get all HTML files recursively
$htmlFiles = Get-ChildItem -Path $basePath -Filter "*.html" -Recurse

# The CSS link to be inserted. The path is relative to the HTML file's location.
# Since files are in subdirectories of 'ofisi ya masomo', '../styles.css' should be correct.
$cssLink = '<link rel="stylesheet" href="../styles.css">'

Write-Host "Processing $($htmlFiles.Count) HTML files..."

foreach ($file in $htmlFiles) {
    Write-Host "Checking $($file.FullName)..."
    $content = Get-Content -Path $file.FullName -Raw

    $wasModified = $false

    # 1. Remove existing <style> blocks
    $originalLength = $content.Length
    $content = $content -replace '(?s)<style.*?</style>', ''
    if ($content.Length -ne $originalLength) {
        Write-Host "  - Removed inline <style> block."
        $wasModified = $true
    }

    # 2. Check if the CSS link already exists in the <head>
    if ($content -notmatch [regex]::Escape($cssLink)) {
        # If not, insert it before the closing </head> tag
        if ($content -match '</head>') {
            $content = $content -replace '</head>', "    $cssLink`r`n</head>"
            Write-Host "  - Inserted CSS link."
            $wasModified = $true
        } else {
            Write-Warning "  - No </head> tag found in $($file.Name). Could not insert CSS link."
        }
    } else {
        Write-Host "  - CSS link already present."
    }

    # Write the content back to the file only if it was modified
    if ($wasModified) {
        $content | Set-Content -Path $file.FullName
        Write-Host "  - Saved changes to $($file.Name)."
    } else {
        Write-Host "  - No changes needed."
    }
}

Write-Host "Script finished. All files have been processed."
