#!/usr/bin/env python3
"""Desktop browser smoke for the *site-wide* original Three.js celestial brush.

The static HTML screenshots do not move a pointer. This test does.
Requires playwright package; launches the runner's already-installed Chrome.
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:4173/_recruiter_release/wix/index.html"

def main():
    chrome = sys.argv[1] if len(sys.argv)>1 else "/usr/bin/chromium"
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True, executable_path=chrome,
            args=["--no-sandbox", "--disable-dev-shm-usage",
                  "--use-gl=angle", "--use-angle=swiftshader",
                  "--enable-unsafe-swiftshader"])
        context = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
        page = context.new_page()
        page.goto(BASE, wait_until="domcontentloaded")
        page.mouse.move(520, 450)
        page.wait_for_timeout(1700)
        frame = page.locator('iframe[data-celestial-sitewide="true"]')
        assert frame.count()==1, "The sitewide pointer did not mount original Three.js brush"
        original = frame.content_frame
        original.locator("#c").wait_for(state="attached",timeout=25000)
        for i in range(24):
            page.mouse.move(530+i*13, 420+(i%7)*10)
        page.wait_for_timeout(1300)
        canvas = original.locator("#c")
        value = canvas.evaluate("""el => ({
           width:el.width, height:el.height,
           transparent:getComputedStyle(document.body).backgroundColor,
           webgl:!!(el.getContext('webgl')||el.getContext('experimental-webgl'))
        })""")
        assert value["width"] > 100 and value["height"] > 100, f"Invalid celestial canvas: {value}"
        assert value["webgl"], f"Original Three.js failed to initialize a WebGL context: {value}"
        assert value["transparent"] in ("rgba(0, 0, 0, 0)","transparent"), f"Brush background is opaque: {value}"
        assert frame.evaluate("el => getComputedStyle(el).pointerEvents")=="none", "Overlay captures recruiter clicks"
        Path("visual-qa").mkdir(exist_ok=True)
        page.screenshot(path="visual-qa/celestial-sitewide-hover.png",full_page=False)
        context.close()
        reduced = browser.new_context(viewport={"width":1440,"height":900},reduced_motion="reduce")
        page2 = reduced.new_page()
        page2.goto(BASE,wait_until="domcontentloaded")
        page2.mouse.move(600,450)
        page2.wait_for_timeout(400)
        assert page2.locator('iframe[data-celestial-sitewide="true"]').count()==0, "Reduced-motion guard lost"
        reduced.close()
        browser.close()
    print("OK sitewide original Three.js brush: pointer interaction, transparent WebGL, pass-through clicks, reduced motion.")

if __name__ == "__main__":
    main()
