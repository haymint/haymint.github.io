<#
.SYNOPSIS
  Validate all data, regenerate sitemap.xml, then git add / commit / push.
.EXAMPLE
  .\tools\Publish-HayMint.ps1 -Message "Add video"
.EXAMPLE
  .\tools\Publish-HayMint.ps1 -ValidateOnly
#>
[CmdletBinding()]
param([string]$Message = 'Update HayMint content', [switch]$ValidateOnly)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Common.ps1')
try {
    Get-ChildItem -LiteralPath (Join-Path $script:Root 'data') -Filter *.json -Recurse | ForEach-Object { $null = Read-HmJson $_.FullName }
    Write-Output 'JSON: all files parse.'
    $config = Read-HmJson (Join-Path $script:Root 'data\config.json')
    Assert-HmHttps $config.baseUrl 'config.baseUrl' -Required
    $base = $config.baseUrl.TrimEnd('/') + '/'

    $tax = @(Read-HmItems (Join-Path $script:Root 'data\taxonomy.json'))
    foreach ($c in $tax) { if ($c.image) { Assert-HmImage $c.image "taxonomy image ($($c.slug))" } }

    $published = @{}
    foreach ($type in 'product','video','guide') {
        $key = if ($type -eq 'guide') { 'slug' } else { 'id' }
        $items = @(Read-HmItems (Get-HmDataPath $type)); $seen = @{}
        foreach ($it in $items) {
            $k = [string]$it.$key
            if ($seen.ContainsKey($k)) { throw "Duplicate $key '$k' in $type data." }; $seen[$k] = 1
            if ($it.status -cnotin 'draft','published') { throw "$type '$k': status must be draft or published." }
            Assert-HmTaxonomy $it.category $it.subcategory
            if ($type -eq 'product') { Assert-HmImage $it.image "product '$k' image" -Required:($it.status -eq 'published') }
            if ($type -eq 'video')   { Assert-HmImage $it.thumbnail "video '$k' thumbnail" -Required:($it.status -eq 'published') }
            if ($it.status -eq 'published') {
                if ($type -eq 'product' -and $it.shopeeUrl -and -not ([string]$it.shopeeUrl).StartsWith('https://')) { throw "Published product '$k' has a shopeeUrl that does not start with https://" }
                if ($type -eq 'video') { Assert-HmHttps $it.url "video '$k' url" -Required }
            }
        }
        $published[$type] = @($items | Where-Object { $_.status -eq 'published' })
    }
    Write-Output 'Data: taxonomy, images, links and status OK.'

    $urls = @('index.html','category.html','reels.html','guides/index.html','about.html','disclosure.html' | ForEach-Object { $base + $_ })
    foreach ($c in $tax) { if (@($published.product + $published.video + $published.guide | Where-Object { $_.category -eq $c.slug }).Count) { $urls += $base + 'category.html?cat=' + $c.slug } }
    foreach ($g in $published.guide) { $urls += $base + 'guides/guide.html?slug=' + [Uri]::EscapeDataString($g.slug) }
    $xml = "<?xml version=`"1.0`" encoding=`"UTF-8`"?>`n<urlset xmlns=`"http://www.sitemaps.org/schemas/sitemap/0.9`">`n"
    foreach ($u in $urls) { $xml += "  <url><loc>$([Security.SecurityElement]::Escape($u))</loc></url>`n" }
    $xml += "</urlset>`n"
    [IO.File]::WriteAllText((Join-Path $script:Root 'sitemap.xml'), $xml, $script:Utf8NoBom)
    [IO.File]::WriteAllText((Join-Path $script:Root 'robots.txt'), "User-agent: *`nAllow: /`nSitemap: ${base}sitemap.xml`n", $script:Utf8NoBom)
    Write-Output "Sitemap: $($urls.Count) URLs."

    if ($ValidateOnly) { Write-Output 'Validate-only: no git changes made.'; return }
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'git is not installed or not on PATH. Commit with GitHub Desktop instead.' }
    Push-Location $script:Root
    try {
        git add -A; if ($LASTEXITCODE) { throw 'git add failed.' }
        git diff --cached --quiet
        if ($LASTEXITCODE -eq 1) { git commit -m $Message; if ($LASTEXITCODE) { throw 'git commit failed.' } } else { Write-Output 'Nothing new to commit.' }
        git push; if ($LASTEXITCODE) { throw 'git push failed (check sign-in / remote).' }
        Write-Output 'Pushed. GitHub Pages updates in about 1 minute.'
    } finally { Pop-Location }
} catch { Write-Error "Publish-HayMint failed: $($_.Exception.Message)" -ErrorAction Stop }
