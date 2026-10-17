<#
.SYNOPSIS
  Add a product, video or guide to the HayMint data files. New items are drafts by default.
.EXAMPLE
  .\tools\New-HayMintItem.ps1 -Type video -Name "Gon day cap" -Category desk -Subcategory quan-ly-day-cap -VideoUrl "https://www.facebook.com/reel/123" -Image "assets/img/videos/day-cap.jpg" -Duration "00:42" -Status published
.EXAMPLE
  .\tools\New-HayMintItem.ps1 -Type product -Name "Hop luu tru" -Category living -Subcategory luu-tru -Description "Goi y sap xep do dung." -Image "assets/img/products/hop.jpg"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][ValidateSet('product','video','guide')][string]$Type,
    [Parameter(Mandatory)][string]$Name,
    [Parameter(Mandatory)][string]$Category,
    [Parameter(Mandatory)][string]$Subcategory,
    [string[]]$Tags = @(),
    [string]$ShopeeUrl = '',
    [string]$VideoUrl = '',
    [string]$Image = '',
    [string]$Description = '',
    [string]$Duration = '',
    [ValidateSet('draft','published')][string]$Status = 'draft'
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Common.ps1')
try {
    Assert-HmTaxonomy $Category $Subcategory
    if ($Tags.Count -gt 2) { throw 'Use at most 2 tags.' }
    Assert-HmHttps $ShopeeUrl 'ShopeeUrl'
    Assert-HmHttps $VideoUrl 'VideoUrl'
    if ($Status -eq 'published') {
        if ($Type -eq 'video') { Assert-HmHttps $VideoUrl 'VideoUrl' -Required }
        if ($Type -ne 'guide') { Assert-HmImage $Image 'Image' -Required } 
        if ($Type -ne 'video' -and -not $Description) { throw 'Description is required for published products and guides.' }
    } else { Assert-HmImage $Image 'Image' }

    $path = Get-HmDataPath $Type
    $items = @(Read-HmItems $path)
    $key = if ($Type -eq 'guide') { 'slug' } else { 'id' }
    $base = Get-HmSlug $Name; $id = $base; $n = 2
    while (@($items | Where-Object { $_.$key -eq $id }).Count) { $id = "$base-$n"; $n++ }
    $today = Get-Date -Format 'yyyy-MM-dd'

    switch ($Type) {
        'product' { $item = [ordered]@{ id=$id; name=$Name; category=$Category; subcategory=$Subcategory; tags=@($Tags); image=$Image; description=$Description; shopeeUrl=$ShopeeUrl; videoUrl=$VideoUrl; status=$Status; updatedAt=$today } }
        'video'   { $item = [ordered]@{ id=$id; title=$Name; duration=$Duration; thumbnail=$Image; url=$VideoUrl; category=$Category; subcategory=$Subcategory; tags=@($Tags); status=$Status; publishedAt=$today } }
        'guide'   { $item = [ordered]@{ slug=$id; title=$Name; intro=$Description; sections=@(); relatedProductIds=@(); category=$Category; subcategory=$Subcategory; tags=@($Tags); status=$Status; updatedAt=$today } }
    }
    Write-HmJson $path (@($items) + [pscustomobject]$item)
    Write-Output "Added $Type '$id' ($Status) to $(Split-Path $path -Leaf)."
} catch { Write-Error "New-HayMintItem failed: $($_.Exception.Message)" -ErrorAction Stop }
