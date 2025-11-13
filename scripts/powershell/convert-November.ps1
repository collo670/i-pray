# Convert PDFs in assets/november to HTML using assets/july/31jul.html as template
# Output HTML files are named exactly like the PDFs (basename), saved in assets/november

[Console]::OutputEncoding = [System.Text.UTF8Encoding]::UTF8

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$novemberDir = Join-Path $projectRoot "assets\november"
$templateFile = Join-Path $projectRoot "assets\july\31jul.html"

if (-not (Test-Path $novemberDir)) { Write-Error "Missing folder: $novemberDir"; exit 1 }
if (-not (Test-Path $templateFile)) { Write-Error "Missing template: $templateFile"; exit 1 }

function Find-PdfToText {
  $cmd = Get-Command pdftotext -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Path }

  $candidates = @(
    "C:\\Program Files\\poppler-24.07.0\\Library\\bin\\pdftotext.exe",
    "C:\\Program Files\\poppler-24.02.0\\Library\\bin\\pdftotext.exe",
    "C:\\Program Files\\poppler-23.11.0\\Library\\bin\\pdftotext.exe",
    "C:\\Program Files\\poppler-*\\Library\\bin\\pdftotext.exe",
    "C:\\Program Files\\poppler-*\\bin\\pdftotext.exe"
  )

  foreach ($pattern in $candidates) {
    Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | ForEach-Object {
      if (Test-Path $_.FullName) { return $_.FullName }
    }
  }
  return $null
}

$pdftotextPath = Find-PdfToText
if (-not $pdftotextPath) {
  Write-Host "pdftotext not found. Install Poppler then rerun:"
  Write-Host "  winget install -e --id oschwartz10612.Poppler"
  Write-Host "or choco install poppler"
  exit 1
}
Write-Host "Using pdftotext: $pdftotextPath"

$template = Get-Content -Raw -LiteralPath $templateFile
$mainOpen = [regex]::Match($template, '<main\b[^>]*>', 'IgnoreCase')
$mainClose = [regex]::Match($template, '</main\s*>', 'IgnoreCase')
if (-not ($mainOpen.Success -and $mainClose.Success)) {
  Write-Error "Could not find <main>...</main> in template."
  exit 1
}
$beforeMain = $template.Substring(0, $mainOpen.Index + $mainOpen.Length)
$afterMain  = $template.Substring($mainClose.Index)

function Escape-Html {
  param([string]$s)
  if ($null -eq $s) { return "" }
  $s = $s -replace '&','&amp;'
  $s = $s -replace '<','&lt;'
  $s = $s -replace '>','&gt;'
  $s = $s -replace '"','&quot;'
  $s = $s -replace "'","&#39;"
  return $s
}

function Convert-TextToHtml {
  param([string]$text,[string]$titleForHeader)
  $escaped = Escape-Html $text
  $escaped = $escaped -replace "`r`n", "`n"
  $escaped = $escaped -replace "`r", "`n"
  $escaped = [regex]::Replace($escaped, "(`n){3,}", "`n`n")
  $escaped = $escaped -replace "`n`n", "<br><br>`n"
  $escaped = $escaped -replace "`n", "<br>`n"
@"
        <div class="rounded-3xl p-8 bg-green-100 dark:bg-green-900/30 backdrop-blur-sm shadow-xl border border-dashed border-green-200 dark:border-green-800/30 season-border space-y-8">
            <section>
                <h2 class="text-xl font-bold text-green-800 dark:text-green-300 mb-3">$titleForHeader</h2>
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
$escaped
                </p>
            </section>
        </div>
"@
}

function Set-Title {
  param([string]$html,[string]$newTitle)
  if ([regex]::IsMatch($html, '<title>.*?</title>', 'IgnoreCase')) {
    $safe = Escape-Html $newTitle
    return [regex]::Replace($html, '<title>.*?</title>', "<title>$safe</title>", 'IgnoreCase')
  }
  return $html
}

$pdfs = Get-ChildItem -LiteralPath $novemberDir -Filter *.pdf -File | Sort-Object Name
if (-not $pdfs) { Write-Host "No PDFs found in $novemberDir"; exit 0 }

foreach ($pdf in $pdfs) {
  try {
    $nameNoExt = [System.IO.Path]::GetFileNameWithoutExtension($pdf.Name)
    $outHtml   = Join-Path $novemberDir ($nameNoExt + ".html")
    Write-Host "Converting: $($pdf.FullName)"

    $args = @("-enc","UTF-8","-layout","-nopgbrk","-q","--",$pdf.FullName,"-")
    $pdfText = & "$pdftotextPath" @args 2>&1
    if ([string]::IsNullOrWhiteSpace($pdfText)) {
      Write-Warning "No text extracted (file may be scanned images): $($pdf.Name)"
      continue
    }

    $content = Convert-TextToHtml -text $pdfText -titleForHeader $nameNoExt
    $final   = $beforeMain + "`r`n" + $content + "`r`n" + $afterMain
    $final   = Set-Title -html $final -newTitle "Daily Readings - $nameNoExt"
    $final | Set-Content -LiteralPath $outHtml -Encoding UTF8
    Write-Host "Wrote: $outHtml"
  }
  catch {
    Write-Error "Failed for $($pdf.Name): $($_.Exception.Message)"
  }
}

Write-Host "Done."

# Set project paths
$projectRoot = "C:\Users\otien\Desktop\i-pray-1"
$novemberDir = Join-Path $projectRoot "assets\november"
$templateFile = Join-Path $projectRoot "assets\july\31jul.html"

# Basic validations
if (-not (Test-Path $novemberDir)) { Write-Error "Missing folder: $novemberDir"; exit 1 }
if (-not (Test-Path $templateFile)) { Write-Error "Missing template: $templateFile"; exit 1 }

# Find pdftotext (Poppler)
function Find-PdfToText {
  $cmd = Get-Command pdftotext -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Path }

  $candidates = @(
    "C:\Program Files\poppler-23.11.0\Library\bin\pdftotext.exe",
    "C:\Program Files\poppler-24.02.0\Library\bin\pdftotext.exe",
    "C:\Program Files\poppler-24.07.0\Library\bin\pdftotext.exe",
    "C:\Program Files\poppler-*\Library\bin\pdftotext.exe",
    "C:\Program Files\poppler-*\bin\pdftotext.exe"
  )

  foreach ($pattern in $candidates) {
    Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | ForEach-Object {
      if (Test-Path $_.FullName) { return $_.FullName }
    }
  }
  return $null
}

$pdftotextPath = Find-PdfToText
if (-not $pdftotextPath) {
  Write-Host "pdftotext not found."
  Write-Host "Install Poppler, then rerun:"
  Write-Host "  winget install -e --id oschwartz10612.Poppler"
  Write-Host "or choco install poppler"
  exit 1
}
Write-Host "Using pdftotext: $pdftotextPath"

# Read template and split at <main>...</main>
$template = Get-Content -Raw -LiteralPath $templateFile
$mainOpen = [regex]::Match($template, '<main\b[^>]*>', 'IgnoreCase')
$mainClose = [regex]::Match($template, '</main\s*>', 'IgnoreCase')
if (-not ($mainOpen.Success -and $mainClose.Success)) {
  Write-Error "Could not find <main>...</main> in template."
  exit 1
}
$beforeMain = $template.Substring(0, $mainOpen.Index + $mainOpen.Length)
$afterMain  = $template.Substring($mainClose.Index)

function Escape-Html {
  param([string]$s)
  if ($null -eq $s) { return "" }
  $s = $s -replace '&','&amp;'
  $s = $s -replace '<','&lt;'
  $s = $s -replace '>','&gt;'
  $s = $s -replace '"','&quot;'
  $s = $s -replace "'","&#39;"
  return $s
}

function Convert-TextToHtml {
  param([string]$text,[string]$titleForHeader)
  $escaped = Escape-Html $text
  $escaped = $escaped -replace "`r`n", "`n"
  $escaped = $escaped -replace "`r", "`n"
  $escaped = [regex]::Replace($escaped, "(`n){3,}", "`n`n")
  $escaped = $escaped -replace "`n`n", "<br><br>`n"
  $escaped = $escaped -replace "`n", "<br>`n"
@"
        <div class="rounded-3xl p-8 bg-green-100 dark:bg-green-900/30 backdrop-blur-sm shadow-xl border border-dashed border-green-200 dark:border-green-800/30 season-border space-y-8">
            <section>
                <h2 class="text-xl font-bold text-green-800 dark:text-green-300 mb-3">$titleForHeader</h2>
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
$escaped
                </p>
            </section>
        </div>
"@
}

function Set-Title {
  param([string]$html,[string]$newTitle)
  if ([regex]::IsMatch($html, '<title>.*?</title>', 'IgnoreCase')) {
    $safe = Escape-Html $newTitle
    return [regex]::Replace($html, '<title>.*?</title>', "<title>$safe</title>", 'IgnoreCase')
  }
  return $html
}

# Process PDFs
$pdfs = Get-ChildItem -LiteralPath $novemberDir -Filter *.pdf -File | Sort-Object Name
if (-not $pdfs) {
  Write-Host "No PDFs found in $novemberDir"
  exit 0
}

foreach ($pdf in $pdfs) {
  try {
    $nameNoExt = [System.IO.Path]::GetFileNameWithoutExtension($pdf.Name)
    $outHtml   = Join-Path $novemberDir ($nameNoExt + ".html")
    Write-Host "Converting: $($pdf.FullName)"

    # Extract text; if you see empty output, remove -layout to improve extraction
    $args = @("-enc","UTF-8","-layout","-nopgbrk","-q","--",$pdf.FullName,"-")
    $pdfText = & "$pdftotextPath" @args 2>&1
    if ([string]::IsNullOrWhiteSpace($pdfText)) {
      Write-Warning "No text extracted (file may be scanned images): $($pdf.Name)"
      continue
    }

    $content = Convert-TextToHtml -text $pdfText -titleForHeader $nameNoExt
    $final   = $beforeMain + "`r`n" + $content + "`r`n" + $afterMain
    $final   = Set-Title -html $final -newTitle "Daily Readings - $nameNoExt"
    $final | Set-Content -LiteralPath $outHtml -Encoding UTF8
    Write-Host "Wrote: $outHtml"
  }
  catch {
    Write-Error "Failed for $($pdf.Name): $($_.Exception.Message)"
  }
}

Write-Host "Done."