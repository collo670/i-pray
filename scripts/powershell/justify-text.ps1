param (
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

# Check if file exists
if (-not (Test-Path $FilePath)) {
    Write-Error "File not found: $FilePath"
    exit 1
}

# Read the HTML content
$content = Get-Content -Path $FilePath -Raw

# Add text-justify CSS to the content
# Look for the first <body> tag or create a style tag in the head
if ($content -match "<body[^>]*>") {
    # Add style attribute to the body tag
    $content = $content -replace "<body([^>]*)>", '<body$1 style="text-align: justify;">'
} elseif ($content -match "<head[^>]*>.*?</head>") {
    # Add style tag in the head
    $content = $content -replace "(<head[^>]*>)(.*?)(</head>)", '$1$2<style>body { text-align: justify; }</style>$3'
} else {
    # If no head tag, add it before the html closing tag
    $content = $content -replace "(<html[^>]*>)(.*?)(</html>)", '$1$2<style>body { text-align: justify; }</style>$3'
}

# Write the modified content back to the file
$content | Set-Content -Path $FilePath

Write-Host "Text justification applied to $FilePath"