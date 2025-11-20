$project_root = Split-Path $PSScriptRoot -Parent
$route_path = Join-Path $project_root "data\route_gu_wan.json"
$output_dir = Join-Path $project_root "data\route_gu_wan_scenes"

New-Item -ItemType Directory -Path $output_dir -Force | Out-Null

$route_json_text = Get-Content -LiteralPath $route_path -Raw -Encoding UTF8
$route_obj = $route_json_text | ConvertFrom-Json
$scenes = $route_obj.scenes

$count = 0
foreach ($scene in $scenes) {
    $scene_id = $scene.scene_id
    if (-not $scene_id) { continue }
    $out_path = Join-Path $output_dir ("$scene_id.json")
    $scene | ConvertTo-Json -Depth 100 | Out-File -FilePath $out_path -Encoding utf8
    $count += 1
}

Write-Host "written $count scene files to $output_dir"