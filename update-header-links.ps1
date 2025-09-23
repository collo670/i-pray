# Script to update header links in all weekday HTML files

# Function to update links in an HTML file
function Update-HeaderLinks {
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

    # Update the "Ofisi ya Masomo" link to open the office of readings card in index
    $content = $content -replace '(<a[^>]*>Ofisi ya Masomo</a>)', '<a href="index.html#office-of-readings">Ofisi ya Masomo</a>'
    
    # Update the "Rozari Takatifu" link to open the holy rosary HTML file
    $content = $content -replace '(<a[^>]*>Rozari Takatifu</a>)', '<a href="holy-rosary.html">Rozari Takatifu</a>'
    
    # Update the "Kalenda" link to open the calendar HTML file
    $content = $content -replace '(<a[^>]*>Kalenda</a>)', '<a href="calendar.html">Kalenda</a>'

    # Write the modified content back to the file
    $content | Set-Content -Path $FilePath

    Write-Host "Updated header links in $FilePath"
}

# Function to remove English Office HTML links
function Remove-EnglishOfficeLinks {
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

    # Remove any links to English Office HTML
    $content = $content -replace '<a[^>]*>English Office</a>', ''
    $content = $content -replace '<a[^>]*href="[^"]*eng[^"]*\.html"[^>]*>[^<]*</a>', ''

    # Write the modified content back to the file
    $content | Set-Content -Path $FilePath

    Write-Host "Removed English Office links in $FilePath"
}

# Get all weekday HTML files
$weekdayFiles = Get-ChildItem -Path . -Filter "*.html" | Where-Object { 
    $_.Name -match "^(jumatatu|jumanne|jumatano|alhamisi|ijumaa|jumamosi|jumapili)" 
}

# Process each file
Write-Host "Updating header links in weekday files..."
foreach ($file in $weekdayFiles) {
    Update-HeaderLinks -FilePath $file.FullName
    Remove-EnglishOfficeLinks -FilePath $file.FullName
}

Write-Host "All files processed successfully!"