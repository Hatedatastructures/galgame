param(
    [int]$port = 8910
)

$root = Split-Path -Parent $PSScriptRoot
$prefix = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Serving $root at $prefix"
while ($true) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    $path = $req.Url.AbsolutePath.TrimStart('/')
    if ($path -eq "") { $path = "webroot/index.html" }
    $full = Join-Path $root $path
    $full = [System.IO.Path]::GetFullPath($full)
    $root_full = [System.IO.Path]::GetFullPath($root)
    if (-not $full.StartsWith($root_full)) {
        $res.StatusCode = 403
        $buf = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
        $res.OutputStream.Write($buf,0,$buf.Length)
        $res.Close()
        continue
    }
    if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
        $res.StatusCode = 404
        $buf = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
        $res.OutputStream.Write($buf,0,$buf.Length)
        $res.Close()
        continue
    }
    $bytes = [System.IO.File]::ReadAllBytes($full)
    $ct = "application/octet-stream"
    $lower = $full.ToLower()
    if ($lower.EndsWith(".html")) { $ct="text/html; charset=utf-8" }
    elseif ($lower.EndsWith(".js")) { $ct="application/javascript; charset=utf-8" }
    elseif ($lower.EndsWith(".css")) { $ct="text/css; charset=utf-8" }
    elseif ($lower.EndsWith(".json")) { $ct="application/json; charset=utf-8" }
    elseif ($lower.EndsWith(".png")) { $ct="image/png" }
    elseif ($lower.EndsWith(".jpg") -or $lower.EndsWith(".jpeg")) { $ct="image/jpeg" }
    elseif ($lower.EndsWith(".webp")) { $ct="image/webp" }
    $res.ContentType = $ct
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes,0,$bytes.Length)
    $res.Close()
}