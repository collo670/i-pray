# Script to update service worker to cache all files for offline access

# Get all files in the PWA application (excluding node_modules, .git, etc.)
function Get-AllPwaFiles {
    $excludedDirs = @("node_modules", ".git", ".vscode")
    $excludedExtensions = @(".ps1", ".log", ".md", ".gitignore")
    
    $allFiles = Get-ChildItem -Path . -Recurse -File | 
                Where-Object { 
                    $include = $true
                    
                    # Check if file is in excluded directory
                    foreach ($dir in $excludedDirs) {
                        if ($_.FullName -like "*\$dir\*") {
                            $include = $false
                            break
                        }
                    }
                    
                    # Check if file has excluded extension
                    if ($include -and $excludedExtensions -contains $_.Extension) {
                        $include = $false
                    }
                    
                    return $include
                }
    
    return $allFiles
}

# Update the service worker file with all files to cache
function Update-ServiceWorker {
    param (
        [Parameter(Mandatory=$true)]
        [System.IO.FileInfo[]]$Files
    )
    
    $serviceWorkerPath = ".\service-worker.js"
    
    if (-not (Test-Path $serviceWorkerPath)) {
        Write-Error "Service worker file not found at $serviceWorkerPath"
        return
    }
    
    # Read the current service worker content
    $content = Get-Content -Path $serviceWorkerPath -Raw
    
    # Generate the new urlsToCache array
    $urlsToCache = "const urlsToCache = [`n"
    $urlsToCache += "  '/i-pray/',`n"
    $urlsToCache += "  '/i-pray/index.html',`n"
    
    # Add all files to the cache list
    foreach ($file in $Files) {
        # Get the relative path from the current directory
        $relativePath = $file.FullName.Substring((Get-Location).Path.Length + 1)
        # Convert backslashes to forward slashes for web paths
        $webPath = $relativePath.Replace("\", "/")
        # Add the path to the cache list with the /i-pray/ prefix
        $urlsToCache += "  '/i-pray/$webPath',`n"
    }
    
    # Remove the trailing comma from the last item
    $urlsToCache = $urlsToCache.TrimEnd(",`n") + "`n];"
    
    # Replace the existing urlsToCache array in the service worker
    $newContent = $content -replace "const urlsToCache = \[[\s\S]*?\];", $urlsToCache
    
    # Update the cache version to force refresh
    $newCacheVersion = "ipray-v" + (Get-Date -Format "yyyyMMddHHmm")
    $newContent = $newContent -replace "const CACHE_NAME = '.*?'", "const CACHE_NAME = '$newCacheVersion'"
    
    # Write the updated content back to the service worker file
    $newContent | Set-Content -Path $serviceWorkerPath
    
    Write-Host "Service worker updated with $(($Files | Measure-Object).Count) files for offline caching"
}

# Update the manifest file to ensure it has the correct settings for installability
function Update-Manifest {
    $manifestPath = ".\manifest.json"
    
    if (-not (Test-Path $manifestPath)) {
        Write-Error "Manifest file not found at $manifestPath"
        return
    }
    
    # Read the current manifest content
    $manifest = Get-Content -Path $manifestPath -Raw | ConvertFrom-Json
    
    # Ensure required fields are present
    if (-not $manifest.PSObject.Properties.Name -contains "name") {
        $manifest | Add-Member -Type NoteProperty -Name "name" -Value "I Pray"
    }
    
    if (-not $manifest.PSObject.Properties.Name -contains "short_name") {
        $manifest | Add-Member -Type NoteProperty -Name "short_name" -Value "I Pray"
    }
    
    if (-not $manifest.PSObject.Properties.Name -contains "start_url") {
        $manifest | Add-Member -Type NoteProperty -Name "start_url" -Value "/i-pray/"
    }
    
    if (-not $manifest.PSObject.Properties.Name -contains "display") {
        $manifest | Add-Member -Type NoteProperty -Name "display" -Value "standalone"
    }
    
    # Ensure offline capability is explicitly set
    $manifest.display = "standalone"
    
    # Add or update the offline_enabled property
    if (-not $manifest.PSObject.Properties.Name -contains "offline_enabled") {
        $manifest | Add-Member -Type NoteProperty -Name "offline_enabled" -Value $true
    } else {
        $manifest.offline_enabled = $true
    }
    
    # Write the updated manifest back to the file
    $manifest | ConvertTo-Json -Depth 10 | Set-Content -Path $manifestPath
    
    Write-Host "Manifest file updated for offline capability"
}

# Ensure the service worker is registered in all HTML files
function Update-ServiceWorkerRegistration {
    $htmlFiles = Get-ChildItem -Path . -Filter "*.html" -Recurse | 
                Where-Object { $_.FullName -notlike "*\node_modules\*" }
    
    $registrationScript = @"
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/i-pray/service-worker.js')
        .then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(function(error) {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }
</script>
"@
    
    foreach ($file in $htmlFiles) {
        $content = Get-Content -Path $file.FullName -Raw
        
        # Check if the service worker registration is already present
        if ($content -notmatch "navigator\.serviceWorker\.register") {
            # Add the registration script before the closing </body> tag
            $content = $content -replace "</body>", "$registrationScript`n</body>"
            $content | Set-Content -Path $file.FullName
            Write-Host "Added service worker registration to $($file.Name)"
        }
    }
}

# Main execution
Write-Host "Starting PWA offline capability update..."

# Get all files to cache
$allFiles = Get-AllPwaFiles
Write-Host "Found $($allFiles.Count) files to cache for offline access"

# Update the service worker with all files
Update-ServiceWorker -Files $allFiles

# Update the manifest file
Update-Manifest

# Ensure service worker is registered in all HTML files
Update-ServiceWorkerRegistration

Write-Host "PWA offline capability update completed successfully!"