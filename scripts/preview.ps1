param(
    [int]$Port = 8080,
    [switch]$NoOpen
)

$ErrorActionPreference = 'Stop'

$projectDir = Split-Path -Parent $PSScriptRoot
$workspaceRoot = Split-Path -Parent $projectDir
$defaultPath = 'i-pray/index.html'
$url = "http://localhost:$Port/$defaultPath"

function Get-ContentType([string]$path) {
    switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
        '.html' { 'text/html; charset=utf-8' }
        '.css'  { 'text/css; charset=utf-8' }
        '.js'   { 'application/javascript; charset=utf-8' }
        '.json' { 'application/json; charset=utf-8' }
        '.svg'  { 'image/svg+xml' }
        '.png'  { 'image/png' }
        '.jpg'  { 'image/jpeg' }
        '.jpeg' { 'image/jpeg' }
        '.gif'  { 'image/gif' }
        '.webp' { 'image/webp' }
        '.ico'  { 'image/x-icon' }
        '.woff' { 'font/woff' }
        '.woff2' { 'font/woff2' }
        '.ttf'  { 'font/ttf' }
        '.txt'  { 'text/plain; charset=utf-8' }
        '.xml'  { 'application/xml; charset=utf-8' }
        default { 'application/octet-stream' }
    }
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host "Serving $workspaceRoot at http://localhost:$Port/" -ForegroundColor Green
Write-Host "Open: $url" -ForegroundColor Cyan
Write-Host 'Press Ctrl+C to stop.' -ForegroundColor Yellow

if (-not $NoOpen) {
    Start-Process $url | Out-Null
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        try {
            $requestPath = [System.Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
            if ([string]::IsNullOrWhiteSpace($requestPath)) {
                $requestPath = $defaultPath
            }

            $safePath = $requestPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $fullPath = Join-Path $workspaceRoot $safePath
            $resolvedRoot = [System.IO.Path]::GetFullPath($workspaceRoot)
            $resolvedPath = [System.IO.Path]::GetFullPath($fullPath)

            if (-not $resolvedPath.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
                $context.Response.StatusCode = 403
                $bytes = [System.Text.Encoding]::UTF8.GetBytes('Forbidden')
                $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
                continue
            }

            if ((Test-Path $resolvedPath) -and (Get-Item $resolvedPath).PSIsContainer) {
                $resolvedPath = Join-Path $resolvedPath 'index.html'
            }

            if (-not (Test-Path $resolvedPath) -or (Get-Item $resolvedPath).PSIsContainer) {
                $context.Response.StatusCode = 404
                $bytes = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
                $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
                continue
            }

            $context.Response.StatusCode = 200
            $context.Response.ContentType = Get-ContentType $resolvedPath
            $bytes = [System.IO.File]::ReadAllBytes($resolvedPath)
            $context.Response.ContentLength64 = $bytes.Length
            $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        catch {
            $context.Response.StatusCode = 500
            $bytes = [System.Text.Encoding]::UTF8.GetBytes('Server Error')
            $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        finally {
            $context.Response.OutputStream.Close()
            $context.Response.Close()
        }
    }
}
finally {
    $listener.Stop()
    $listener.Close()
}
