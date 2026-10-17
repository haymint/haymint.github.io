# Apply the reference-led design update

1. Make a backup or commit your current repository changes first.
2. Extract HayMint-Design-Update.zip outside the repository.
3. Copy the extracted contents into the existing repository root, merging folders and replacing matching files. Do not put them inside a second haymint folder. Do not delete or replace the .git folder.
4. This update contains NO data/ files, sitemap.xml, robots.txt or CNAME. Your content, taxonomy, Facebook URL, baseUrl and domain configuration remain untouched.
5. The update replaces the supplied HTML, CSS, JavaScript, publisher script and documentation, and adds the hero illustration and .gitattributes. If you customized these code files, review the diff before replacing them.
6. Existing content is still loaded from your existing JSON. Empty sections remain hidden. The full visual layout appears when you have published content. No fake products are added.
7. Optional category photos: add your own image files and an image property to each taxonomy entry. Without photos, category panels show icons. Never copy photos from the reference screenshot or seller pages.
8. The hero illustration is AI-generated and labeled. Product and Reel photos remain your own. Replace the hero with your own image if desired.
9. Run the included PowerShell smoke test before relying on the publisher, then Publish-HayMint.ps1 -ValidateOnly to refresh deployment-specific SEO. PowerShell runtime execution is not verified in this environment.
10. Review changes in GitHub Desktop. Put a message in the small Summary field, commit, then push. The new .gitattributes specifies line endings for future checkouts; it does not replace the required commit summary.

The layout follows the reference, not every pictured claim or feature: no login, no verdict badges, no ratings, no test/use claims, no Shopee logo, no working newsletter signup and no 2025 footer.
