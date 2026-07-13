# Processes raw product photos in src/assets/covers/raw into web-ready cover
# textures. Detects the book's bounding box (ignoring the thin ribbon tail),
# crops to the 3D face aspect (2.1 : 2.9, crop-to-fill centered), and resizes
# to 1014x1400. Works with transparent OR white photo backgrounds.
# Usage: powershell -File scripts/process-covers.ps1

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;

public static class CoverProcessor
{
    // Background = transparent OR near-white. Some photos are cutouts on
    // transparency, others sit on a white card, some are both (transparent
    // outer edge + white margin) — treat all of it as background.
    static bool IsBg(byte a, byte r, byte g, byte b)
    {
        return a < 60 || (r >= 244 && g >= 244 && b >= 244);
    }

    public static void Process(string inPath, string outPath, double targetAspect, int outHeight)
    {
        using (var src = new Bitmap(inPath))
        using (var bmp = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb))
        {
            using (var g0 = Graphics.FromImage(bmp)) g0.DrawImage(src, 0, 0, src.Width, src.Height);

            int wpx = bmp.Width, hpx = bmp.Height;
            var data = bmp.LockBits(new Rectangle(0, 0, wpx, hpx), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            int stride = data.Stride;
            byte[] px = new byte[stride * hpx];
            System.Runtime.InteropServices.Marshal.Copy(data.Scan0, px, 0, px.Length);
            bmp.UnlockBits(data);

            // Per-row book coverage.
            int[] rowCount = new int[hpx];
            for (int y = 0; y < hpx; y++)
            {
                int c = 0, off = y * stride;
                for (int x = 0; x < wpx; x++)
                {
                    int i = off + x * 4;
                    if (!IsBg(px[i + 3], px[i + 2], px[i + 1], px[i])) c++;
                }
                rowCount[y] = c;
            }
            int maxRow = 0;
            foreach (int c in rowCount) if (c > maxRow) maxRow = c;
            int rowMin = (int)(maxRow * 0.5);
            int top = -1, bottom = -1;
            for (int y = 0; y < hpx; y++) if (rowCount[y] >= rowMin) { if (top < 0) top = y; bottom = y; }

            // Per-column coverage within the book rows (ribbon rows are excluded).
            int[] colCount = new int[wpx];
            for (int x = 0; x < wpx; x++)
            {
                int c = 0;
                for (int y = top; y <= bottom; y++)
                {
                    int i = y * stride + x * 4;
                    if (!IsBg(px[i + 3], px[i + 2], px[i + 1], px[i])) c++;
                }
                colCount[x] = c;
            }
            int maxCol = 0;
            foreach (int c in colCount) if (c > maxCol) maxCol = c;
            int colMin = (int)(maxCol * 0.5);
            int left = -1, right = -1;
            for (int x = 0; x < wpx; x++) if (colCount[x] >= colMin) { if (left < 0) left = x; right = x; }

            // Inset to kill anti-aliased fringe at the cut edge.
            const int inset = 5;
            left += inset; right -= inset; top += inset; bottom -= inset;

            int cw = right - left + 1, ch = bottom - top + 1;

            // Crop-to-fill, centered, to the target face aspect.
            double aspect = (double)cw / ch;
            if (aspect > targetAspect)
            {
                int nw = (int)Math.Round(ch * targetAspect);
                left += (cw - nw) / 2; cw = nw;
            }
            else
            {
                int nh = (int)Math.Round(cw / targetAspect);
                top += (ch - nh) / 2; ch = nh;
            }

            int outW = (int)Math.Round(outHeight * targetAspect);
            using (var outBmp = new Bitmap(outW, outHeight, PixelFormat.Format32bppArgb))
            {
                using (var g = Graphics.FromImage(outBmp))
                {
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.CompositingQuality = CompositingQuality.HighQuality;
                    g.DrawImage(bmp, new Rectangle(0, 0, outW, outHeight),
                        new Rectangle(left, top, cw, ch), GraphicsUnit.Pixel);
                }
                outBmp.Save(outPath, ImageFormat.Png);
            }
            Console.WriteLine(string.Format("{0} -> {1}x{2} (crop {3},{4} {5}x{6})",
                System.IO.Path.GetFileName(inPath), outW, outHeight, left, top, cw, ch));
        }
    }
}
"@

$root = Split-Path -Parent $PSScriptRoot
$rawDir = Join-Path $root "src\assets\covers\raw"
$outDir = Join-Path $root "src\assets\covers"
$aspect = 2.1 / 2.9   # NB.W / NB.H in src/components/three/Notebook.tsx

Get-ChildItem (Join-Path $rawDir "*.png") | ForEach-Object {
    [CoverProcessor]::Process($_.FullName, (Join-Path $outDir $_.Name), $aspect, 1400)
}
