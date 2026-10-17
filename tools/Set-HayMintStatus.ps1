<#
.SYNOPSIS
  Publish or unpublish one item.
.EXAMPLE
  .\tools\Set-HayMintStatus.ps1 -Type video -Id gon-day-cap -Status published
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][ValidateSet('product','video','guide')][string]$Type,
    [Parameter(Mandatory)][string]$Id,
    [Parameter(Mandatory)][ValidateSet('draft','published')][string]$Status
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Common.ps1')
try {
    $path = Get-HmDataPath $Type
    $items = @(Read-HmItems $path)
    $key = if ($Type -eq 'guide') { 'slug' } else { 'id' }
    $hit = @($items | Where-Object { $_.$key -ceq $Id })
    if ($hit.Count -ne 1) { throw "No $Type with $key '$Id'. Existing: $(($items.$key) -join ', ')" }
    $it = $hit[0]
    if ($Status -eq 'published') {
        Assert-HmTaxonomy $it.category $it.subcategory
        if ($Type -eq 'product') { Assert-HmImage $it.image 'image' -Required; Assert-HmHttps $it.shopeeUrl 'shopeeUrl' }
        if ($Type -eq 'video')   { Assert-HmImage $it.thumbnail 'thumbnail' -Required; Assert-HmHttps $it.url 'url' -Required }
        if ($Type -eq 'guide' -and @($it.sections).Count -eq 0) { throw 'Guide needs at least one section before publishing.' }
    }
    $it.status = $Status
    if ($Type -ne 'video') { $it.updatedAt = Get-Date -Format 'yyyy-MM-dd' }
    Write-HmJson $path $items
    Write-Output "'$Id' is now $Status."
} catch { Write-Error "Set-HayMintStatus failed: $($_.Exception.Message)" -ErrorAction Stop }
