# Script to update mwaka3-week[26-34].html files with content extracted from PDFS/mwakasehemu3.pdf
# It replaces the content within the <main>...</main> tags.

[Console]::OutputEncoding = [System.Text.UTF8Encoding]::UTF8

# --- CONFIGURATION ---
# Please update the page numbers for each week by inspecting your PDF file.
$weeklyPages = @{
    "26" = @{ Start = 42; End = 48 };
    "27" = @{ Start = 49; End = 56 };
    "28" = @{ Start = 57; End = 64 };
    "29" = @{ Start = 65; End = 72 };
    "30" = @{ Start = 73; End = 79 };
    "31" = @{ Start = 81; End = 88 }; # Note: PDF page 80 is blank
    "32" = @{ Start = 89; End = 95 };
    "33" = @{ Start = 96; End = 103 };
    "34" = @{ Start = 104; End = 112 };
}
# --- END CONFIGURATION ---

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourcePdf = Join-Path $projectRoot "PDFS\mwakasehemu3.pdf"

if (-not (Test-Path $sourcePdf)) { Write-Error "Missing source PDF: $sourcePdf"; exit 1 }

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

function Convert-TextToHtmlContent {
  param([string]$text)
  $escaped = Escape-Html $text
  $escaped = $escaped -replace "`r`n", "`n"
  $escaped = $escaped -replace "`r", "`n"
  $escaped = [regex]::Replace($escaped, "(`n){3,}", "`n`n")
  $escaped = $escaped -replace "`n`n", "<br><br>`n"
  $escaped = $escaped -replace "`n", "<br>`n"  
  # This structure is based on your other files for better styling.
@"
        <div class="rounded-3xl p-8 bg-green-100 dark:bg-green-900/30 backdrop-blur-sm shadow-xl border border-dashed border-green-200 dark:border-green-800/30 season-border space-y-8">
            <section>
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
$escaped
                </p>
            </section>
        </div>
"@
}

$weeksToUpdate = $weeklyPages.Keys | Sort-Object { [int]$_ }

foreach ($week in $weeksToUpdate) {
  $targetHtmlFile = Join-Path $projectRoot "mwaka3-week$($week).html"
  if (-not (Test-Path $targetHtmlFile)) {
    Write-Warning "Skipping Week $week: File not found at $targetHtmlFile"
    continue
  }

  try {
    Write-Host "Processing Week $week -> $($targetHtmlFile)"

    # 1. Extract text from PDF for the given page range
    $pages = $weeklyPages[$week]
    $args = @("-f", $pages.Start, "-l", $pages.End, "-enc", "UTF-8", "-layout", "-nopgbrk", "-q", "--", $sourcePdf, "-")
    $pdfText = & "$pdftotextPath" @args 2>&1
    if ([string]::IsNullOrWhiteSpace($pdfText)) {
      Write-Warning "No text extracted for Week $week (pages $($pages.Start)-$($pages.End)). Check page numbers. Skipping."
      continue
    }

    # 2. Prepare the new HTML content
    $newMainContent = Convert-TextToHtmlContent -text $pdfText

    # 3. Read the existing HTML file and replace the main content
    $htmlTemplate = Get-Content -Raw -LiteralPath $targetHtmlFile
    $mainContentMatch = [regex]::Match($htmlTemplate, '(?s)(<main\b[^>]*>).*(</main\s*>)', 'IgnoreCase')

    if (-not $mainContentMatch.Success) {
      Write-Error "Could not find <main>...</main> block in template file: $targetHtmlFile. Skipping."
      continue
    }

    # We will replace everything between <main> and </main>
    $mainOpenTag = $mainContentMatch.Groups[1].Value
    $mainCloseTag = $mainContentMatch.Groups[2].Value

    # 4. Assemble the final HTML
    $finalHtml = $htmlTemplate.Substring(0, $mainContentMatch.Index) + $mainOpenTag + "`r`n" + $newMainContent + "`r`n    " + $mainCloseTag + $htmlTemplate.Substring($mainContentMatch.Index + $mainContentMatch.Length)

    # 5. Write the updated content back to the file
    $finalHtml | Set-Content -LiteralPath $targetHtmlFile -Encoding UTF8
    Write-Host "Successfully updated: $targetHtmlFile"
  }
  catch {
    Write-Error "Failed to process Week $week for file $($targetHtmlFile): $($_.Exception.Message)"
  }
}

Write-Host "Done."