# Melusina Hair — UV base pack (2026-09-22)

Pull this folder to your iPad to colour the hair.

## Files
- `Melusina_Hair_Handpaint_20260922.fbx` — the three hero hair strands
  (Melusina_HairA / Melusina_HairB / Melusina_HairC), rest pose, character
  scale (~1.9 units tall hair). Channel 0 UV = authored card layout.
- `maps/T_Melusina_<strand>_<Channel>.png` — tonight's Copernicus bakes,
  12 maps (BaseColor / Normal / Emission / Roughness per strand), made on the
  exact UV layout the FBX carries — they line up 1:1.

## Colour space (if your app asks)
- BaseColor, Emission: sRGB
- Normal, Roughness: linear (no sRGB)

## Desktop bonus
A Substance Painter project (`Melusina_Hair_CopernicusBakes.spp`) with these
maps pre-wired as base fill layers is being built into
`BS_GodFile/Exports/MelusinaSubstanceHandpaint_20260922/` — see
`README_HANDPAINT.md` there.
