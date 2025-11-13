$septFiles = Get-ChildItem -Path "assets\september" -Filter "*.html" | Where-Object { $_.BaseName -match '^(1[89]|2[0-9]|30)sep$' }
$octFiles = Get-ChildItem -Path "assets\october" -Filter "*.html"
$files = $septFiles + $octFiles

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Remove dark: classes
    $content = $content -replace ' dark:[^"]*', ''
    $content = $content -replace 'dark:[^"]*', ''

    # Clean up multiple spaces in class attributes
    $content = $content -replace 'class=" +', 'class="'
    $content = $content -replace ' +"', '"'
    $content = $content -replace '  +', ' '

    # Remove dark styles
    $content = $content -replace '(?s)\.dark \.bg-gradient-vintage \{.*?\}', ''
    $content = $content -replace '(?s)body\.light-mode \.card \{.*?\}', ''
    $content = $content -replace '(?s)\.card \{.*?\}', '.card { background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: background-color 0.3s ease, box-shadow 0.3s ease; }'
    $content = $content -replace '(?s)body\.light-mode \.bg-gradient-vintage \{.*?\}', ''

    Set-Content $file.FullName $content
}