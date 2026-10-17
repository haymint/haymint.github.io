# Shared helpers for HayMint tools. ASCII-only source so Windows PowerShell 5.1 reads it correctly.
$ErrorActionPreference = 'Stop'
$script:Root = Split-Path -Parent $PSScriptRoot
$script:Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Read-HmJson([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path)) { throw "File not found: $Path" }
    try { return ConvertFrom-Json -InputObject ([IO.File]::ReadAllText($Path, [Text.Encoding]::UTF8)) -ErrorAction Stop }
    catch { throw "Invalid JSON in '$Path': $($_.Exception.Message)" }
}
function Read-HmItems([string]$Path) {
    $raw = [IO.File]::ReadAllText($Path, [Text.Encoding]::UTF8).Trim()
    if (-not $raw.StartsWith('[')) { throw "Expected a JSON array in: $Path" }
    if ($raw -eq '[]') { return @() }
    return @(Read-HmJson $Path)
}
function Write-HmJson([string]$Path, $Value) {
    $text = ConvertTo-Json -InputObject @($Value) -Depth 30
    if (@($Value).Count -eq 0) { $text = '[]' }
    [IO.File]::WriteAllText($Path, $text + "`n", $script:Utf8NoBom)
}
function Get-HmDataPath([string]$Type) {
    $map = @{ product = 'products'; video = 'videos'; guide = 'guides' }
    return Join-Path $script:Root ("data\" + $map[$Type] + '.json')
}
function Get-HmSlug([string]$Text) {
    $d = $Text.Normalize([Text.NormalizationForm]::FormD)
    $sb = New-Object Text.StringBuilder
    foreach ($ch in $d.ToCharArray()) {
        $cat = [Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch)
        if ($cat -eq [Globalization.UnicodeCategory]::NonSpacingMark) { continue }
        if ([int]$ch -eq 0x0111 -or [int]$ch -eq 0x0110) { [void]$sb.Append('d') } else { [void]$sb.Append($ch) }
    }
    $s = ($sb.ToString().ToLowerInvariant() -replace '[^a-z0-9]+', '-').Trim('-')
    if (-not $s) { throw 'Name must contain letters or numbers.' }
    return $s
}
function Assert-HmTaxonomy([string]$Category, [string]$Subcategory) {
    $tax = @(Read-HmItems (Join-Path $script:Root 'data\taxonomy.json'))
    $c = @($tax | Where-Object { $_.slug -ceq $Category })
    if ($c.Count -ne 1) { throw "Unknown category '$Category'. Valid: $(($tax.slug) -join ', ')" }
    if (@($c[0].subcategories | Where-Object { $_.slug -ceq $Subcategory }).Count -ne 1) {
        throw "Unknown subcategory '$Subcategory' for '$Category'. Valid: $(($c[0].subcategories.slug) -join ', ')"
    }
}
function Assert-HmHttps([string]$Value, [string]$Label, [switch]$Required) {
    if ([string]::IsNullOrWhiteSpace($Value)) { if ($Required) { throw "$Label is required." }; return }
    if (-not $Value.StartsWith('https://')) { throw "$Label must start with https:// (got '$Value')." }
}
function Assert-HmImage([string]$Value, [string]$Label, [switch]$Required) {
    if ([string]::IsNullOrWhiteSpace($Value)) { if ($Required) { throw "$Label is required for published items." }; return }
    if ($Value -notmatch '^assets/img/[A-Za-z0-9_./-]+\.(jpg|jpeg|png|webp|avif|gif)$' -or $Value.Contains('..')) {
        throw "$Label must be a relative path like assets/img/products/name.jpg (got '$Value')."
    }
    if (-not (Test-Path -LiteralPath (Join-Path $script:Root $Value) -PathType Leaf)) { throw "$Label file not found: $Value" }
}
