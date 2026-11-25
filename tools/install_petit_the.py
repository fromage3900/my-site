#!/usr/bin/env python3
"""Install the reviewed Petit Thé zip without touching existing models."""
from pathlib import Path
from zipfile import ZipFile
import argparse
import struct
import hashlib
import tempfile
import shutil
ROOT = Path(__file__).resolve().parents[1]
NAMES = ("index.html", "scene-preview.png", "assets/cinnamon-roll.glb", "assets/teacup.glb")
def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("archive", type=Path)
    args = p.parse_args()
    dest = ROOT / "wix/petit-the"
    with ZipFile(args.archive) as z, tempfile.TemporaryDirectory() as td:
        stage = Path(td)
        for name in NAMES:
            candidates = [i for i in z.infolist() if i.filename == name or i.filename.endswith("/"+name)]
            if len(candidates) != 1: raise ValueError(f"Missing or ambiguous: {name}")
            item = candidates[0]
            if not 0 < item.file_size < 20_000_000: raise ValueError(f"Invalid file size: {name}")
            data = z.read(item)
            if name.endswith(".glb") and (len(data)<20 or data[:4]!=b"glTF" or struct.unpack_from("<II",data,4)!=(2,len(data))): raise ValueError(f"Invalid GLB: {name}")
            if name.endswith(".png") and data[:8]!=bytes.fromhex("89504e470d0a1a0a"): raise ValueError(f"Invalid PNG: {name}")
            if name == "index.html":
                html = data.decode("utf-8")
                if not all(s in html for s in ("GLTFLoader","./assets/cinnamon-roll.glb","./assets/teacup.glb","scene-preview.png")): raise ValueError("Wrong exhibit HTML")
                html = html.replace('<div id="overlay">','<div id="overlay">',1).replace('<div class="kicker">Object Atelier · prototype scene</div>', '<div class="kicker">Object Atelier · miniature exhibit</div><p><a href="../index.html#interactive-atelier">Portfolio</a> · <a href="../studio-3d-viewer.html">3D Studio</a></p>',1)
                data = html.encode("utf-8")
            target = stage / name
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_bytes(data)
            print(name, len(data), hashlib.sha256(data).hexdigest())
        if dest.exists(): raise FileExistsError(f"Refusing to overwrite {dest}")
        shutil.copytree(stage,dest)
    print("Installed. Run python tools/build_restored_website.py and review before committing wix/petit-the.")
if __name__ == "__main__":
    main()
