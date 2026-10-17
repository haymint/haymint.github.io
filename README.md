# HayMint — Đồ hay. Sống tiện.

Static recommendation site for GitHub Pages. Plain HTML, CSS and JavaScript only: no framework, no npm, no build step. All paths are relative, so it works on `haymint.github.io` and later on `haymint.com` / `haymint.vn` with no code changes.

## Install (replace everything)

1. In GitHub Desktop: **Repository > Show in Explorer**.
2. Delete everything in that folder **except the hidden `.git` folder**.
3. Extract this ZIP **into that folder**. `index.html` must sit directly in the repository folder, next to `assets`, `data`, `guides` and `tools`, not inside a subfolder.
4. Back in GitHub Desktop: type `Rebuild site` in **Summary**, click **Commit**, then **Push origin**.
5. Wait for the green tick on github.com > repository > **Actions**, then open https://haymint.github.io and press **Ctrl + F5**.

Edit `data/config.json` and set `facebookPageUrl` to your Page URL. Until then, Facebook buttons stay hidden.

**preview.html** shows the full design with sample products and videos, clearly marked as a preview. It is not linked from the site and is `noindex`. Delete it when you have real content.

## Add, publish, unpublish

PowerShell 7 or Windows PowerShell 5.1, run from the repository folder:

```powershell
# New Reel (draft by default; add -Status published when ready)
.\tools\New-HayMintItem.ps1 -Type video -Name "Gọn dây cáp với 1 hộp nhỏ" -Category desk -Subcategory quan-ly-day-cap -VideoUrl "https://www.facebook.com/reel/..." -Image "assets/img/videos/day-cap.jpg" -Duration "00:42"

# New product (leave -ShopeeUrl empty until your affiliate account is approved)
.\tools\New-HayMintItem.ps1 -Type product -Name "Hộp lưu trữ gấp gọn" -Category living -Subcategory luu-tru -Tags "phòng nhỏ","gấp gọn" -Description "Gợi ý sắp xếp đồ dùng gọn gàng." -Image "assets/img/products/hop-luu-tru.jpg"

# Publish / unpublish
.\tools\Set-HayMintStatus.ps1 -Type video -Id gon-day-cap-voi-1-hop-nho -Status published
.\tools\Set-HayMintStatus.ps1 -Type product -Id hop-luu-tru-gap-gon -Status draft

# Validate, rebuild sitemap, commit and push
.\tools\Publish-HayMint.ps1 -Message "Add video"
.\tools\Publish-HayMint.ps1 -ValidateOnly   # checks only, no git
```

If PowerShell blocks scripts, run once: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

**By hand:** copy an entry from `data/*.example.json` into `data/products.json`, `videos.json` or `guides.json`, fill it in and set `"status": "published"`. Only published items appear anywhere. Guides need `sections`: `[{"heading": "...", "paragraphs": ["...", "..."]}]`.

**Categories:** edit `data/taxonomy.json`. Add a category object with `slug`, `name`, `label`, `description`, optional `image` and a `subcategories` list of `{slug, label}`. Slugs are lowercase with hyphens. Nothing else needs changing.

## Rules built into the site

- No cart, prices, ratings, verdict badges or "tested" claims. The pill on each image is a subcategory tag link.
- "Xem trên Shopee" appears only when `shopeeUrl` is set, and uses `target="_blank" rel="sponsored nofollow noopener"`.
- The one-line affiliate note appears only on sections that show an affiliate link; the footer disclosure is always shown.
- Empty sections hide themselves. With no content, the homepage shows the hero, categories and an "updating" message.

## Images

- Use only your own photos and thumbnails: `assets/img/products/`, `assets/img/videos/`.
- Never download images from Shopee seller pages. Never use the Shopee logo.
- The hero, category photos and `assets/img/demo/` images are AI-generated. The hero is labelled on the page. Replace them with your own photos when you can.

## Custom domain later

1. Repository **Settings > Pages > Custom domain**: enter `haymint.com` and save (GitHub creates a `CNAME` file; pull it in GitHub Desktop).
2. At your DNS provider: four `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a `CNAME` for `www` → `haymint.github.io`.
3. When the certificate is ready, tick **Enforce HTTPS**.
4. Change `baseUrl` in `data/config.json` and run `Publish-HayMint.ps1`. No code changes: nothing hardcodes the github.io address except `baseUrl`, `robots.txt` and `sitemap.xml`, which the publish script regenerates.

## Before affiliate links

Do not create or publish affiliate links until your Shopee Affiliate account is approved. Register this website as a channel in the Shopee Affiliate dashboard before using it for affiliate links.
