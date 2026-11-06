# Neural Network 3D Lab

A Harness Web UI panel that opens deep convolutional and recurrent networks into
an interactive 3D scene and animates a forward pass through them.

Installed in the `desktop` profile as `@local/neural-network-3d-lab`; the sidebar
panel icon sits after `Transformer 3D Lab`. Entry point for the browser is
`client.js`, which registers itself with `window.__ModuleLoader__` and claims two
slots: `sidebar.panellist` (the icon) and `main` (the keyed panel, id
`neural-network-3d-lab`). `index.js` is an empty Host half: everything runs in
the browser.

## What it shows

- **Presets** — LeNet-5, AlexNet, VGG-16, ResNet-18, an MLP, and an LSTM
  unrolled across time. Shapes, parameters, MACs and receptive fields are derived
  from the layer list, so the numbers always match the picture.
- **Custom architectures** — "Edit as custom" turns the current preset into an
  editable layer list: add/remove conv, pooling, dense and recurrent layers and
  change kernel, stride, channels or units. The whole network is re-inferred, and
  layers that cannot follow (a kernel larger than the remaining map) are dropped
  with a note.
- **Real forward pass** — a 16×16 sample is convolved with a real kernel bank,
  pooled, flattened, and pushed through hashed dense weights to a softmax. Every
  bright cell is a computed number; the flow animation reveals layers one by one.
- **Interaction** — left-drag orbits, right-drag pans the whole scene, wheel
  zooms, click a layer to inspect it, double-click to fly to it, arrow keys step
  the pass, space runs it, `R` resets the view (pan included).

## Code map

| Section | Contents |
|---|---|
| 0 | Locale dictionaries (en/zh) and `t()` |
| 1 | Number formatting, hashing/noise, colour ramp |
| 2 | Presets, `inferArch()` (shapes, params, MACs, receptive field), edge builder |
| 3 | Toy inputs (7-segment digits, texture), kernel bank, `computeActivations()` |
| 4 | `buildScene()`: world placement, one plate per feature map, flow/skip/recurrent paths |
| 5 | `createLab3D()`: perspective projection, painter sorting, per-plate textures, picking, camera |
| 6 | Panel CSS (host theme tokens only; the viewport is artwork) |
| 7 | React components: `LabPage`, layer list, inspector, pass controls, custom editor |
| 8 | Plugin wiring: locale registration, slot registration |

Rendering is plain Canvas 2D: each feature map is painted once into a small
offscreen canvas and then drawn as a transformed quad, which keeps ~20 layers at
60 fps without a WebGL context or any third-party library.

## Development checks

`../nn3-lab-dev/test-internals.mjs` loads the Client factory outside the browser
(fake `window.__ModuleLoader__` + React stub), then asserts parameter counts
against the published architectures, checks that activation cells stay finite,
and that every preset builds a scene. Run it with the bundled Node:

```
node ../nn3-lab-dev/test-internals.mjs
node ../nn3-lab-dev/test-review-fixes.mjs
node --check client.js
```

`test-review-fixes.mjs` guards the layout invariants a code review caught: no two
layer slabs may intersect (the unrolled LSTM put its sequence node on top of the
first time step), every layer takes part in the flow, the scene order matches the
architecture order, and a spacing change must reuse the cached feature-map
textures instead of re-rasterising them.

