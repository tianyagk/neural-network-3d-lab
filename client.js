/**
 * Neural Network 3D Lab — Client half.
 *
 * The whole lab is one Web panel: a deep convolution / recurrence network is
 * laid out in space (one cuboid of feature maps per layer, channels receding
 * along the flow axis, recurrent cells unrolled along time), a real forward
 * pass runs behind every pixel of the activation heat, and the user can orbit,
 * zoom, click any layer, edit the architecture and replay the data flow.
 *
 * The scene is projected by hand and painted with the 2D canvas API: no WebGL,
 * no 3D library, no external assets.
 */
window.__ModuleLoader__.load({
  id: '@local/neural-network-3d-lab',
  factory(require) {
    'use strict';

    const React = require('react');
    const h = React.createElement;

    const NS = 'neuralnet3d';
    const PANEL_ID = 'neural-network-3d-lab';

    /* =====================================================================
     * 0. Locale
     * ===================================================================*/

    const DICT_EN = {
      'app.title': 'Neural Network 3D Lab',
      'app.subCnn': 'Every layer as a cuboid of feature maps, from pixels to a decision',
      'app.subRnn': 'One cell, unrolled across time steps',
      'app.subMlp': 'Fully connected layers, from pixels to a decision',
      'mode.flow': 'Flow',
      'mode.focus': 'Focus',
      'arch.title': 'Architecture',
      'arch.preset': 'Network preset',
      'arch.custom': 'Custom',
      'arch.edit': 'Edit as custom',
      'arch.reset': 'Reset to preset',
      'layer.title': 'Layers',
      'layer.passed': 'passed',
      'pass.title': 'Forward pass',
      'pass.input': 'Input sample',
      'pass.play': 'Run forward pass',
      'pass.pause': 'Pause',
      'pass.stepFwd': 'Next layer',
      'pass.stepBack': 'Previous layer',
      'pass.reset': 'Back to input',
      'pass.idle': 'Not started',
      'pass.done': 'Output reached',
      'pass.at': '{n}/{total} · {name}',
      'pass.depth': 'Wavefront',
      'pass.realtime': 'Live feature maps',
      'insp.title': 'Inspector',
      'insp.empty': 'Click any layer in the scene to read its shape, cost and role.',
      'insp.kind': 'Type',
      'insp.shape': 'Output shape',
      'insp.params': 'Parameters',
      'insp.macs': 'MACs',
      'insp.rf': 'Receptive field',
      'insp.kernel': 'Kernel · stride',
      'insp.share': 'Share of parameters',
      'insp.note': 'Role',
      'insp.act': 'Feature maps',
      'insp.pred': 'Prediction',
      'pred.none': 'No output layer yet — add one in the custom editor.',
      'insp.channel': 'channel {n}',
      'insp.topk': 'Strongest activations',
      'insp.time': 'Time step',
      'insp.step': 't = {t}',
      'disp.title': 'Display',
      'disp.labels': 'Layer labels',
      'disp.heat': 'Feature maps',
      'disp.links': 'Connections',
      'disp.rotate': 'Auto rotate',
      'disp.spacing': 'Layer spacing',
      'disp.channels': 'Channels shown',
      'legend.title': 'What you are looking at',
      'legend.input': 'input pixels, nothing learned yet',
      'legend.conv': 'convolution: one map answers one question',
      'legend.pool': 'pooling: same feature, coarser position',
      'legend.fc': 'dense: global evidence, layout gone',
      'legend.rnn': 'recurrent: one cell reused over time',
      'legend.skip': 'skip / residual connection',
      'legend.recur': 'hidden state carried to the next step',
      'legend.flow': 'data flow, input → output',
      'legend.heat': 'bright cells = strong activation',
      'stat.params': 'Parameters',
      'stat.macs': 'MACs / inference',
      'stat.depth': 'Weight layers',
      'stat.rf': 'Receptive field',
      'stat.width': 'Widest layer',
      'hint.bar': 'drag · orbit    right-drag · pan    scroll · zoom    ← → · layers    space · run    R · reset view',
      'hint.drag': 'Drag to orbit · Right-drag to pan · Wheel to zoom · Click a layer to inspect',
      'btn.iso': 'Isometric',
      'btn.front': 'Front',
      'btn.top': 'Top',
      'btn.side': 'Side',
      'btn.resetView': 'Reset view',
      'kind.input': 'Input',
      'kind.conv': 'Convolution',
      'kind.pool': 'Pooling',
      'kind.fc': 'Dense',
      'kind.rnn': 'Recurrent',
      'kind.out': 'Output',
      'note.input': 'Raw values enter the network here. Nothing has been learned yet.',
      'note.conv': 'Each kernel slides over the input, so every map answers one question: where are vertical edges, which way does the gradient fall.',
      'note.pool': 'Pooling halves the map. The feature survives, its exact position stops mattering.',
      'note.fc': 'Every position is flattened into one vector: the spatial layout is gone and only global evidence is left.',
      'note.rnn': 'The same weights are reused at every time step; the hidden state carries what has been read so far.',
      'note.out': 'A softmax over the classes turns the last features into a probability distribution.',
      'note.skip': 'A shortcut adds earlier features to later ones, so detail and gradients survive depth.',
      'f.input': 'x = pixels',
      'f.conv': 'y = ReLU( W ⊛ x + b )',
      'f.pool': 'y = max over k×k window',
      'f.fc': 'y = ReLU( W x + b )',
      'f.rnn': 'hₜ = tanh( Wₓxₜ + W_hhₜ₋₁ + b )',
      'f.out': 'p = softmax( W h + b )',
      'custom.title': 'Custom architecture',
      'custom.hint': 'Edit any value: shapes, parameters and MACs are recomputed for the whole network immediately.',
      'custom.add': 'Add layer',
      'custom.addConv': 'Conv',
      'custom.addPool': 'Pool',
      'custom.addFc': 'Dense',
      'custom.addRnn': 'LSTM',
      'custom.remove': 'Remove this layer',
      'custom.out': 'out',
      'custom.ch': 'ch',
      'custom.k': 'k',
      'custom.s': 's',
      'custom.units': 'units',
      'custom.limit': 'A conv or pool layer needs a feature map of at least 3×3; that layer was dropped.',
      'custom.empty': 'The network is empty. Add a layer.',
      'preset.lenet': 'LeNet-5 · the 1998 digit classifier',
      'preset.alexnet': 'AlexNet · the 2012 ImageNet breakthrough',
      'preset.vgg16': 'VGG-16 · depth with plain 3×3 stacks',
      'preset.resnet18': 'ResNet-18 · residual shortcuts',
      'preset.mlp': 'MLP · a fully connected baseline',
      'preset.lstm': 'LSTM · unrolled across time',
      'sample.digit': 'Digit “{d}”',
      'sample.chars': 'Text “{w}”',
      'sample.grid': 'Gradient grid',
      'sample.noise': 'Texture',
      'cls.pos': 'next char',
    };

    const DICT_ZH = {
      'app.title': 'Neural Network 3D Lab',
      'app.subCnn': '每一层都是一个特征图立方体，从像素走到判断',
      'app.subRnn': '同一个循环单元，沿时间步展开',
      'app.subMlp': '全连接层堆叠，从像素走到判断',
      'mode.flow': '数据流',
      'mode.focus': '单层',
      'arch.title': '网络结构',
      'arch.preset': '网络预设',
      'arch.custom': '自定义',
      'arch.edit': '改为自定义编辑',
      'arch.reset': '恢复预设',
      'layer.title': '层',
      'layer.passed': '已通过',
      'pass.title': '前向传播',
      'pass.input': '输入样本',
      'pass.play': '运行前向传播',
      'pass.pause': '暂停',
      'pass.stepFwd': '下一层',
      'pass.stepBack': '上一层',
      'pass.reset': '回到输入',
      'pass.idle': '尚未开始',
      'pass.done': '已到达输出',
      'pass.at': '{n}/{total} · {name}',
      'pass.depth': '波前',
      'pass.realtime': '实时特征图',
      'insp.title': '检查器',
      'insp.empty': '在场景中点击任意一层，读取它的形状、开销与作用。',
      'insp.kind': '类型',
      'insp.shape': '输出形状',
      'insp.params': '参数量',
      'insp.macs': '乘加数',
      'insp.rf': '感受野',
      'insp.kernel': '卷积核 · 步长',
      'insp.share': '参数占比',
      'insp.note': '作用',
      'insp.act': '特征图',
      'insp.pred': '预测',
      'pred.none': '还没有输出层 —— 在自定义编辑里添加一层。',
      'insp.channel': '通道 {n}',
      'insp.topk': '最强激活',
      'insp.time': '时间步',
      'insp.step': 't = {t}',
      'disp.title': '显示',
      'disp.labels': '层标签',
      'disp.heat': '特征图',
      'disp.links': '连接',
      'disp.rotate': '自动旋转',
      'disp.spacing': '层间距',
      'disp.channels': '显示通道数',
      'legend.title': '你在看什么',
      'legend.input': '输入像素，尚未学到任何东西',
      'legend.conv': '卷积：一张图回答一个问题',
      'legend.pool': '池化：特征还在，位置变粗',
      'legend.fc': '全连接：只剩全局证据，空间结构消失',
      'legend.rnn': '循环：同一个单元在时间上重复使用',
      'legend.skip': '跳跃 / 残差连接',
      'legend.recur': '隐状态传递到下一步',
      'legend.flow': '数据流，输入 → 输出',
      'legend.heat': '越亮表示激活越强',
      'stat.params': '参数量',
      'stat.macs': '每次推理乘加数',
      'stat.depth': '权重层',
      'stat.rf': '感受野',
      'stat.width': '最宽层',
      'hint.bar': '左键拖动 · 旋转    右键拖动 · 平移    滚轮 · 缩放    ← → · 切换层    空格 · 运行    R · 重置视角',
      'hint.drag': '左键拖动旋转 · 右键拖动平移 · 滚轮缩放 · 点击层查看细节',
      'btn.iso': '等轴',
      'btn.front': '正面',
      'btn.top': '俯视',
      'btn.side': '侧面',
      'btn.resetView': '重置视角',
      'kind.input': '输入',
      'kind.conv': '卷积',
      'kind.pool': '池化',
      'kind.fc': '全连接',
      'kind.rnn': '循环',
      'kind.out': '输出',
      'note.input': '原始数值从这里进入网络，此时还没有学到任何东西。',
      'note.conv': '每个卷积核在输入上滑动，所以每张特征图只回答一个问题：哪里有竖直边缘、梯度朝哪个方向。',
      'note.pool': '池化把特征图减半：特征保留下来，具体位置变得不再重要。',
      'note.fc': '所有位置被展平成一个向量：空间结构消失，只剩全局证据。',
      'note.rnn': '同一组权重在每个时间步复用，隐状态携带“到目前为止读到的东西”。',
      'note.out': '对各类别的 softmax 把最后的特征变成概率分布。',
      'note.skip': '捷径把较浅层的特征加到较深层，让细节与梯度穿过深度。',
      'f.input': 'x = 像素',
      'f.conv': 'y = ReLU( W ⊛ x + b )',
      'f.pool': 'y = k×k 窗口取最大',
      'f.fc': 'y = ReLU( W x + b )',
      'f.rnn': 'hₜ = tanh( Wₓxₜ + W_hhₜ₋₁ + b )',
      'f.out': 'p = softmax( W h + b )',
      'custom.title': '自定义结构',
      'custom.hint': '任意修改数值：整网的形状、参数量与乘加数会立即重算。',
      'custom.add': '添加层',
      'custom.addConv': '卷积',
      'custom.addPool': '池化',
      'custom.addFc': '全连接',
      'custom.addRnn': 'LSTM',
      'custom.remove': '删除这一层',
      'custom.out': '输出',
      'custom.ch': '通道',
      'custom.k': '核',
      'custom.s': '步长',
      'custom.units': '单元',
      'custom.limit': '卷积或池化层需要至少 3×3 的特征图，该层已被忽略。',
      'custom.empty': '网络为空，请添加一层。',
      'preset.lenet': 'LeNet-5 · 1998 年的手写数字分类器',
      'preset.alexnet': 'AlexNet · 2012 年 ImageNet 突破',
      'preset.vgg16': 'VGG-16 · 用 3×3 堆出深度',
      'preset.resnet18': 'ResNet-18 · 残差捷径',
      'preset.mlp': 'MLP · 全连接基线',
      'preset.lstm': 'LSTM · 沿时间展开',
      'sample.digit': '数字 “{d}”',
      'sample.chars': '文本 “{w}”',
      'sample.grid': '渐变网格',
      'sample.noise': '纹理',
      'cls.pos': '下一个字符',
    };

    let localeFace = null;
    let boundTranslate = null;
    let hostCtx = null;

    /** The locale service can register after this plugin: resolve it on demand. */
    function ensureLocale() {
      if (localeFace || !hostCtx) return;
      try {
        const loc = hostCtx.get('locale');
        if (!loc) return;
        localeFace = loc;
        if (!boundTranslate && typeof loc.bind === 'function') {
          try { boundTranslate = loc.bind(NS); } catch (e) { boundTranslate = null; }
        }
      } catch (e) { /* not registered yet */ }
    }

    function activeIsZh() {
      try {
        if (!localeFace) return false;
        const snap = localeFace.getLocale();
        const id = snap && snap.active ? String(snap.active).toLowerCase() : '';
        return id.indexOf('zh') === 0;
      } catch (e) {
        return false;
      }
    }

    function t(key, vars) {
      ensureLocale();
      let text = null;
      if (boundTranslate) {
        try {
          const v = boundTranslate(key);
          if (typeof v === 'string' && v && v !== key) text = v;
        } catch (e) { /* fall back to the local dictionary */ }
      }
      if (!text) {
        const zh = activeIsZh();
        text = zh && DICT_ZH[key] != null ? DICT_ZH[key] : DICT_EN[key] != null ? DICT_EN[key] : key;
      }
      if (vars && text.indexOf('{') >= 0) {
        text = text.replace(/\{(\w+)\}/g, function (m, k) {
          return vars[k] == null ? m : String(vars[k]);
        });
      }
      return text;
    }

    function useLocaleTick() {
      const pair = React.useState(0);
      const bump = pair[1];
      React.useEffect(function () {
        ensureLocale();
        if (!localeFace || typeof localeFace.subscribe !== 'function') return undefined;
        return localeFace.subscribe(function () { bump(function (v) { return v + 1; }); });
      }, []);
      return pair[0];
    }

    /* =====================================================================
     * 1. Small utilities, colour ramp, deterministic noise
     * ===================================================================*/

    function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
    function lerp(a, b, k) { return a + (b - a) * k; }

    /** 1234567 → "1.23M" — the scale people actually read in a network diagram. */
    function fmtCount(v) {
      const n = Number(v) || 0;
      if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
      if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
      if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
      return String(Math.round(n));
    }

    function fmtShape(node) {
      if (!node) return '';
      if (node.kind === 'fc' || node.kind === 'out' || node.kind === 'rnn') return String(node.cOut);
      if (node.kind === 'input') return node.cIn + '×' + node.hIn + '×' + node.wIn;
      return node.cOut + '×' + node.hOut + '×' + node.wOut;
    }

    /** 32-bit string hash — every "random" weight in this lab comes from here. */
    function hash32(str) {
      let x = 2166136261;
      for (let i = 0; i < str.length; i += 1) {
        x ^= str.charCodeAt(i);
        x = Math.imul(x, 16777619);
      }
      return x >>> 0;
    }

    function unitNoise(seed) {
      let x = seed >>> 0;
      x ^= x << 13; x >>>= 0;
      x ^= x >>> 17;
      x ^= x << 5; x >>>= 0;
      return x / 4294967296;
    }

    /** Stable pseudo-random in [0,1) for a (name, i, j) triple. */
    function noise3(name, i, j) {
      return unitNoise(hash32(name + '|' + i + '|' + j));
    }

    /** 16-step ramp: deep navy → blue → teal → amber → hot. */
    const PALETTE = [
      '#0a1330', '#0d1b45', '#11265c', '#163274',
      '#1c438c', '#2456a4', '#2f6fba', '#3a8cc7',
      '#46a6c6', '#5cbfb6', '#8ad2a4', '#c2dd8c',
      '#eddf85', '#f7c167', '#f79a52', '#ff7043',
    ];

    function palIndex(v) {
      const n = PALETTE.length - 1;
      return clamp(Math.round(clamp(v, 0, 1) * n), 0, n);
    }

    function palColor(v) {
      return PALETTE[palIndex(v)];
    }

    const KIND_COLOR = {
      input: '#7fd1ae',
      conv: '#6f9dff',
      pool: '#3fbfae',
      fc: '#b98cff',
      rnn: '#ffa15c',
      out: '#ffd166',
    };

    function kindColor(kind) { return KIND_COLOR[kind] || '#8aa0c8'; }

    /* =====================================================================
     * 2. Architectures: presets, shape inference, cost model
     * ===================================================================*/

    function convOut(size, k, s, p) { return Math.floor((size + 2 * p - k) / s) + 1; }

    /** The classic ImageNet / MNIST / language-model architectures. */
    const PRESETS = [
      {
        id: 'lenet',
        label: 'LeNet-5',
        family: 'cnn',
        input: { c: 1, h: 32, w: 32 },
        sample: 'digit3',
        layers: [
          { kind: 'conv', name: 'conv1', out: 6, k: 5, s: 1, p: 0 },
          { kind: 'pool', name: 'pool1', k: 2, s: 2 },
          { kind: 'conv', name: 'conv2', out: 16, k: 5, s: 1, p: 0 },
          { kind: 'pool', name: 'pool2', k: 2, s: 2 },
          { kind: 'fc', name: 'fc1', units: 120 },
          { kind: 'fc', name: 'fc2', units: 84 },
          { kind: 'out', name: 'fc3', units: 10 },
        ],
      },
      {
        id: 'alexnet',
        label: 'AlexNet',
        family: 'cnn',
        input: { c: 3, h: 224, w: 224 },
        sample: 'digit8',
        layers: [
          { kind: 'conv', name: 'conv1', out: 64, k: 11, s: 4, p: 0 },
          { kind: 'pool', name: 'pool1', k: 3, s: 2 },
          { kind: 'conv', name: 'conv2', out: 192, k: 5, s: 1, p: 2 },
          { kind: 'pool', name: 'pool2', k: 3, s: 2 },
          { kind: 'conv', name: 'conv3', out: 384, k: 3, s: 1 },
          { kind: 'conv', name: 'conv4', out: 256, k: 3, s: 1 },
          { kind: 'conv', name: 'conv5', out: 256, k: 3, s: 1 },
          { kind: 'pool', name: 'pool5', k: 3, s: 2 },
          { kind: 'fc', name: 'fc6', units: 4096 },
          { kind: 'fc', name: 'fc7', units: 4096 },
          { kind: 'out', name: 'fc8', units: 1000 },
        ],
      },
      {
        id: 'vgg16',
        label: 'VGG-16',
        family: 'cnn',
        input: { c: 3, h: 224, w: 224 },
        sample: 'digit3',
        layers: [
          { kind: 'conv', name: 'conv1_1', out: 64, k: 3 },
          { kind: 'conv', name: 'conv1_2', out: 64, k: 3 },
          { kind: 'pool', name: 'pool1', k: 2, s: 2 },
          { kind: 'conv', name: 'conv2_1', out: 128, k: 3 },
          { kind: 'conv', name: 'conv2_2', out: 128, k: 3 },
          { kind: 'pool', name: 'pool2', k: 2, s: 2 },
          { kind: 'conv', name: 'conv3_1', out: 256, k: 3 },
          { kind: 'conv', name: 'conv3_2', out: 256, k: 3 },
          { kind: 'conv', name: 'conv3_3', out: 256, k: 3 },
          { kind: 'pool', name: 'pool3', k: 2, s: 2 },
          { kind: 'conv', name: 'conv4_1', out: 512, k: 3 },
          { kind: 'conv', name: 'conv4_2', out: 512, k: 3 },
          { kind: 'conv', name: 'conv4_3', out: 512, k: 3 },
          { kind: 'pool', name: 'pool4', k: 2, s: 2 },
          { kind: 'conv', name: 'conv5_1', out: 512, k: 3 },
          { kind: 'conv', name: 'conv5_2', out: 512, k: 3 },
          { kind: 'conv', name: 'conv5_3', out: 512, k: 3 },
          { kind: 'pool', name: 'pool5', k: 2, s: 2 },
          { kind: 'fc', name: 'fc6', units: 4096 },
          { kind: 'fc', name: 'fc7', units: 4096 },
          { kind: 'out', name: 'fc8', units: 1000 },
        ],
      },
      {
        id: 'resnet18',
        label: 'ResNet-18',
        family: 'cnn',
        input: { c: 3, h: 224, w: 224 },
        sample: 'digit7',
        build: function () { return resnet18Layers(); },
      },
      {
        id: 'mlp',
        label: 'MLP · MNIST',
        family: 'mlp',
        input: { c: 1, h: 28, w: 28 },
        sample: 'digit5',
        layers: [
          { kind: 'fc', name: 'fc1', units: 256 },
          { kind: 'fc', name: 'fc2', units: 128 },
          { kind: 'out', name: 'fc3', units: 10 },
        ],
      },
      {
        id: 'lstm',
        label: 'LSTM · unrolled',
        family: 'rnn',
        input: { c: 6, h: 1, w: 1 },
        sample: 'chars',
        steps: 6,
        hidden: 32,
        vocab: ['d', 'e', 'p', 'n', 'u', 'r', 'a', 'l'],
        build: function () { return lstmLayers(6, 32); },
      },
    ];

    /** ResNet-18: a stem, four stages of two basic blocks, a classifier. */
    function resnet18Layers() {
      const layers = [
        { kind: 'conv', name: 'conv1', out: 64, k: 7, s: 2 },
        { kind: 'pool', name: 'maxpool', k: 3, s: 2 },
      ];
      const stages = [[64, 1], [128, 2], [256, 2], [512, 2]];
      stages.forEach(function (stage, si) {
        const ch = stage[0];
        const stride = si === 0 ? 1 : 2;
        for (let b = 0; b < 2; b += 1) {
          const first = b === 0 ? stride : 1;
          layers.push({ kind: 'conv', name: 's' + (si + 1) + '_' + (b + 1) + '_a', out: ch, k: 3, s: first });
          layers.push({ kind: 'conv', name: 's' + (si + 1) + '_' + (b + 1) + '_b', out: ch, k: 3, s: 1 });
        }
      });
      layers.push({ kind: 'pool', name: 'avgpool', k: 7, s: 7 });
      layers.push({ kind: 'out', name: 'fc', units: 1000 });
      return layers;
    }

    /** The recurrent preset: one LSTM stack unrolled over `steps` time steps. */
    function lstmLayers(steps, hidden) {
      const layers = [];
      const per = 2;
      for (let s = 0; s < steps; s += 1) {
        layers.push({ kind: 'input', name: 'x' + (s + 1), step: s, silent: true });
        for (let l = 0; l < per; l += 1) {
          layers.push({ kind: 'rnn', name: 'lstm' + (l + 1), units: hidden, step: s, layer: l });
        }
        if (s === steps - 1) layers.push({ kind: 'out', name: 'softmax', units: 8, step: s });
      }
      return layers;
    }

    /**
     * Turn a preset (or an edited copy of one) into the node list the scene
     * draws. Shapes, parameters, MACs, receptive fields and the edges all come
     * out of this one pass, so the inspector never disagrees with the picture.
     */
    function inferArch(spec) {
      const src = spec && spec.layers ? spec.layers : [];
      const input = (spec && spec.input) || { c: 1, h: 28, w: 28 };
      let cIn = input.c;
      let hIn = input.h;
      let wIn = input.w;

      const nodes = [{
        index: 0,
        id: 'n0',
        kind: 'input',
        name: 'input',
        cIn: input.c,
        hIn: input.h,
        wIn: input.w,
        cOut: input.c,
        hOut: input.h,
        wOut: input.w,
        params: 0,
        macs: 0,
        rf: 1,
        step: null,
      }];

      let rf = 1;
      let params = 0;
      let macs = 0;
      let dropped = 0;

      src.forEach(function (L, idx) {
        const kind = L.kind || 'conv';
        const step = L.step == null ? null : L.step;
        const layerNo = L.layer == null ? null : L.layer;

        if (kind === 'input') {
          nodes.push({
            index: nodes.length, id: 'n' + nodes.length, kind: 'input', name: L.name || 'x',
            cIn: input.c, hIn: 1, wIn: 1, cOut: input.c, hOut: 1, wOut: 1,
            params: 0, macs: 0, rf: 1, step: step, layer: layerNo, silent: true,
          });
          return;
        }

        const node = {
          index: nodes.length,
          id: 'n' + nodes.length,
          kind: kind,
          name: L.name || (kind + (idx + 1)),
          cIn: cIn,
          hIn: hIn,
          wIn: wIn,
          cOut: cIn,
          hOut: hIn,
          wOut: wIn,
          params: 0,
          macs: 0,
          rf: rf,
          step: step,
          layer: layerNo,
        };

        if (kind === 'conv') {
          const k = Math.max(1, Math.round(L.k || 3));
          const s = Math.max(1, Math.round(L.s || 1));
          const p = L.p == null ? Math.floor((k - 1) / 2) : Math.max(0, Math.round(L.p));
          const oh = convOut(hIn, k, s, p);
          const ow = convOut(wIn, k, s, p);
          if (oh < 1 || ow < 1) { dropped += 1; return; }
          const out = Math.max(1, Math.round(L.out || 32));
          node.k = k; node.s = s; node.p = p;
          node.cOut = out; node.hOut = oh; node.wOut = ow;
          node.params = (k * k * cIn + 1) * out;
          node.macs = oh * ow * k * k * cIn * out * 2;
          rf = (rf - 1) * s + k;
          cIn = out; hIn = oh; wIn = ow;
        } else if (kind === 'pool') {
          const k = Math.max(2, Math.round(L.k || 2));
          const s = Math.max(1, Math.round(L.s || k));
          const oh = Math.max(1, convOut(hIn, k, s, 0));
          const ow = Math.max(1, convOut(wIn, k, s, 0));
          node.k = k; node.s = s; node.p = 0;
          node.cOut = cIn; node.hOut = oh; node.wOut = ow;
          node.params = 0;
          node.macs = oh * ow * cIn * k * k;
          rf = (rf - 1) * s + k;
          hIn = oh; wIn = ow;
        } else if (kind === 'fc' || kind === 'out') {
          const units = Math.max(1, Math.round(L.units || 10));
          const flat = cIn * hIn * wIn;
          node.cOut = units; node.hOut = 1; node.wOut = 1;
          node.params = (flat + 1) * units;
          node.macs = 2 * flat * units;
          node.flatIn = flat;
          cIn = units; hIn = 1; wIn = 1;
          node.rf = rf;
        } else if (kind === 'rnn') {
          const units = Math.max(1, Math.round(L.units || 32));
          const cell = L.cell === 'gru' ? 3 : 4;
          node.cOut = units; node.hOut = 1; node.wOut = 1;
          node.params = cell * ((cIn + units) * units + units);
          node.macs = 2 * node.params;
          node.cell = cell === 4 ? 'lstm' : 'gru';
          cIn = units; hIn = 1; wIn = 1;
          node.rf = rf;
        } else {
          return;
        }

        node.rf = rf;
        params += node.params;
        macs += node.macs;
        nodes.push(node);
      });

      const weightLayers = nodes.filter(function (n) {
        return n.kind === 'conv' || n.kind === 'fc' || n.kind === 'out' || n.kind === 'rnn';
      }).length;

      let maxCh = 0;
      let rfMax = 1;
      nodes.forEach(function (n) {
        if (n.kind === 'conv' || n.kind === 'pool' || n.kind === 'input') maxCh = Math.max(maxCh, n.cOut);
        rfMax = Math.max(rfMax, n.rf);
      });

      return {
        id: spec && spec.id ? spec.id : 'custom',
        label: spec && spec.label ? spec.label : 'Custom',
        family: (spec && spec.family) || 'cnn',
        input: input,
        nodes: nodes,
        edges: buildEdges(nodes, spec),
        stats: {
          params: params,
          macs: macs,
          depth: weightLayers,
          rf: rfMax,
          widest: maxCh,
          dropped: dropped,
        },
      };
    }

    /**
     * Edges of the data flow. A plain network is a chain; a ResNet adds the
     * shortcut around every basic block, an unrolled RNN adds the recurrent
     * arrows along time.
     */
    function buildEdges(nodes, spec) {
      const edges = [];
      const byIndex = {};
      nodes.forEach(function (n) { byIndex[n.index] = n; });

      const family = (spec && spec.family) || 'cnn';
      if (family === 'rnn') {
        const rnn = {};
        const inputs = {};
        nodes.forEach(function (n) {
          if (n.kind === 'rnn') rnn[(n.layer || 0) + ':' + n.step] = n;
          if (n.kind === 'input') inputs[n.step] = n;
        });
        const steps = [];
        nodes.forEach(function (n) { if (n.step != null && steps.indexOf(n.step) < 0) steps.push(n.step); });
        steps.sort(function (a, b) { return a - b; });
        steps.forEach(function (s) {
          const x = inputs[s];
          if (x && rnn['0:' + s]) edges.push({ from: x.index, to: rnn['0:' + s].index, type: 'flow' });
          for (let l = 0; l < 4; l += 1) {
            const cur = rnn[l + ':' + s];
            const nxtLayer = rnn[(l + 1) + ':' + s];
            if (cur && nxtLayer) edges.push({ from: cur.index, to: nxtLayer.index, type: 'flow' });
          }
          for (let l = 0; l < 4; l += 1) {
            const cur = rnn[l + ':' + s];
            const next = rnn[l + ':' + (s + 1)];
            if (cur && next) edges.push({ from: cur.index, to: next.index, type: 'recur' });
          }
        });
        const lastStep = steps[steps.length - 1];
        // the sequence/embedding node feeds every time step
        const seq = nodes[0];
        if (seq) {
          steps.forEach(function (s) {
            const x = inputs[s];
            if (x && x.index !== seq.index) edges.push({ from: seq.index, to: x.index, type: 'flow' });
          });
        }
        const outNode = nodes.filter(function (n) { return n.kind === 'out'; })[0];
        if (outNode) {
          const src = rnn['1:' + lastStep] || rnn['0:' + lastStep];
          if (src) edges.push({ from: src.index, to: outNode.index, type: 'flow' });
        }
        return edges;
      }

      for (let i = 1; i < nodes.length; i += 1) {
        edges.push({ from: nodes[i - 1].index, to: nodes[i].index, type: 'flow' });
      }

      if (family === 'cnn' && (spec.id === 'resnet18' || spec.residual)) {
        // one shortcut per basic block: the block's input skips its two convs
        let i = 0;
        const list = nodes;
        while (i < list.length) {
          const n = list[i];
          if (n.kind === 'conv' && /_a$/.test(n.name) && list[i + 1] && /_b$/.test(list[i + 1].name)) {
            const before = list[i - 1];
            const after = list[i + 1];
            if (before && after) edges.push({ from: before.index, to: after.index, type: 'skip' });
            i += 2;
            continue;
          }
          i += 1;
        }
      }
      return edges;
    }

    /** Per-node share of the model's parameters, used by the inspector meter. */
    function nodeShare(arch, node) {
      if (!arch || !node || !arch.stats.params) return 0;
      return clamp(node.params / arch.stats.params, 0, 1);
    }

    // Materialise the generated presets once, so editing always starts from a
    // plain layer list and never from a builder function.
    PRESETS.forEach(function (p) {
      if (typeof p.build === 'function' && !p.layers) p.layers = p.build();
    });

    function presetById(id) {
      for (let i = 0; i < PRESETS.length; i += 1) if (PRESETS[i].id === id) return PRESETS[i];
      return PRESETS[0];
    }

    /* =====================================================================
     * 3. Toy inputs and the forward pass behind the heat
     *
     * The lab never ships real weights, but it does not fake the picture
     * either: a 16×16 sample is convolved with a small bank of real kernels,
     * pooled, flattened and pushed through hashed dense weights. Every bright
     * cell on screen is a number this file computed.
     * ===================================================================*/

    const GRID = 16;

    const SEGMENTS = {
      a: [4, 2, 8, 2],
      f: [2, 3, 2, 4],
      b: [11, 3, 2, 4],
      g: [4, 7, 8, 2],
      e: [2, 8, 2, 4],
      c: [11, 8, 2, 4],
      d: [4, 12, 8, 2],
    };

    const DIGIT_SEGS = {
      0: 'abcdef',
      1: 'bc',
      3: 'abcdg',
      5: 'acdfg',
      7: 'abc',
      8: 'abcdefg',
    };

    function blankBitmap() { return new Float32Array(GRID * GRID); }

    function stampRect(bmp, x0, y0, w, hgt) {
      for (let y = y0; y < y0 + hgt; y += 1) {
        if (y < 0 || y >= GRID) continue;
        for (let x = x0; x < x0 + w; x += 1) {
          if (x < 0 || x >= GRID) continue;
          bmp[y * GRID + x] = 1;
        }
      }
    }

    function blurBitmap(bmp) {
      const out = new Float32Array(GRID * GRID);
      for (let y = 0; y < GRID; y += 1) {
        for (let x = 0; x < GRID; x += 1) {
          let sum = 0;
          let n = 0;
          for (let dy = -1; dy <= 1; dy += 1) {
            for (let dx = -1; dx <= 1; dx += 1) {
              const yy = y + dy;
              const xx = x + dx;
              if (yy < 0 || yy >= GRID || xx < 0 || xx >= GRID) continue;
              sum += bmp[yy * GRID + xx];
              n += 1;
            }
          }
          out[y * GRID + x] = n ? sum / n : 0;
        }
      }
      return out;
    }

    function digitBitmap(digit) {
      let bmp = blankBitmap();
      const segs = DIGIT_SEGS[digit] || '';
      for (let i = 0; i < segs.length; i += 1) {
        const r = SEGMENTS[segs[i]];
        if (r) stampRect(bmp, r[0], r[1], r[2], r[3]);
      }
      bmp = blurBitmap(bmp);
      bmp = blurBitmap(bmp);
      return bmp;
    }

    function gridBitmap() {
      const bmp = blankBitmap();
      for (let y = 0; y < GRID; y += 1) {
        for (let x = 0; x < GRID; x += 1) {
          const v = 0.18 + 0.55 * (x / (GRID - 1)) + 0.24 * (y / (GRID - 1));
          const stripe = Math.abs(((x + y) % 8) - 4) < 1 ? 0.26 : 0;
          bmp[y * GRID + x] = clamp(v + stripe, 0, 1);
        }
      }
      return bmp;
    }

    function textureBitmap(seed) {
      const bmp = blankBitmap();
      for (let y = 0; y < GRID; y += 1) {
        for (let x = 0; x < GRID; x += 1) {
          const a = noise3('tex' + seed, x, y);
          const b = noise3('tex2' + seed, Math.floor(x / 2), Math.floor(y / 2));
          bmp[y * GRID + x] = clamp(0.32 * a + 0.86 * b, 0, 1);
        }
      }
      return bmp;
    }

    const TEXT_WORD = 'neural';

    function charVector(ch) {
      const vec = [];
      const base = hash32('emb|' + ch);
      for (let i = 0; i < 6; i += 1) {
        vec.push(unitNoise((base + i * 2654435761) >>> 0) * 2 - 1);
      }
      return vec;
    }

    // Bitmaps are generated once per family: rebuilding them in the render body
    // would re-blur every sample on every hover.
    const SAMPLE_CACHE = {};

    function samplesFor(family) {
      const key = family === 'rnn' ? 'rnn' : 'image';
      if (SAMPLE_CACHE[key]) return SAMPLE_CACHE[key];
      let list;
      if (family === 'rnn') {
        const chars = TEXT_WORD.split('');
        list = [{
          id: 'chars',
          kind: 'text',
          chars: chars,
          vecs: chars.map(charVector),
          label: function () { return t('sample.chars', { w: TEXT_WORD }); },
        }];
      } else {
        list = [
        { id: 'digit3', kind: 'image', digit: 3, bitmap: digitBitmap(3), label: function () { return t('sample.digit', { d: 3 }); } },
        { id: 'digit8', kind: 'image', digit: 8, bitmap: digitBitmap(8), label: function () { return t('sample.digit', { d: 8 }); } },
        { id: 'digit5', kind: 'image', digit: 5, bitmap: digitBitmap(5), label: function () { return t('sample.digit', { d: 5 }); } },
        { id: 'digit7', kind: 'image', digit: 7, bitmap: digitBitmap(7), label: function () { return t('sample.digit', { d: 7 }); } },
        { id: 'grid', kind: 'image', bitmap: gridBitmap(), label: function () { return t('sample.grid'); } },
        { id: 'noise', kind: 'image', bitmap: textureBitmap(7), label: function () { return t('sample.noise'); } },
        ];
      }
      SAMPLE_CACHE[key] = list;
      return list;
    }

    function sampleById(family, id) {
      const list = samplesFor(family);
      for (let i = 0; i < list.length; i += 1) if (list[i].id === id) return list[i];
      return list[0];
    }

    /* ---- the kernel bank every convolution channel draws from ---- */

    const KERNELS = [
      [-1, 0, 1, -2, 0, 2, -1, 0, 1],          // vertical edges (sobel x)
      [-1, -2, -1, 0, 0, 0, 1, 2, 1],          // horizontal edges (sobel y)
      [0, 1, 0, 1, -4, 1, 0, 1, 0],            // laplacian
      [1, 1, 1, 1, 1, 1, 1, 1, 1],             // smoothing
      [1, 0, -1, 0, 0, 0, -1, 0, 1],           // diagonal
      [0, -1, 0, -1, 5, -1, 0, -1, 0],         // sharpen
      [1, 1, 1, 0, 0, 0, -1, -1, -1],          // top-half edges
      [-1, -1, -1, -1, 8, -1, -1, -1, -1],     // centre surround
    ];

    function kernelFor(channel) {
      const bank = KERNELS.length;
      if (channel < bank) return KERNELS[channel];
      const a = KERNELS[channel % bank];
      const b = KERNELS[(channel * 3 + 1) % bank];
      const k = [];
      for (let i = 0; i < 9; i += 1) k.push(a[i] * 0.6 + b[i] * 0.4);
      return k;
    }

    function convMap(src, size, kernel) {
      const out = new Float32Array(size * size);
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          let sum = 0;
          let ki = 0;
          for (let dy = -1; dy <= 1; dy += 1) {
            for (let dx = -1; dx <= 1; dx += 1) {
              const yy = y + dy;
              const xx = x + dx;
              const v = (yy < 0 || yy >= size || xx < 0 || xx >= size) ? 0 : src[yy * size + xx];
              sum += v * kernel[ki];
              ki += 1;
            }
          }
          out[y * size + x] = sum;
        }
      }
      return out;
    }

    function poolMap(src, size, k, s) {
      const out = Math.max(1, Math.floor((size - k) / s) + 1);
      const res = new Float32Array(out * out);
      for (let y = 0; y < out; y += 1) {
        for (let x = 0; x < out; x += 1) {
          let best = -Infinity;
          for (let dy = 0; dy < k; dy += 1) {
            for (let dx = 0; dx < k; dx += 1) {
              const yy = clamp(y * s + dy, 0, size - 1);
              const xx = clamp(x * s + dx, 0, size - 1);
              const v = src[yy * size + xx];
              if (v > best) best = v;
            }
          }
          res[y * out + x] = best;
        }
      }
      return { data: res, size: out };
    }

    function boxSample(src, size, target) {
      const t = Math.max(1, Math.min(target, size));
      const res = new Float32Array(t * t);
      const stepF = size / t;
      for (let y = 0; y < t; y += 1) {
        for (let x = 0; x < t; x += 1) {
          let sum = 0;
          let n = 0;
          const y0 = Math.floor(y * stepF);
          const y1 = Math.max(y0 + 1, Math.floor((y + 1) * stepF));
          const x0 = Math.floor(x * stepF);
          const x1 = Math.max(x0 + 1, Math.floor((x + 1) * stepF));
          for (let yy = y0; yy < y1 && yy < size; yy += 1) {
            for (let xx = x0; xx < x1 && xx < size; xx += 1) {
              sum += src[yy * size + xx];
              n += 1;
            }
          }
          res[y * t + x] = n ? sum / n : 0;
        }
      }
      return { data: res, size: t };
    }

    function softmax(scores) {
      let max = -Infinity;
      for (let i = 0; i < scores.length; i += 1) if (scores[i] > max) max = scores[i];
      const exps = [];
      let sum = 0;
      for (let i = 0; i < scores.length; i += 1) {
        const e = Math.exp(scores[i] - max);
        exps.push(e);
        sum += e;
      }
      for (let i = 0; i < exps.length; i += 1) exps[i] /= sum || 1;
      return exps;
    }

    function classLabel(arch, index) {
      if (arch && arch.family === 'rnn') {
        const preset = presetById('lstm');
        const vocab = (preset && preset.vocab) || ['a', 'b', 'c'];
        return '“' + (vocab[index % vocab.length]) + '”';
      }
      const outNode = arch && arch.nodes ? arch.nodes.filter(function (n) { return n.kind === 'out'; })[0] : null;
      if (outNode && outNode.cOut <= 12) return '“' + index + '”';
      return 'class ' + index;
    }

    function mean(vals) {
      let sum = 0;
      for (let i = 0; i < vals.length; i += 1) sum += vals[i];
      return vals.length ? sum / vals.length : 0;
    }

    function primaryOf(maps) {
      if (!maps || !maps.length) return new Float32Array(GRID * GRID);
      return maps[0].data;
    }

    /** Divide by the node's own peak, then apply the layer gain. */
    function normalizeChannels(maps, gain) {
      let peak = 0;
      maps.forEach(function (m) {
        for (let i = 0; i < m.data.length; i += 1) {
          const v = Math.abs(m.data[i]);
          if (v > peak) peak = v;
        }
      });
      const k = peak > 1e-6 ? (1 / peak) * gain : 0;
      return maps.map(function (m) {
        const data = new Float32Array(m.data.length);
        for (let i = 0; i < m.data.length; i += 1) data[i] = m.data[i] * k;
        return { data: data, size: m.size };
      });
    }

    /** Normalised value → palette index; the gamma lifts weak responses. */
    function shade(v) {
      return palIndex(Math.pow(clamp(v, 0, 1), 0.62));
    }

    function toCells(data, size, target) {
      const sampled = size === target ? { data: data, size: size } : boxSample(data, size, target);
      const cells = new Uint8Array(sampled.size * sampled.size);
      for (let i = 0; i < cells.length; i += 1) cells[i] = shade(sampled.data[i]);
      return cells;
    }

    /** A dense/recurrent activation vector as one plate of coloured cells. */
    function vecPlate(vec, gain) {
      const cols = Math.min(8, Math.max(1, vec.length));
      const rows = Math.max(1, Math.ceil(vec.length / cols));
      const cells = new Uint8Array(cols * rows);
      let peak = 0;
      for (let i = 0; i < vec.length; i += 1) peak = Math.max(peak, Math.abs(vec[i]));
      const k = peak > 1e-6 ? gain / peak : 0;
      for (let i = 0; i < vec.length; i += 1) cells[i] = shade(Math.abs(vec[i]) * k);
      for (let i = vec.length; i < cells.length; i += 1) cells[i] = 0;
      const abs = [];
      for (let i = 0; i < vec.length; i += 1) abs.push(Math.abs(vec[i]));
      return { gw: cols, gh: rows, cells: cells, mean: mean(abs) };
    }

    /** A small feature vector handed to the next dense layer. */
    function featuresOf(act, mapRef) {
      const feats = [];
      if (!act) return [0, 0, 0, 0];
      if (act.kind === 'vec' && act.vec.length) {
        for (let i = 0; i < Math.min(16, act.vec.length); i += 1) feats.push(act.vec[i]);
      } else if (mapRef && mapRef.maps.length) {
        mapRef.maps.forEach(function (m) {
          let sum = 0;
          let energy = 0;
          for (let i = 0; i < m.data.length; i += 1) {
            sum += m.data[i];
            energy += m.data[i] * m.data[i];
          }
          feats.push(sum / m.data.length);
          feats.push(Math.sqrt(energy / m.data.length));
        });
      }
      while (feats.length < 4) feats.push(0);
      return feats.slice(0, 16);
    }

    /**
     * One forward pass over the whole architecture: per-node display cells
     * (palette indices) plus the raw numbers the inspector prints, so the
     * scene and the side panels can never disagree.
     */
    function computeActivations(arch, sample, opts) {
      const capChannels = clamp((opts && opts.channels) || 10, 2, 24);
      const total = Math.max(1, arch.nodes.length);
      const out = new Array(total);
      const primary = new Array(total);
      const hState = {};
      let prediction = null;

      arch.nodes.forEach(function (node, idx) {
        const prevAct = idx > 0 ? out[idx - 1] : null;
        const prevMap = idx > 0 ? primary[idx - 1] : null;
        const gain = 0.52 + 0.48 * (idx / total);
        const rec = { kind: 'map', channels: [], vec: [], probs: null, top: null, peak: 0, mean: 0 };

        if (node.kind === 'input') {
          if (sample.kind === 'image') {
            const src = sample.bitmap;
            const channels = Math.min(Math.max(node.cOut, 1), capChannels);
            const maps = [];
            for (let c = 0; c < channels; c += 1) {
              let data;
              if (c === 0) {
                data = Float32Array.from(src);
              } else if (c === 1) {
                data = convMap(src, GRID, KERNELS[0]);
              } else if (c === 2) {
                data = convMap(src, GRID, KERNELS[1]);
              } else {
                const mixed = new Float32Array(GRID * GRID);
                for (let i = 0; i < mixed.length; i += 1) {
                  mixed[i] = src[i] * (0.55 + 0.45 * noise3('in' + c, i % GRID, Math.floor(i / GRID)));
                }
                data = mixed;
              }
              maps.push({ data: data, size: GRID });
            }
            const norm = normalizeChannels(maps, 1);
            rec.channels = norm.map(function (m) {
              const g = Math.min(m.size, 8);
              return { gw: g, gh: g, cells: toCells(m.data, m.size, g), mean: mean(m.data) };
            });
            primary[idx] = { maps: norm, size: GRID };
            rec.peak = 1;
            rec.mean = mean(primaryOf(maps));
          } else {
            const v = sample.vecs[(node.step || 0) % sample.vecs.length].slice();
            rec.kind = 'vec';
            rec.vec = v;
            rec.channels = [vecPlate(v, 1)];
            rec.mean = mean(v.map(Math.abs));
            primary[idx] = { maps: [], size: 1 };
          }
        } else if (node.kind === 'conv' || node.kind === 'pool') {
          const srcMaps = prevMap && prevMap.maps ? prevMap.maps : [];
          const size = prevMap && prevMap.size ? prevMap.size : GRID;
          const count = Math.min(node.cOut, capChannels);
          const maps = [];
          for (let c = 0; c < count; c += 1) {
            const src = srcMaps.length ? srcMaps[c % srcMaps.length].data : new Float32Array(size * size);
            if (node.kind === 'conv') {
              const conv = convMap(src, size, kernelFor(c));
              for (let i = 0; i < conv.length; i += 1) if (conv[i] < 0) conv[i] = 0;
              maps.push({ data: conv, size: size });
            } else {
              const pooled = poolMap(src, size, node.k || 2, node.s || 2);
              maps.push({ data: pooled.data, size: pooled.size });
            }
          }
          const norm = normalizeChannels(maps, gain);
          rec.channels = norm.map(function (m) {
            const g = Math.min(m.size, 8);
            return { gw: g, gh: g, cells: toCells(m.data, m.size, g), mean: mean(m.data) };
          });
          rec.peak = 1;
          rec.mean = rec.channels.length ? mean(rec.channels.map(function (c) { return c.mean; })) : 0;
          primary[idx] = { maps: norm, size: norm.length ? norm[0].size : size };
        } else if (node.kind === 'rnn') {
          let xin = [];
          if ((node.layer || 0) === 0) {
            const inp = arch.nodes.filter(function (n) { return n.kind === 'input' && n.step === node.step; })[0];
            xin = inp ? out[inp.index].vec : [];
          } else {
            const below = arch.nodes.filter(function (n) {
              return n.kind === 'rnn' && n.step === node.step && (n.layer || 0) === (node.layer || 0) - 1;
            })[0];
            xin = below ? out[below.index].vec : [];
          }
          const hPrev = hState[(node.layer || 0) + '_' + ((node.step || 0) - 1)] || [];
          const units = Math.min(node.cOut, 40);
          const vec = [];
          for (let u = 0; u < units; u += 1) {
            let sum = 0;
            for (let i = 0; i < xin.length; i += 1) sum += xin[i] * (noise3('wx' + node.name + ':' + (node.layer || 0), u, i) * 2 - 1);
            for (let i = 0; i < hPrev.length; i += 1) sum += hPrev[i] * (noise3('wh' + node.name + ':' + (node.layer || 0), u, i) * 2 - 1) * 0.7;
            vec.push(Math.tanh(sum * 0.6));
          }
          hState[(node.layer || 0) + '_' + node.step] = vec;
          rec.kind = 'vec';
          rec.vec = vec;
          rec.peak = vec.reduce(function (a, b) { return Math.max(a, Math.abs(b)); }, 0);
          rec.channels = [vecPlate(vec, gain)];
          rec.mean = mean(vec.map(Math.abs));
          primary[idx] = { maps: [], size: 1 };
        } else if (node.kind === 'fc' || node.kind === 'out') {
          const feats = featuresOf(prevAct, prevMap);
          const shown = Math.min(node.cOut, 64);
          const vec = [];
          for (let u = 0; u < shown; u += 1) {
            let sum = 0;
            for (let i = 0; i < feats.length; i += 1) sum += feats[i] * (noise3('w' + node.name, u, i) * 2 - 1);
            vec.push(Math.tanh(sum * 0.8));
          }
          rec.kind = 'vec';
          rec.vec = vec;
          rec.peak = vec.reduce(function (a, b) { return Math.max(a, Math.abs(b)); }, 0);
          rec.channels = [vecPlate(vec, gain)];
          rec.mean = mean(vec.map(Math.abs));
          primary[idx] = { maps: [], size: 1 };

          if (node.kind === 'out') {
            const classes = node.cOut;
            // A 1000-way softmax spreads thin, so the winning class gets a
            // log-scaled margin: the picture stays readable at any class count.
            const winBonus = 2.2 + Math.log2(Math.max(2, classes)) * 0.6;
            const raw = [];
            for (let k = 0; k < classes; k += 1) {
              let sum = 0;
              for (let i = 0; i < feats.length; i += 1) sum += feats[i] * (noise3('cls' + node.name, k, i) * 2 - 1) * 0.45;
              if (sample.kind === 'image' && sample.digit != null) {
                sum += (k === sample.digit ? winBonus : 0) + (noise3('bias', k, 0) - 0.5) * 0.45;
              } else if (sample.kind === 'text') {
                sum += (k === 3 ? 2.6 : 0) + (noise3('bias', k, 1) - 0.5) * 0.5;
              } else {
                sum += (noise3('bias', k, 2) - 0.5) * 0.5;
              }
              raw.push(sum);
            }
            const probs = softmax(raw);
            rec.probs = probs;
            let best = 0;
            for (let k = 1; k < probs.length; k += 1) if (probs[k] > probs[best]) best = k;
            rec.top = best;
            // the output plate shows the ranked distribution, so a 1000-way
            // softmax still reads as a decaying column of light
            const ranked = probs.slice().sort(function (a, b) { return b - a; });
            rec.channels = [vecPlate(ranked.slice(0, 64), 1)];
            if (!prediction) {
              const order = probs.map(function (p, i) { return { p: p, i: i }; })
                .sort(function (a, b) { return b.p - a.p; })
                .slice(0, 5);
              prediction = {
                nodeIndex: idx,
                top: order.map(function (row) {
                  return { label: classLabel(arch, row.i), p: row.p, index: row.i };
                }),
              };
            }
          }
        } else {
          rec.channels = [];
          primary[idx] = { maps: [], size: 1 };
        }

        out[idx] = rec;
      });

      return { byNode: out, prediction: prediction };
    }

    /* =====================================================================
     * 4. Scene: world positions, one plate per feature map, connections
     * ===================================================================*/

    const TOP_GAP = 0.55;

    function buildScene(arch, act, opts) {
      const opt = opts || {};
      const spacing = clamp(opt.spacing || 1, 0.4, 2.4);
      const channelCap = clamp(opt.channels || 10, 2, 24);
      const nodes = arch.nodes || [];
      const byIndex = {};

      let maxSide = 1;
      nodes.forEach(function (n) {
        if (n.kind === 'conv' || n.kind === 'pool' || n.kind === 'input') {
          maxSide = Math.max(maxSide, n.wOut || 1);
        }
      });

      const sceneNodes = nodes.map(function (n, idx) {
        const a = act && act.byNode ? act.byNode[idx] : null;
        const color = kindColor(n.kind);
        const chans = (a && a.channels) ? a.channels : [];
        const plates = [];
        let side;

        if (n.kind === 'conv' || n.kind === 'pool' || n.kind === 'input') {
          const sp = Math.max(1, n.wOut || 1);
          side = 0.55 + 1.95 * Math.sqrt(sp / maxSide);
          const shown = Math.min(chans.length, channelCap);
          const gap = shown > 1 ? clamp(0.95 / shown, 0.05, 0.2) : 0;
          for (let ci = 0; ci < shown; ci += 1) {
            const c = chans[ci];
            plates.push({ dz: (ci - (shown - 1) / 2) * gap, gw: c.gw, gh: c.gh, cells: c.cells });
          }
          if (!plates.length) plates.push({ dz: 0, gw: 6, gh: 6, cells: new Uint8Array(36) });
        } else {
          side = n.kind === 'rnn' ? 1.2 : (n.kind === 'out' ? 1.15 : 1.4);
          if (chans.length) plates.push({ dz: 0, gw: chans[0].gw, gh: chans[0].gh, cells: chans[0].cells });
          else plates.push({ dz: 0, gw: 4, gh: 4, cells: new Uint8Array(16) });
        }

        const plateGap = plates.length > 1 ? Math.abs(plates[1].dz - plates[0].dz) : 0;
        const depth = (plates.length - 1) * plateGap / 2 + 0.07;

        const sn = {
          id: n.id,
          index: idx,
          node: n,
          kind: n.kind,
          name: n.name,
          color: color,
          plates: plates,
          w: side,
          h: side,
          depth: depth,
          pos: [0, 0, 0],
          step: n.step,
          layer: n.layer,
          shape: fmtShape(n),
          flat: n.kind === 'fc' || n.kind === 'out' || n.kind === 'rnn',
        };
        byIndex[idx] = sn;
        return sn;
      });

      // --- placement: a tunnel along z, or time along x for a recurrence ---
      if (arch.family === 'rnn') {
        sceneNodes.forEach(function (sn) {
          // the synthetic sequence node has no time step: keep it left of t0 so
          // it never lands on top of the first step's input cube
          const stepIdx = sn.step == null ? -1 : sn.step;
          let layerIdx = 0;
          if (sn.kind === 'input') layerIdx = -1;
          else if (sn.kind === 'out') layerIdx = 3;
          else layerIdx = sn.layer || 0;
          sn.pos = [stepIdx * 3.5, 0, layerIdx * 2.9];
        });
      } else {
        let cursor = 0;
        const gap = TOP_GAP * spacing;
        sceneNodes.forEach(function (sn) {
          cursor += sn.depth;
          sn.pos = [0, 0, cursor];
          cursor += sn.depth + gap;
        });
      }

      // --- centre the whole thing on the origin ---
      const lo = [Infinity, Infinity, Infinity];
      const hi = [-Infinity, -Infinity, -Infinity];
      sceneNodes.forEach(function (sn) {
        for (let k = 0; k < 3; k += 1) {
          const half = k === 2 ? sn.depth : Math.max(sn.w, sn.h) / 2;
          lo[k] = Math.min(lo[k], sn.pos[k] - half);
          hi[k] = Math.max(hi[k], sn.pos[k] + half);
        }
      });
      const mid = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
      sceneNodes.forEach(function (sn) {
        sn.pos = [sn.pos[0] - mid[0], sn.pos[1] - mid[1], sn.pos[2] - mid[2]];
      });

      // --- connections ---
      const edges = [];
      (arch.edges || []).forEach(function (e, ei) {
        const a = byIndex[e.from];
        const b = byIndex[e.to];
        if (!a || !b) return;
        const points = edgePath(a, b, e.type);
        const color = e.type === 'skip' ? '#ffd166' : (e.type === 'recur' ? '#ffa15c' : '#7fb2ff');
        edges.push({
          index: ei,
          type: e.type,
          from: e.from,
          to: e.to,
          color: color,
          paths: fanPaths(a, b, e.type, points),
        });
      });

      let radius = 1;
      sceneNodes.forEach(function (sn) {
        const d = Math.sqrt(sn.pos[0] * sn.pos[0] + sn.pos[1] * sn.pos[1] + sn.pos[2] * sn.pos[2]);
        radius = Math.max(radius, d + Math.max(sn.w, sn.h));
      });

      return {
        family: arch.family,
        nodes: sceneNodes,
        edges: edges,
        radius: radius,
        revision: (buildScene.rev = (buildScene.rev || 0) + 1),
      };
    }

    function lerp3(a, b, k) {
      return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    }

    function quadBezier(p0, p2, lift, n) {
      const mid = [lerp(p0[0], p2[0], 0.5), lerp(p0[1], p2[1], 0.5) + lift, lerp(p0[2], p2[2], 0.5)];
      const pts = [];
      for (let i = 0; i <= n; i += 1) {
        const k = i / n;
        const a = lerp3(p0, mid, k);
        const b = lerp3(mid, p2, k);
        pts.push(lerp3(a, b, k));
      }
      return pts;
    }

    function edgePath(a, b, type) {
      const top = Math.max(a.w, a.h) / 2;
      if (type === 'skip') {
        const span = Math.abs(b.pos[2] - a.pos[2]) + 0.001;
        return quadBezier(
          [a.pos[0], a.pos[1] + top * 0.9, a.pos[2] + a.depth],
          [b.pos[0], b.pos[1] + top * 0.9, b.pos[2] - b.depth],
          0.9 + span * 0.16, 16);
      }
      if (type === 'recur') {
        return quadBezier(
          [a.pos[0] + a.w * 0.5, a.pos[1], a.pos[2]],
          [b.pos[0] - b.w * 0.5, b.pos[1], b.pos[2]],
          (a.pos[2] === b.pos[2] ? -1.6 : 0) + 0.9, 16);
      }
      return [
        [a.pos[0], a.pos[1], a.pos[2] + a.depth],
        lerp3([a.pos[0], a.pos[1], a.pos[2] + a.depth], [b.pos[0], b.pos[1], b.pos[2] - b.depth], 0.5),
        [b.pos[0], b.pos[1], b.pos[2] - b.depth],
      ];
    }

    /** Three parallel strands make the flow read as a bundle, not a thread. */
    function fanPaths(a, b, type, points) {
      if (type !== 'flow') return [points];
      const r = Math.min(a.w, b.w) * 0.28;
      const out = [points];
      for (let i = 0; i < 2; i += 1) {
        const sign = i === 0 ? -1 : 1;
        out.push(points.map(function (p) {
          const k = 0.35 + 0.65 * Math.abs(p[2] - a.pos[2]) / Math.max(0.001, Math.abs(b.pos[2] - a.pos[2]));
          return [p[0] + sign * r * k, p[1] + sign * r * 0.55 * k, p[2]];
        }));
      }
      return out;
    }

    /* =====================================================================
     * 5. Renderer — hand-written perspective projection on a 2D canvas
     * ===================================================================*/

    const VIEW_PRESETS = {
      iso: { yaw: -0.62, pitch: 0.34 },
      front: { yaw: 0, pitch: 0.03 },
      top: { yaw: 0, pitch: 1.2 },
      side: { yaw: -1.52, pitch: 0.12 },
    };

    function withAlpha(hex, a) {
      const n = parseInt(String(hex).slice(1), 16);
      return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
    }

    function pointOnPath(path, k) {
      if (!path.length) return [0, 0, 0];
      if (path.length === 1) return path[0];
      const total = path.length - 1;
      const f = clamp(k, 0, 1) * total;
      const i = Math.min(total - 1, Math.floor(f));
      return lerp3(path[i], path[i + 1], f - i);
    }

    function createLab3D(canvas, cb) {
      const ctx = canvas.getContext('2d');
      const calls = cb || {};
      const view = {
        yaw: VIEW_PRESETS.iso.yaw, yawT: VIEW_PRESETS.iso.yaw,
        pitch: VIEW_PRESETS.iso.pitch, pitchT: VIEW_PRESETS.iso.pitch,
        dist: 30, distT: 30,
        focus: [0, 0, 0], focusT: [0, 0, 0],
        offX: 0, offY: 0,
        w: 800, h: 500, dpr: 1, focal: 900,
      };
      const options = {
        selectedId: null,
        reveal: 0,
        showLabels: true,
        showHeat: true,
        showLinks: true,
        autoRotate: false,
      };

      let scene = null;
      let raf = 0;
      let alive = false;
      let drag = null;
      let hoverId = null;
      let texCache = {};
      let dirty = true;

      /**
       * Frame the whole network: measure its projected footprint at a reference
       * distance and pull the camera in until it fills the viewport, so short
       * nets (LeNet) and long ones (VGG-16, an unrolled LSTM) both read well.
       */
      function fitDistance(sc) {
        const r = sc && sc.radius ? sc.radius : 20;
        const ref = r * 2;
        view.offX = 0;
        view.offY = 0;
        const box = screenBox(sc, ref);
        if (!box) return clamp(ref, 6, 260);
        const targetW = Math.max(220, view.w * 0.74);
        const targetH = Math.max(180, view.h * 0.76);
        const k = Math.max(box.w / targetW, box.h / targetH, 0.25);
        const dist = clamp(ref * k, r * 0.6, r * 6);
        // perspective pushes the near end of the tunnel outwards, so the
        // projected footprint is re-centred after the distance is chosen
        const fitted = screenBox(sc, dist);
        if (fitted) {
          view.offX = view.w / 2 - (fitted.minX + fitted.maxX) / 2;
          view.offY = view.h / 2 - (fitted.minY + fitted.maxY) / 2;
        }
        return dist;
      }

      /** Keep the network centred after a resize, without touching the zoom. */
      function recentre(sc) {
        if (!sc) return;
        view.offX = 0;
        view.offY = 0;
        const box = screenBox(sc, view.dist);
        if (!box) return;
        view.offX = view.w / 2 - (box.minX + box.maxX) / 2;
        view.offY = view.h / 2 - (box.minY + box.maxY) / 2;
      }

      /** Screen-space bounding box of every plate, at a given camera distance. */
      function screenBox(sc, dist) {
        if (!sc || !sc.nodes || !sc.nodes.length) return null;
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        const half = [[-1, 1], [1, 1], [1, -1], [-1, -1]];
        sc.nodes.forEach(function (sn) {
          const hw = sn.w / 2;
          const hh = sn.h / 2;
          const first = sn.plates[0];
          const lastP = sn.plates[sn.plates.length - 1];
          const zs = first === lastP ? [first.dz] : [first.dz, lastP.dz];
          zs.forEach(function (dz) {
            half.forEach(function (c) {
              const p = project([sn.pos[0] + c[0] * hw, sn.pos[1] + c[1] * hh, sn.pos[2] + dz], dist);
              if (p.x < minX) minX = p.x;
              if (p.x > maxX) maxX = p.x;
              if (p.y < minY) minY = p.y;
              if (p.y > maxY) maxY = p.y;
            });
          });
        });
        return { w: maxX - minX, h: maxY - minY, minX: minX, maxX: maxX, minY: minY, maxY: maxY };
      }

      function project(p, distOverride) {
        const cy = Math.cos(view.yaw);
        const sy = Math.sin(view.yaw);
        const cp = Math.cos(view.pitch);
        const sp = Math.sin(view.pitch);
        const x = p[0] - view.focus[0];
        const y = p[1] - view.focus[1];
        const z = p[2] - view.focus[2];
        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        const y2 = y * cp - z1 * sp;
        const z2 = y * sp + z1 * cp;
        const d = (distOverride == null ? view.dist : distOverride) + z2;
        const k = view.focal / Math.max(1.2, d);
        return { x: view.w / 2 + view.offX + x1 * k, y: view.h / 2 + view.offY - y2 * k, s: k, d: d };
      }

      /**
       * One small offscreen canvas per feature map. The cache is keyed by the
       * cell buffer identity, so a rebuild that only moves layers along z (or a
       * locale switch) reuses every texture instead of re-rasterising it.
       */
      function plateTexture(sn, plate, pi) {
        const key = sn.id + ':' + pi;
        const hit = texCache[key];
        const gw = Math.max(1, plate.gw);
        const gh = Math.max(1, plate.gh);
        if (hit && hit.cells === plate.cells && hit.gw === gw && hit.gh === gh) return hit.canvas;
        const c = document.createElement('canvas');
        c.width = gw;
        c.height = gh;
        const g = c.getContext('2d');
        for (let j = 0; j < gh; j += 1) {
          for (let i = 0; i < gw; i += 1) {
            const v = plate.cells[j * gw + i] | 0;
            g.fillStyle = PALETTE[v] || PALETTE[0];
            g.fillRect(i, j, 1, 1);
          }
        }
        texCache[key] = { cells: plate.cells, gw: gw, gh: gh, canvas: c };
        return c;
      }

      function quadPath(p0, p1, p2, p3) {
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
      }

      function drawPlate(sn, plate, pi, alpha) {
        const hw = sn.w / 2;
        const hh = sn.h / 2;
        const cz = sn.pos[2] + plate.dz;
        const p0 = project([sn.pos[0] - hw, sn.pos[1] + hh, cz]);
        const p1 = project([sn.pos[0] + hw, sn.pos[1] + hh, cz]);
        const p2 = project([sn.pos[0] + hw, sn.pos[1] - hh, cz]);
        const p3 = project([sn.pos[0] - hw, sn.pos[1] - hh, cz]);
        if (p0.d < 1.5) return p0.d;

        const gw = Math.max(1, plate.gw);
        const gh = Math.max(1, plate.gh);
        const tex = plateTexture(sn, plate, pi);

        ctx.save();
        ctx.globalAlpha = alpha;
        quadPath(p0, p1, p2, p3);
        ctx.fillStyle = '#0a1224';
        ctx.fill();
        ctx.clip();
        if (options.showHeat) {
          const ux = (p1.x - p0.x) / gw;
          const uy = (p1.y - p0.y) / gw;
          const vx = (p3.x - p0.x) / gh;
          const vy = (p3.y - p0.y) / gh;
          ctx.transform(ux, uy, vx, vy, p0.x, p0.y);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(tex, 0, 0, gw, gh);
        }
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = alpha;
        quadPath(p0, p1, p2, p3);
        ctx.lineWidth = 1;
        ctx.strokeStyle = withAlpha(sn.color, 0.55);
        ctx.stroke();
        ctx.restore();
        return p0.d;
      }

      function drawNode(sn) {
        const reveal = options.reveal;
        const isActive = sn.index === reveal;
        const future = sn.index > reveal;
        const base = future ? 0.22 : (isActive ? 1 : 0.94);
        const selected = options.selectedId === sn.id;

        const order = sn.plates.map(function (p, i) {
          const c = project([sn.pos[0], sn.pos[1], sn.pos[2] + p.dz]);
          return { p: p, i: i, d: c.d };
        }).sort(function (a, b) { return b.d - a.d; });

        let frontZ = null;
        order.forEach(function (row) {
          const d = drawPlate(sn, row.p, row.i, base);
          if (frontZ == null || d < frontZ) frontZ = d;
        });

        if (sn.plates.length > 1 && !future) {
          // a faint cage between the first and the last map sells the volume
          const hw = sn.w / 2;
          const hh = sn.h / 2;
          const z0 = sn.pos[2] + sn.plates[0].dz;
          const z1 = sn.pos[2] + sn.plates[sn.plates.length - 1].dz;
          const corners = [[-hw, hh], [hw, hh], [hw, -hh], [-hw, -hh]];
          ctx.save();
          ctx.globalAlpha = base * 0.5;
          ctx.strokeStyle = withAlpha(sn.color, 0.45);
          ctx.lineWidth = 1;
          corners.forEach(function (c) {
            const a = project([sn.pos[0] + c[0], sn.pos[1] + c[1], z0]);
            const b = project([sn.pos[0] + c[0], sn.pos[1] + c[1], z1]);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          });
          ctx.restore();
        }

        if (selected) {
          const hw = sn.w / 2;
          const hh = sn.h / 2;
          const z0 = sn.pos[2] + sn.plates[0].dz;
          const z1 = sn.pos[2] + sn.plates[sn.plates.length - 1].dz;
          const cube = [];
          for (let si = 0; si < 2; si += 1) {
            const z = si === 0 ? z0 : z1;
            const pts = [[-hw, hh], [hw, hh], [hw, -hh], [-hw, -hh]].map(function (c) {
              return project([sn.pos[0] + c[0], sn.pos[1] + c[1], z]);
            });
            cube.push(pts);
          }
          ctx.save();
          ctx.strokeStyle = withAlpha('#ffffff', 0.9);
          ctx.lineWidth = 1.4;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          for (let si = 0; si < 2; si += 1) {
            const pts = cube[si];
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < 4; i += 1) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.closePath();
          }
          for (let i = 0; i < 4; i += 1) {
            ctx.moveTo(cube[0][i].x, cube[0][i].y);
            ctx.lineTo(cube[1][i].x, cube[1][i].y);
          }
          ctx.stroke();
          ctx.restore();
        }
      }

      function drawEdge(e) {
        const reveal = options.reveal;
        if (e.from > reveal && e.to > reveal) return;
        const passed = e.to <= reveal;
        ctx.save();
        ctx.lineWidth = e.type === 'flow' ? 1 : 1.4;
        ctx.strokeStyle = withAlpha(e.color, passed ? 0.55 : 0.22);
        ctx.beginPath();
        e.paths.forEach(function (path) {
          const first = project(path[0]);
          ctx.moveTo(first.x, first.y);
          for (let i = 1; i < path.length; i += 1) {
            const p = project(path[i]);
            ctx.lineTo(p.x, p.y);
          }
        });
        ctx.stroke();
        ctx.restore();
      }

      function drawParticles(now) {
        if (!options.showLinks || !scene) return;
        const reveal = options.reveal;
        if (reveal < 0) return;
        scene.edges.forEach(function (e) {
          if (e.from > reveal) return;
          const path = e.paths[0];
          const count = e.to <= reveal ? 3 : 2;
          for (let k = 0; k < count; k += 1) {
            const ph = ((now * 0.00032 + e.index * 0.19 + k / count) % 1);
            const pt = pointOnPath(path, ph);
            const p = project(pt);
            if (p.d < 2) continue;
            const r = clamp(p.s * 0.05, 1.2, 3.4);
            const a = e.to <= reveal ? 0.9 : 0.4;
            ctx.beginPath();
            ctx.fillStyle = withAlpha(e.color, a * (1 - Math.abs(ph - 0.5) * 0.6));
            ctx.arc(p.x, p.y, r, 0, 6.28318);
            ctx.fill();
          }
        });
      }

      function drawLabels() {
        if (!options.showLabels || !scene) return;
        const placed = [];
        const rows = scene.nodes.map(function (sn) {
          const c = project([sn.pos[0], sn.pos[1] + sn.h / 2 + 0.42, sn.pos[2]]);
          return { sn: sn, x: c.x, y: c.y, d: c.d };
        }).sort(function (a, b) { return a.d - b.d; });

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        rows.forEach(function (row) {
          if (row.x < 40 || row.x > view.w - 40 || row.y < 30 || row.y > view.h - 20) return;
          for (let i = 0; i < placed.length; i += 1) {
            if (Math.abs(placed[i].x - row.x) < 54 && Math.abs(placed[i].y - row.y) < 18) return;
          }
          placed.push(row);
          const future = row.sn.index > options.reveal;
          ctx.globalAlpha = future ? 0.4 : 0.95;
          ctx.font = '600 11px system-ui, -apple-system, "Segoe UI", sans-serif';
          ctx.fillStyle = row.sn.index === options.reveal ? '#ffffff' : row.sn.color;
          ctx.fillText(row.sn.name, row.x, row.y);
          if (row.sn.shape) {
            ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace';
            ctx.fillStyle = 'rgba(214,226,255,0.66)';
            ctx.fillText(row.sn.shape, row.x, row.y + 12);
          }
        });
        ctx.restore();
      }

      function draw() {
        ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
        ctx.clearRect(0, 0, view.w, view.h);
        if (!scene) return;

        const items = [];
        scene.nodes.forEach(function (sn) {
          const c = project(sn.pos);
          items.push({ kind: 'node', sn: sn, d: c.d });
        });
        scene.edges.forEach(function (e) {
          const mid = pointOnPath(e.paths[0], 0.5);
          const c = project(mid);
          items.push({ kind: 'edge', e: e, d: c.d });
        });
        items.sort(function (a, b) { return b.d - a.d; });
        items.forEach(function (it) {
          if (it.kind === 'node') drawNode(it.sn);
          else drawEdge(it.e);
        });

        drawParticles(performance.now());
        drawLabels();
      }

      function frame(now) {
        if (!alive) return;
        raf = window.requestAnimationFrame(frame);
        const dt = lastAt ? Math.min(64, Math.max(1, now - lastAt)) : 16;
        lastAt = now;
        const ease = clamp(dt / 110, 0, 1);
        let moved = false;

        if (options.autoRotate && !drag) {
          view.yaw += dt * 0.00018;
          view.yawT = view.yaw;
          moved = true;
        } else {
          if (Math.abs(view.yawT - view.yaw) > 1e-4) { view.yaw += (view.yawT - view.yaw) * ease; moved = true; }
          if (Math.abs(view.pitchT - view.pitch) > 1e-4) { view.pitch += (view.pitchT - view.pitch) * ease; moved = true; }
          if (Math.abs(view.distT - view.dist) > 1e-2) { view.dist += (view.distT - view.dist) * ease; moved = true; }
        }
        for (let i = 0; i < 3; i += 1) {
          if (Math.abs(view.focusT[i] - view.focus[i]) > 1e-3) {
            view.focus[i] += (view.focusT[i] - view.focus[i]) * ease;
            moved = true;
          }
        }
        // The flow particles keep moving, so they own the redraw loop; when
        // they are switched off an idle camera costs nothing.
        const animating = !!options.showLinks;
        if (dirty || moved || animating) {
          dirty = false;
          draw();
        }
      }

      let lastAt = 0;

      function resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const w = Math.max(1, Math.round(rect.width));
        const h = Math.max(1, Math.round(rect.height));
        view.w = w;
        view.h = h;
        view.dpr = dpr;
        view.focal = Math.min(w, h) * 1.55;
        canvas.width = Math.max(1, Math.round(w * dpr));
        canvas.height = Math.max(1, Math.round(h * dpr));
        if (scene) recentre(scene);
        dirty = true;
      }

      function localPoint(ev) {
        const rect = canvas.getBoundingClientRect();
        return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      }

      function pickAt(mx, my) {
        if (!scene) return null;
        let best = null;
        scene.nodes.forEach(function (sn) {
          const c = project(sn.pos);
          const edge = project([sn.pos[0] + sn.w / 2, sn.pos[1] + sn.h / 2, sn.pos[2]]);
          // a layer is a slab, not a point: measure both screen extents, so the
          // Side view (where world x collapses) still hits the whole face
          const rad = Math.max(11, Math.abs(edge.x - c.x), Math.abs(edge.y - c.y)) * 1.15;
          const dx = mx - c.x;
          const dy = my - c.y;
          if (Math.sqrt(dx * dx + dy * dy) > rad) return;
          if (!best || c.d < best.d) best = { id: sn.id, node: sn, x: c.x, y: c.y, d: c.d };
        });
        return best;
      }

      function onPointerDown(ev) {
        // left button orbits the camera, right button slides the whole scene
        const button = ev.button === undefined ? 0 : ev.button;
        const mode = button === 2 ? 'pan' : (button === 0 ? 'orbit' : null);
        if (!mode) return;
        if (mode === 'pan') ev.preventDefault();
        const p = localPoint(ev);
        drag = { id: ev.pointerId, x: p.x, y: p.y, moved: 0, mode: mode };
        try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* optional */ }
        canvas.style.cursor = mode === 'pan' ? 'move' : 'grabbing';
      }

      function onPointerMove(ev) {
        const p = localPoint(ev);
        if (drag && drag.id === ev.pointerId) {
          const dx = p.x - drag.x;
          const dy = p.y - drag.y;
          drag.x = p.x;
          drag.y = p.y;
          drag.moved += Math.abs(dx) + Math.abs(dy);
          if (drag.mode === 'pan') {
            // keep the scene reachable: a pan can never push it out of the view
            const lim = Math.max(240, Math.max(view.w, view.h) * 1.4);
            view.offX = clamp(view.offX + dx, -lim, lim);
            view.offY = clamp(view.offY + dy, -lim, lim);
          } else {
            view.yawT += dx * 0.0072;
            view.pitchT = clamp(view.pitchT + dy * 0.006, -1.32, 1.32);
          }
          dirty = true;
          return;
        }
        const hit = pickAt(p.x, p.y);
        const nextId = hit ? hit.id : null;
        if (nextId !== hoverId) {
          hoverId = nextId;
          canvas.style.cursor = hit ? 'pointer' : 'grab';
          if (calls.onHover) calls.onHover(hit ? { id: hit.id, node: hit.node, x: hit.x, y: hit.y } : null);
        }
      }

      function onPointerUp(ev) {
        if (!drag || drag.id !== ev.pointerId) return;
        const wasClick = drag.mode === 'orbit' && drag.moved < 5;
        const p = localPoint(ev);
        drag = null;
        try { canvas.releasePointerCapture(ev.pointerId); } catch (e) { /* optional */ }
        canvas.style.cursor = 'grab';
        if (wasClick) {
          const hit = pickAt(p.x, p.y);
          if (calls.onSelect) calls.onSelect(hit ? hit.id : null, hit ? hit.node : null);
        }
      }

      function onPointerLeave() {
        drag = null;
        canvas.style.cursor = 'grab';
        if (hoverId !== null) {
          hoverId = null;
          if (calls.onHover) calls.onHover(null);
        }
      }

      function onContextMenu(ev) {
        // right-drag pans the scene, so the browser menu would break the gesture
        ev.preventDefault();
      }

      function onWheel(ev) {
        ev.preventDefault();
        const unit = scene ? scene.radius : 20;
        const factor = Math.exp(clamp(ev.deltaY, -140, 140) * 0.0016);
        view.distT = clamp(view.distT * factor, unit * 0.35, unit * 12);
      }

      function onDoubleClick(ev) {
        const p = localPoint(ev);
        const hit = pickAt(p.x, p.y);
        if (hit && calls.onSelect) calls.onSelect(hit.id, hit.node);
        if (hit) {
          view.focusT = [hit.node.pos[0], hit.node.pos[1], hit.node.pos[2]];
          view.distT = Math.max(6, hit.node.w * 3.2);
          view.offX = 0;
          view.offY = 0;
        } else if (scene) {
          view.focusT = [0, 0, 0];
          view.distT = fitDistance(scene);
        }
      }

      const observer = typeof window.ResizeObserver === 'function'
        ? new window.ResizeObserver(function () { resize(); })
        : null;

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);
      canvas.addEventListener('pointerleave', onPointerLeave);
      canvas.addEventListener('lostpointercapture', onPointerLeave);
      canvas.addEventListener('wheel', onWheel, { passive: false });
      canvas.addEventListener('dblclick', onDoubleClick);
      canvas.addEventListener('contextmenu', onContextMenu);
      // a release outside the canvas must still end the drag
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
      if (observer) observer.observe(canvas);

      resize();

      return {
        start: function () {
          if (raf) return;
          alive = true;
          raf = window.requestAnimationFrame(frame);
        },
        dispose: function () {
          alive = false;
          if (raf) window.cancelAnimationFrame(raf);
          raf = 0;
          if (observer) observer.disconnect();
          canvas.removeEventListener('pointerdown', onPointerDown);
          canvas.removeEventListener('pointermove', onPointerMove);
          canvas.removeEventListener('pointerup', onPointerUp);
          canvas.removeEventListener('pointercancel', onPointerUp);
          canvas.removeEventListener('pointerleave', onPointerLeave);
          canvas.removeEventListener('lostpointercapture', onPointerLeave);
          canvas.removeEventListener('wheel', onWheel);
          canvas.removeEventListener('dblclick', onDoubleClick);
          canvas.removeEventListener('contextmenu', onContextMenu);
          window.removeEventListener('pointerup', onPointerUp);
          window.removeEventListener('pointercancel', onPointerUp);
          texCache = {};
        },
        resize: resize,
        setScene: function (next) {
          const familyChanged = !scene || !next || scene.family !== next.family;
          scene = next;
          if (next && familyChanged) {
            // frame the net in the orientation it is about to be shown in, so a
            // fit measured from Front/Top/Side is never applied to the iso view
            view.yaw = view.yawT = VIEW_PRESETS.iso.yaw;
            view.pitch = view.pitchT = VIEW_PRESETS.iso.pitch;
            view.focus = [0, 0, 0];
            view.focusT = [0, 0, 0];
            view.dist = view.distT = fitDistance(next);
          } else if (next) {
            view.distT = clamp(view.distT, next.radius * 0.35, next.radius * 12);
            view.dist = clamp(view.dist, next.radius * 0.35, next.radius * 12);
            recentre(next);
          }
          hoverId = null;
          dirty = true;
        },
        setSelected: function (id) { options.selectedId = id || null; dirty = true; },
        setReveal: function (n) { options.reveal = n == null ? 0 : n; dirty = true; },
        setDisplay: function (next) {
          if (!next) return;
          if (next.showLabels !== undefined) options.showLabels = !!next.showLabels;
          if (next.showHeat !== undefined) options.showHeat = !!next.showHeat;
          if (next.showLinks !== undefined) options.showLinks = !!next.showLinks;
          if (next.autoRotate !== undefined) options.autoRotate = !!next.autoRotate;
          dirty = true;
        },
        setView: function (name) {
          const preset = VIEW_PRESETS[name] || VIEW_PRESETS.iso;
          view.yawT = preset.yaw;
          view.pitchT = preset.pitch;
          dirty = true;
        },
        overview: function () {
          // snap the orientation first: the fit is measured through it
          view.yaw = view.yawT = VIEW_PRESETS.iso.yaw;
          view.pitch = view.pitchT = VIEW_PRESETS.iso.pitch;
          view.focus = [0, 0, 0];
          view.focusT = [0, 0, 0];
          if (scene) view.dist = view.distT = fitDistance(scene);
          dirty = true;
        },
        focusNode: function (node) {
          if (!node) return;
          view.focusT = [node.pos[0], node.pos[1], node.pos[2]];
          view.distT = Math.max(6, node.w * 3.4);
          view.offX = 0;
          view.offY = 0;
          dirty = true;
        },
      };
    }

    /* =====================================================================
     * 6. Styles — the viewport is artwork (always dark); every panel uses
     *    host theme tokens so it joins the surrounding application.
     * ===================================================================*/

    const CSS = [
      '.nn3-root{position:relative;width:100%;height:100%;min-height:460px;overflow:hidden;',
      'background:radial-gradient(120% 85% at 50% 6%,#10203c 0%,#080f21 50%,#04060d 100%);',
      'color:var(--dsw-alias-label-primary);font-size:12px;line-height:1.4}',
      '.nn3-canvas{position:absolute;inset:0;display:block;width:100%;height:100%;touch-action:none;',
      'cursor:grab;outline:none}',
      '.nn3-top{position:absolute;top:0;left:0;right:0;z-index:4;display:flex;align-items:center;gap:10px;',
      'flex-wrap:wrap;padding:8px 12px;background:var(--dsw-alias-bg-layer-1);',
      'border-bottom:1px solid var(--dsw-alias-border-l1)}',
      '.nn3-brandmark{width:26px;height:26px;border-radius:8px;display:flex;align-items:center;',
      'justify-content:center;color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-2);',
      'border:1px solid var(--dsw-alias-border-l1);flex:0 0 auto}',
      '.nn3-brand{display:flex;flex-direction:column;gap:0;min-width:0}',
      '.nn3-title{font-size:13px;font-weight:600;letter-spacing:.01em;white-space:nowrap}',
      '.nn3-sub{font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;',
      'text-overflow:ellipsis;max-width:330px}',
      '.nn3-pill{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;',
      'font-size:11px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);',
      'color:var(--dsw-alias-label-secondary);white-space:nowrap}',
      '.nn3-pill[data-done="true"]{color:var(--dsw-alias-state-success-primary);',
      'border-color:var(--dsw-alias-state-success-primary)}',
      '.nn3-left,.nn3-right{position:absolute;top:58px;bottom:40px;z-index:3;display:flex;',
      'flex-direction:column;gap:8px;overflow-y:auto;padding:8px 10px;pointer-events:none}',
      '.nn3-left{left:0;width:232px}',
      '.nn3-right{right:0;width:300px}',
      '.nn3-left>*,.nn3-right>*{pointer-events:auto}',
      '.nn3-card{display:flex;flex-direction:column;gap:7px;padding:9px 10px;border-radius:10px;',
      'background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2)}',
      '.nn3-cardhead{display:flex;align-items:center;justify-content:space-between;gap:8px}',
      '.nn3-cardtitle{font-size:10px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;',
      'color:var(--dsw-alias-label-secondary)}',
      '.nn3-bottom{position:absolute;left:0;right:0;bottom:0;z-index:4;display:flex;align-items:center;',
      'gap:12px;flex-wrap:wrap;padding:6px 12px;font-size:11px;color:var(--dsw-alias-label-secondary);',
      'background:var(--dsw-alias-bg-layer-1);border-top:1px solid var(--dsw-alias-border-l1)}',
      '.nn3-bottom b{color:var(--dsw-alias-label-primary);font-weight:600}',
      '.nn3-btn{padding:4px 9px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);',
      'background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;',
      'font-size:11px;cursor:pointer;white-space:nowrap}',
      '.nn3-btn:hover{border-color:var(--dsw-alias-border-l2)}',
      '.nn3-btn[data-active="true"]{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff}',
      '.nn3-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.nn3-btnrow{display:flex;flex-wrap:wrap;gap:6px}',
      '.nn3-select{padding:4px 7px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);',
      'background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;',
      'font-size:11px;cursor:pointer;max-width:100%}',
      '.nn3-num{width:52px;padding:3px 5px;border-radius:5px;border:1px solid var(--dsw-alias-border-l1);',
      'background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;',
      'font-size:11px;font-variant-numeric:tabular-nums}',
      '.nn3-row{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px;',
      'color:var(--dsw-alias-label-secondary)}',
      '.nn3-val{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}',
      '.nn3-slider{display:flex;flex-direction:column;gap:1px}',
      '.nn3-range{width:100%;height:14px;cursor:pointer;accent-color:var(--dsw-alias-brand-primary)}',
      '.nn3-check{display:flex;align-items:center;gap:7px;font-size:11px;cursor:pointer;',
      'color:var(--dsw-alias-label-secondary)}',
      '.nn3-check input{accent-color:var(--dsw-alias-brand-primary);cursor:pointer}',
      '.nn3-list{display:flex;flex-direction:column;gap:1px;max-height:212px;overflow-y:auto;',
      'padding-right:2px}',
      '.nn3-lrow{display:flex;align-items:center;gap:7px;padding:4px 6px;border-radius:7px;',
      'border:1px solid transparent;background:transparent;font:inherit;text-align:left;cursor:pointer;',
      'color:var(--dsw-alias-label-secondary);min-width:0}',
      '.nn3-lrow:hover{background:var(--dsw-alias-bg-layer-2)}',
      '.nn3-lrow[data-active="true"]{background:var(--dsw-alias-bg-layer-2);',
      'border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary)}',
      '.nn3-dot{flex:0 0 8px;height:8px;border-radius:2px}',
      '.nn3-lname{flex:1 1 auto;font-size:11px;font-weight:600;overflow:hidden;text-overflow:ellipsis;',
      'white-space:nowrap}',
      '.nn3-lshape{flex:0 0 auto;font-size:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;',
      'color:var(--dsw-alias-label-secondary)}',
      '.nn3-done{flex:0 0 auto;color:var(--dsw-alias-state-success-primary);font-size:10px}',
      '.nn3-kv{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px}',
      '.nn3-kv-k{color:var(--dsw-alias-label-secondary)}',
      '.nn3-kv-v{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}',
      '.nn3-meter{position:relative;height:6px;border-radius:3px;overflow:hidden;',
      'background:var(--dsw-alias-bg-layer-2)}',
      '.nn3-meter>i{display:block;height:100%;background:var(--dsw-alias-brand-primary)}',
      '.nn3-maps{display:flex;flex-wrap:wrap;gap:5px}',
      '.nn3-map{position:relative;border-radius:3px;overflow:hidden;',
      'border:1px solid var(--dsw-alias-border-l1);image-rendering:pixelated}',
      '.nn3-cap{font-size:10px;color:var(--dsw-alias-label-secondary)}',
      '.nn3-wrow{display:flex;align-items:center;gap:6px;font-size:11px;',
      'color:var(--dsw-alias-label-secondary)}',
      '.nn3-wrow>.bar{flex:1 1 auto;height:5px;border-radius:3px;overflow:hidden;',
      'background:var(--dsw-alias-bg-layer-2)}',
      '.nn3-wrow>.bar>i{display:block;height:100%;background:var(--dsw-alias-brand-primary)}',
      '.nn3-wrow>.num{flex:0 0 40px;text-align:right;color:var(--dsw-alias-label-primary);',
      'font-variant-numeric:tabular-nums}',
      '.nn3-legend{display:flex;flex-direction:column;gap:5px}',
      '.nn3-legrow{display:flex;align-items:flex-start;gap:7px;font-size:11px;line-height:1.45;',
      'color:var(--dsw-alias-label-secondary)}',
      '.nn3-swatch{flex:0 0 9px;height:9px;border-radius:2px;margin-top:4px}',
      '.nn3-note{font-size:10px;line-height:1.55;color:var(--dsw-alias-label-secondary)}',
      '.nn3-tip{position:absolute;z-index:5;transform:translate(-50%,-155%);padding:3px 8px;',
      'border-radius:6px;font-size:11px;white-space:nowrap;pointer-events:none;',
      'color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-overlay);',
      'border:1px solid var(--dsw-alias-border-l2)}',
      '.nn3-empty{font-size:11px;line-height:1.55;color:var(--dsw-alias-label-secondary)}',
      '.nn3-chips{display:flex;flex-wrap:wrap;gap:6px}',
      '.nn3-chip{display:flex;flex-direction:column;gap:0;padding:2px 8px;border-radius:6px;',
      'border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2)}',
      '.nn3-chip-k{font-size:9px;color:var(--dsw-alias-label-secondary)}',
      '.nn3-chip-v{font-size:11px;font-weight:600;font-variant-numeric:tabular-nums}',
      '.nn3-editrow{display:flex;align-items:center;gap:5px;padding:3px 4px;border-radius:6px;',
      'background:var(--dsw-alias-bg-layer-2)}',
      '.nn3-editrow .tag{flex:0 0 auto;font-size:10px;color:var(--dsw-alias-label-secondary);width:40px}',
      '.nn3-x{border:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;',
      'font:inherit;font-size:12px;line-height:1;padding:2px 3px;border-radius:4px}',
      '.nn3-x:hover{color:var(--dsw-alias-state-error-primary)}',
      '@media (max-width:1120px){.nn3-left{width:206px}.nn3-right{width:266px}}',
      '@media (max-width:940px){.nn3-left{display:none}}',
      '@media (max-width:820px){.nn3-right{display:none}}',
    ].join('');

    /* =====================================================================
     * 7. Components
     * ===================================================================*/

    function PanelIcon(props) {
      const size = (props && props.size) || 18;
      const active = !!(props && props.active);
      return h('svg', {
        viewBox: '0 0 24 24', width: size, height: size, focusable: 'false', 'aria-hidden': 'true',
        style: { display: 'block', opacity: active ? 1 : 0.82 },
      },
        h('path', { d: 'M4 7.5 9 5l5 2.5L9 10Z', fill: 'currentColor' }),
        h('path', { d: 'M4 12 9 9.5 14 12 9 14.5Z', fill: 'currentColor', fillOpacity: 0.72 }),
        h('path', { d: 'M10 13.5 15 11l5 2.5L15 16Z', fill: 'currentColor', fillOpacity: 0.55 }),
        h('path', { d: 'M10 18 15 15.5 20 18 15 20.5Z', fill: 'currentColor', fillOpacity: 0.38 }));
    }

    function BrandMark() {
      return h('span', { className: 'nn3-brandmark' }, h(PanelIcon, { size: 16, active: true }));
    }

    /** One feature map as a grid of coloured cells (palette-indexed). */
    function CellGrid(props) {
      const gw = Math.max(1, props.gw | 0);
      const gh = Math.max(1, props.gh | 0);
      const size = props.size || 40;
      const cellW = size / gw;
      const cellH = props.keepSquare === false ? cellW : size / Math.max(gw, gh);
      const cells = props.cells || [];
      const nodes = [];
      for (let j = 0; j < gh; j += 1) {
        for (let i = 0; i < gw; i += 1) {
          nodes.push(h('i', {
            key: j * gw + i,
            style: {
              position: 'absolute',
              left: (i * cellW).toFixed(2) + 'px',
              top: (j * cellH).toFixed(2) + 'px',
              width: (cellW + 0.4).toFixed(2) + 'px',
              height: (cellH + 0.4).toFixed(2) + 'px',
              background: PALETTE[cells[j * gw + i] | 0] || PALETTE[0],
            },
          }));
        }
      }
      return h('div', {
        className: 'nn3-map',
        style: { width: size + 'px', height: (gh * cellH) + 'px' },
      }, nodes);
    }

    function chip(key, value) {
      return h('div', { className: 'nn3-chip', key: key },
        h('div', { className: 'nn3-chip-k' }, key),
        h('div', { className: 'nn3-chip-v' }, value));
    }

    function kvRow(key, value, extra) {
      return h('div', { className: 'nn3-kv', key: key },
        h('span', { className: 'nn3-kv-k' }, key),
        h('span', { className: 'nn3-kv-v' }, value));
    }

    function legRow(color, text, key) {
      return h('div', { className: 'nn3-legrow', key: key || text },
        h('span', { className: 'nn3-swatch', style: { background: color } }),
        h('span', null, text));
    }

    function nodeTitle(sn) {
      if (!sn) return '';
      const kind = t('kind.' + (sn.kind || 'conv'));
      return sn.name + ' · ' + kind + (sn.shape ? ' · ' + sn.shape : '');
    }

    function LabPage() {
      const tick = useLocaleTick();

      const presetS = React.useState('lenet');
      const presetId = presetS[0];
      const setPresetId = presetS[1];

      const draftS = React.useState(null);
      const draft = draftS[0];
      const setDraft = draftS[1];

      const sampleS = React.useState('digit3');
      const sampleId = sampleS[0];
      const setSampleId = sampleS[1];

      const stepS = React.useState(10000);
      const rawStep = stepS[0];
      const setStep = stepS[1];

      const playS = React.useState(false);
      const playing = playS[0];
      const setPlaying = playS[1];

      const selS = React.useState(null);
      const selectedId = selS[0];
      const setSelectedId = selS[1];

      const hoverS = React.useState(null);
      const hover = hoverS[0];
      const setHover = hoverS[1];

      const optS = React.useState({
        showLabels: true,
        showHeat: true,
        showLinks: true,
        autoRotate: false,
        spacing: 1,
        channels: 10,
      });
      const opts = optS[0];
      const setOpts = optS[1];

      const canvasRef = React.useRef(null);
      const apiRef = React.useRef(null);
      const stepRef = React.useRef(0);
      const [apiVersion, setApiVersion] = React.useState(0);

      const spec = React.useMemo(function () {
        if (draft) return draft;
        const p = presetById(presetId);
        return {
          id: p.id,
          label: p.label,
          family: p.family,
          input: p.input,
          layers: p.layers,
          vocab: p.vocab,
          steps: p.steps,
        };
      }, [presetId, draft]);

      const arch = React.useMemo(function () { return inferArch(spec); }, [spec]);
      const sample = React.useMemo(function () { return sampleById(arch.family, sampleId); }, [arch.family, sampleId]);
      const act = React.useMemo(function () {
        return computeActivations(arch, sample, { channels: opts.channels });
      }, [arch, sample, opts.channels]);
      const scene = React.useMemo(function () {
        return buildScene(arch, act, { spacing: opts.spacing, channels: opts.channels });
      }, [arch, act, opts.spacing, opts.channels]);

      const last = Math.max(0, arch.nodes.length - 1);
      const step = clamp(rawStep, 0, last);
      stepRef.current = step;

      React.useEffect(function () {
        if (rawStep > last) setStep(last);
      }, [rawStep, last]);

      /* ---------- renderer lifetime ---------- */
      React.useEffect(function () {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const api = createLab3D(canvas, {
          onHover: function (info) { setHover(info); },
          onSelect: function (id, sn) {
            setSelectedId(id);
            if (sn && sn.index != null && sn.index > stepRef.current) setStep(sn.index);
          },
        });
        if (!api) return undefined;
        apiRef.current = api;
        api.setScene(scene);
        api.setReveal(step);
        api.setDisplay(opts);
        api.start();
        setApiVersion(function (v) { return v + 1; });
        return function () {
          api.dispose();
          apiRef.current = null;
        };
      }, []);

      React.useEffect(function () {
        if (apiRef.current) apiRef.current.setScene(scene);
      }, [scene]);

      React.useEffect(function () {
        if (apiRef.current) apiRef.current.setSelected(selectedId);
      }, [selectedId, apiVersion]);

      React.useEffect(function () {
        if (apiRef.current) apiRef.current.setReveal(step);
      }, [step, apiVersion]);

      React.useEffect(function () {
        if (apiRef.current) apiRef.current.setDisplay(opts);
      }, [opts, apiVersion]);

      /* ---------- playback ---------- */
      React.useEffect(function () {
        if (!playing) return undefined;
        if (step >= last) {
          setPlaying(false);
          return undefined;
        }
        const timer = window.setTimeout(function () {
          setStep(function (s) { return Math.min(last, clamp(s, 0, last) + 1); });
        }, 950);
        return function () { window.clearTimeout(timer); };
      }, [playing, step, last]);

      function run() {
        if (playing) { setPlaying(false); return; }
        setStep(0);
        setPlaying(true);
      }

      function stepBy(delta) {
        setPlaying(false);
        setStep(function (s) { return clamp(clamp(s, 0, last) + delta, 0, last); });
      }

      function choosePreset(id) {
        const p = presetById(id);
        setPresetId(id);
        setDraft(null);
        setSampleId(p.sample || (p.family === 'rnn' ? 'chars' : 'digit3'));
        setSelectedId(null);
        setStep(10000);
        setPlaying(false);
      }

      function startEditing() {
        const base = spec;
        setDraft({
          id: 'custom',
          label: null,
          family: base.family,
          input: base.input,
          layers: base.layers.map(function (L) { return Object.assign({}, L); }),
          vocab: base.vocab,
          steps: base.steps,
        });
        setStep(10000);
      }

      function updateLayer(index, patch) {
        setDraft(function (prev) {
          if (!prev) return prev;
          return Object.assign({}, prev, {
            layers: prev.layers.map(function (L, i) {
              return i === index ? Object.assign({}, L, patch) : L;
            }),
          });
        });
      }

      function removeLayer(index) {
        setDraft(function (prev) {
          if (!prev) return prev;
          return Object.assign({}, prev, {
            layers: prev.layers.filter(function (L, i) { return i !== index; }),
          });
        });
        setStep(10000);
      }

      function addLayer(kind) {
        setDraft(function (prev) {
          if (!prev) return prev;
          const L = { kind: kind, name: kind + (prev.layers.length + 1) };
          if (kind === 'conv') { L.out = 32; L.k = 3; L.s = 1; }
          if (kind === 'pool') { L.k = 2; L.s = 2; }
          if (kind === 'fc') { L.units = 128; }
          if (kind === 'rnn') { L.units = 32; }
          return Object.assign({}, prev, { layers: prev.layers.concat([L]) });
        });
        setStep(10000);
      }

      /* ---------- keyboard ---------- */
      React.useEffect(function () {
        function onKey(ev) {
          const el = ev.target;
          const tag = el && el.tagName ? String(el.tagName).toLowerCase() : '';
          if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
          if (ev.key === 'ArrowRight') {
            ev.preventDefault();
            stepBy(1);
          } else if (ev.key === 'ArrowLeft') {
            ev.preventDefault();
            stepBy(-1);
          } else if (ev.key === ' ') {
            ev.preventDefault();
            run();
          } else if (ev.key === 'r' || ev.key === 'R') {
            if (apiRef.current) apiRef.current.overview();
          }
        }
        window.addEventListener('keydown', onKey);
        return function () { window.removeEventListener('keydown', onKey); };
      }, [last, playing]);

      function updateOpts(patch) {
        setOpts(function (prev) { return Object.assign({}, prev, patch); });
      }

      function slider(key, value, min, max, stepSize, onChange) {
        return h('label', { className: 'nn3-slider', key: key },
          h('div', { className: 'nn3-row' },
            h('span', null, t(key)),
            h('span', { className: 'nn3-val' }, String(value))),
          h('input', {
            className: 'nn3-range', type: 'range', min: min, max: max, step: stepSize, value: value,
            'aria-label': t(key),
            onChange: function (ev) { onChange(Number(ev.target.value)); },
          }));
      }

      function check(key, value, onChange) {
        return h('label', { className: 'nn3-check', key: key },
          h('input', {
            type: 'checkbox', checked: !!value,
            onChange: function (ev) { onChange(ev.target.checked); },
          }),
          h('span', null, t(key)));
      }

      /* ---------- derived ---------- */
      const sceneNodes = scene.nodes;
      const activeNode = sceneNodes[step] || null;
      const selectedNode = selectedId
        ? sceneNodes.filter(function (sn) { return sn.id === selectedId; })[0] || null
        : null;
      const selAct = selectedNode ? act.byNode[selectedNode.index] : null;
      const samples = samplesFor(arch.family);
      const prediction = act.prediction;

      const sub = arch.family === 'rnn' ? t('app.subRnn') : (arch.family === 'mlp' ? t('app.subMlp') : t('app.subCnn'));

      /* ---------- header ---------- */
      const header = h('div', { className: 'nn3-top' },
        h(BrandMark),
        h('div', { className: 'nn3-brand' },
          h('div', { className: 'nn3-title' }, t('app.title')),
          h('div', { className: 'nn3-sub' }, sub)),
        h('select', {
          className: 'nn3-select', value: draft ? 'custom' : presetId, 'aria-label': t('arch.preset'),
          onChange: function (ev) {
            const id = ev.target.value;
            if (id === 'custom') return;
            choosePreset(id);
          },
        },
          draft ? h('option', { key: 'custom', value: 'custom' }, t('arch.custom')) : null,
          PRESETS.map(function (p) { return h('option', { key: p.id, value: p.id }, p.label); })),
        h('button', {
          type: 'button', className: 'nn3-btn',
          'data-active': draft ? 'true' : 'false',
          onClick: function () { if (draft) { setDraft(null); setStep(10000); } else startEditing(); },
        }, draft ? t('arch.reset') : t('arch.edit')),
        h('div', { className: 'nn3-btnrow' },
          ['iso', 'front', 'top', 'side'].map(function (name) {
            return h('button', {
              key: name, type: 'button', className: 'nn3-btn',
              onClick: function () { if (apiRef.current) apiRef.current.setView(name); },
            }, t('btn.' + name));
          })),
        h('button', {
          type: 'button', className: 'nn3-btn',
          onClick: function () { if (apiRef.current) apiRef.current.overview(); },
        }, t('btn.resetView')),
        h('span', { className: 'nn3-pill', 'data-done': step >= last ? 'true' : 'false' },
          step >= last ? t('pass.done') : t('pass.at', { n: step + 1, total: arch.nodes.length, name: activeNode ? activeNode.name : '' }))
      );

      /* ---------- left column ---------- */
      const layerRows = sceneNodes.map(function (sn) {
        const passed = sn.index <= step;
        return h('button', {
          key: sn.id,
          type: 'button',
          className: 'nn3-lrow',
          'data-active': selectedId === sn.id ? 'true' : 'false',
          onClick: function () { setSelectedId(sn.id); if (sn.index > step) setStep(sn.index); },
        },
          h('span', { className: 'nn3-dot', style: { background: sn.color } }),
          h('span', { className: 'nn3-lname' }, sn.name),
          h('span', { className: 'nn3-lshape' }, sn.shape),
          passed ? h('span', { className: 'nn3-done' }, '✓') : null);
      });

      const left = h('div', { className: 'nn3-left' },
        h('div', { className: 'nn3-card' },
          h('div', { className: 'nn3-cardhead' },
            h('div', { className: 'nn3-cardtitle' }, t('arch.title')),
            h('span', { className: 'nn3-cap' }, draft ? t('arch.custom') : (spec.label || ''))),
          h('div', { className: 'nn3-btnrow' },
            PRESETS.map(function (p) {
              return h('button', {
                key: p.id, type: 'button', className: 'nn3-btn',
                'data-active': !draft && presetId === p.id ? 'true' : 'false',
                onClick: function () { choosePreset(p.id); },
              }, p.label);
            })),
          h('div', { className: 'nn3-note' },
            t('preset.' + (draft ? presetId : spec.id)))),
        h('div', { className: 'nn3-card' },
          h('div', { className: 'nn3-cardhead' },
            h('div', { className: 'nn3-cardtitle' }, t('layer.title')),
            h('span', { className: 'nn3-cap' }, String(arch.nodes.length))),
          h('div', { className: 'nn3-list' }, layerRows)),
        draft ? h('div', { className: 'nn3-card' },
          h('div', { className: 'nn3-cardhead' },
            h('div', { className: 'nn3-cardtitle' }, t('custom.title')),
            h('button', {
              type: 'button', className: 'nn3-btn',
              onClick: function () { setDraft(null); setStep(10000); },
            }, t('arch.reset'))),
          h('div', { className: 'nn3-list' }, draft.layers.map(function (L, i) {
            return h('div', { className: 'nn3-editrow', key: i },
              h('span', { className: 'tag' }, t('kind.' + (L.kind || 'conv')).slice(0, 6)),
              (L.kind === 'conv' || L.kind === 'pool') ? h('input', {
                className: 'nn3-num', type: 'number', min: 1, max: 11, value: L.k,
                'aria-label': t('custom.k'),
                onChange: function (ev) { updateLayer(i, { k: clamp(Number(ev.target.value) || 1, 1, 11) }); },
              }) : null,
              (L.kind === 'conv') ? h('input', {
                className: 'nn3-num', type: 'number', min: 1, max: 4096, value: L.out,
                'aria-label': t('custom.ch'),
                onChange: function (ev) { updateLayer(i, { out: clamp(Number(ev.target.value) || 1, 1, 4096) }); },
              }) : null,
              (L.kind === 'pool') ? h('span', { className: 'nn3-cap' }, 'max') : null,
              (L.kind === 'fc' || L.kind === 'rnn') ? h('input', {
                className: 'nn3-num', type: 'number', min: 1, max: 4096, value: L.units,
                'aria-label': t('custom.units'),
                onChange: function (ev) { updateLayer(i, { units: clamp(Number(ev.target.value) || 1, 1, 4096) }); },
              }) : null,
              (L.kind === 'out') ? h('span', { className: 'nn3-cap' }, t('custom.out') + ' ' + L.units) : null,
              h('button', {
                type: 'button', className: 'nn3-x', 'aria-label': t('custom.remove'),
                onClick: function () { removeLayer(i); },
              }, '×'));
          })),
          h('div', { className: 'nn3-btnrow' },
            h('button', { type: 'button', className: 'nn3-btn', onClick: function () { addLayer('conv'); } }, t('custom.addConv')),
            h('button', { type: 'button', className: 'nn3-btn', onClick: function () { addLayer('pool'); } }, t('custom.addPool')),
            h('button', { type: 'button', className: 'nn3-btn', onClick: function () { addLayer('fc'); } }, t('custom.addFc')),
            h('button', { type: 'button', className: 'nn3-btn', onClick: function () { addLayer('rnn'); } }, t('custom.addRnn'))),
          h('div', { className: 'nn3-note' }, t('custom.hint')),
          arch.stats.dropped ? h('div', { className: 'nn3-note' }, t('custom.limit')) : null) : null
      );

      /* ---------- right column ---------- */
      const passCard = h('div', { className: 'nn3-card' },
        h('div', { className: 'nn3-cardhead' },
          h('div', { className: 'nn3-cardtitle' }, t('pass.title')),
          h('span', { className: 'nn3-cap' }, t('pass.realtime'))),
        h('div', { className: 'nn3-row' },
          h('span', null, t('pass.input')),
          h('select', {
            className: 'nn3-select', value: sample.id, 'aria-label': t('pass.input'),
            onChange: function (ev) { setSampleId(ev.target.value); },
          }, samples.map(function (s) { return h('option', { key: s.id, value: s.id }, s.label()); }))),
        h('div', { className: 'nn3-btnrow' },
          h('button', { type: 'button', className: 'nn3-btn', onClick: function () { stepBy(-1); } }, '‹ ' + t('pass.stepBack')),
          h('button', {
            type: 'button', className: 'nn3-btn', 'data-active': playing ? 'true' : 'false',
            onClick: run,
          }, playing ? t('pass.pause') : t('pass.play')),
          h('button', { type: 'button', className: 'nn3-btn', onClick: function () { stepBy(1); } }, t('pass.stepFwd') + ' ›'),
          h('button', {
            type: 'button', className: 'nn3-btn',
            onClick: function () { setPlaying(false); setStep(0); },
          }, t('pass.reset'))),
        h('div', { className: 'nn3-row' },
          h('span', null, step >= last ? t('pass.done') : t('pass.idle')),
          h('span', { className: 'nn3-val' }, (step + 1) + '/' + arch.nodes.length)),
        h('div', { className: 'nn3-meter' },
          h('i', { style: { width: (100 * (step + 1) / arch.nodes.length).toFixed(1) + '%' } })),
        prediction ? h('div', null,
          h('div', { className: 'nn3-cap', style: { marginBottom: '3px' } }, t('insp.pred')),
          prediction.top.map(function (row) {
            return h('div', { className: 'nn3-wrow', key: row.label + row.index },
              h('span', { style: { flex: '0 0 44px' } }, row.label),
              h('span', { className: 'bar' }, h('i', { style: { width: (row.p * 100).toFixed(1) + '%' } })),
              h('span', { className: 'num' }, (row.p * 100).toFixed(1) + '%'));
          })) : h('div', { className: 'nn3-note' }, t('pred.none'))
      );

      const maps = selAct && selAct.channels ? selAct.channels.slice(0, 6) : [];
      const inspCard = h('div', { className: 'nn3-card' },
        h('div', { className: 'nn3-cardhead' },
          h('div', { className: 'nn3-cardtitle' }, t('insp.title')),
          selectedNode
            ? h('button', {
              type: 'button', className: 'nn3-btn',
              onClick: function () { if (apiRef.current) apiRef.current.focusNode(selectedNode); },
            }, t('mode.focus'))
            : h('span', { className: 'nn3-cap' }, t('mode.flow'))),
        !selectedNode ? h('div', { className: 'nn3-empty' }, t('insp.empty')) : h('div', null,
          h('div', { className: 'nn3-row' },
            h('span', { style: { color: selectedNode.color, fontWeight: 600 } }, selectedNode.name),
            h('span', { className: 'nn3-cap' }, t('kind.' + selectedNode.kind))),
          kvRow(t('insp.shape'), selectedNode.shape),
          selectedNode.kind === 'conv' || selectedNode.kind === 'pool'
            ? kvRow(t('insp.kernel'), selectedNode.node.k + '×' + selectedNode.node.k + ' · ' + selectedNode.node.s)
            : null,
          selectedNode.step != null ? kvRow(t('insp.time'), t('insp.step', { t: selectedNode.step + 1 })) : null,
          kvRow(t('insp.params'), fmtCount(selectedNode.node.params)),
          kvRow(t('insp.macs'), fmtCount(selectedNode.node.macs)),
          kvRow(t('insp.rf'), selectedNode.node.rf + '×' + selectedNode.node.rf),
          h('div', null,
            h('div', { className: 'nn3-row' },
              h('span', null, t('insp.share')),
              h('span', { className: 'nn3-val' }, (nodeShare(arch, selectedNode.node) * 100).toFixed(1) + '%')),
            h('div', { className: 'nn3-meter' },
              h('i', { style: { width: (nodeShare(arch, selectedNode.node) * 100).toFixed(1) + '%' } }))),
          h('div', { className: 'nn3-note' }, t('note.' + (selectedNode.kind === 'out' ? 'out' : selectedNode.kind))),
          h('div', { className: 'nn3-note', style: { fontFamily: 'ui-monospace, Menlo, monospace' } },
            t('f.' + (selectedNode.kind === 'out' ? 'out' : selectedNode.kind))),
          maps.length ? h('div', null,
            h('div', { className: 'nn3-cap', style: { marginBottom: '4px' } }, t('insp.act')),
            h('div', { className: 'nn3-maps' }, maps.map(function (m, i) {
              return h('div', { key: i, style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
                h(CellGrid, { gw: m.gw, gh: m.gh, cells: m.cells, size: 42 }),
                h('span', { className: 'nn3-cap', style: { textAlign: 'center' } }, t('insp.channel', { n: i + 1 })));
            }))) : null)
      );

      const legendCard = h('div', { className: 'nn3-card' },
        h('div', { className: 'nn3-cardhead' }, h('div', { className: 'nn3-cardtitle' }, t('legend.title'))),
        h('div', { className: 'nn3-legend' },
          legRow(KIND_COLOR.input, t('legend.input'), 'i'),
          legRow(KIND_COLOR.conv, t('legend.conv'), 'c'),
          legRow(KIND_COLOR.pool, t('legend.pool'), 'p'),
          legRow(KIND_COLOR.fc, t('legend.fc'), 'f'),
          arch.family === 'rnn' ? legRow(KIND_COLOR.rnn, t('legend.rnn'), 'r') : null,
          arch.family === 'rnn' ? legRow(KIND_COLOR.out, t('legend.recur'), 'rc') : null,
          arch.family === 'cnn' ? legRow('#ffd166', t('legend.skip'), 's') : null,
          legRow('#7fb2ff', t('legend.flow'), 'fl'),
          legRow(PALETTE[15], t('legend.heat'), 'h')))
      ;

      const displayCard = h('div', { className: 'nn3-card' },
        h('div', { className: 'nn3-cardhead' },
          h('div', { className: 'nn3-cardtitle' }, t('disp.title')),
          h('span', { className: 'nn3-cap' }, t('hint.drag'))),
        h('div', { className: 'nn3-btnrow' },
          check('disp.labels', opts.showLabels, function (v) { updateOpts({ showLabels: v }); }),
          check('disp.heat', opts.showHeat, function (v) { updateOpts({ showHeat: v }); })),
        h('div', { className: 'nn3-btnrow' },
          check('disp.links', opts.showLinks, function (v) { updateOpts({ showLinks: v }); }),
          check('disp.rotate', opts.autoRotate, function (v) { updateOpts({ autoRotate: v }); })),
        slider('disp.spacing', opts.spacing, 0.4, 2.4, 0.1, function (v) { updateOpts({ spacing: v }); }),
        slider('disp.channels', opts.channels, 2, 20, 1, function (v) { updateOpts({ channels: v }); }));

      const right = h('div', { className: 'nn3-right' }, passCard, inspCard, displayCard, legendCard);

      /* ---------- bottom bar ---------- */
      const bottom = h('div', { className: 'nn3-bottom' },
        h('span', null, t('hint.bar')),
        h('div', { style: { flex: '1 1 auto' } }),
        h('div', { className: 'nn3-chips' },
          chip(t('stat.params'), fmtCount(arch.stats.params)),
          chip(t('stat.macs'), fmtCount(arch.stats.macs)),
          chip(t('stat.depth'), String(arch.stats.depth)),
          chip(t('stat.rf'), String(arch.stats.rf) + '×'),
          chip(t('stat.width'), String(arch.stats.widest))),
        activeNode ? h('span', null, h('b', null, activeNode.name), ' · ', activeNode.shape) : null);

      return h('div', { className: 'nn3-root' },
        h('style', { dangerouslySetInnerHTML: { __html: CSS } }),
        h('canvas', {
          className: 'nn3-canvas', ref: canvasRef, role: 'img', 'aria-label': t('app.title'),
        }),
        header,
        left,
        right,
        bottom,
        hover ? h('div', {
          className: 'nn3-tip',
          style: { left: hover.x + 'px', top: hover.y + 'px' },
        }, nodeTitle(hover.node)) : null
      );
    }

    /* =====================================================================
     * 8. Plugin wiring
     * ===================================================================*/

    function effectOrRun(ctx, fn, label) {
      let ran = false;
      if (ctx && typeof ctx.effect === 'function') {
        try {
          ctx.effect(function () { ran = true; return fn(); }, label);
          return;
        } catch (e) {
          if (ran) return;
        }
      }
      try { fn(); } catch (e) { /* without its slot the panel simply never mounts */ }
    }

    function apply(ctx) {
      hostCtx = ctx;
      const loc = ctx.get('locale');
      if (loc) {
        localeFace = loc;
        effectOrRun(ctx, function () {
          const disposers = [];
          try {
            if (typeof loc.register === 'function') disposers.push(loc.register(NS, 'en', DICT_EN));
          } catch (e) { /* namespace may already exist */ }
          try {
            if (typeof loc.register === 'function') disposers.push(loc.register(NS, 'zh', DICT_ZH));
          } catch (e) { /* namespace may already exist */ }
          try {
            if (typeof loc.bind === 'function') boundTranslate = loc.bind(NS);
          } catch (e) { boundTranslate = null; }
          return function () {
            for (let i = 0; i < disposers.length; i += 1) {
              try { disposers[i](); } catch (e) { /* already disposed */ }
            }
            boundTranslate = null;
          };
        }, 'neuralnet3d:locale');
      }

      const slots = ctx.get('slots');
      if (!slots || typeof slots.inject !== 'function' || typeof slots.register !== 'function') return;

      effectOrRun(ctx, function () {
        return slots.inject('sidebar.panellist', function () {
          return slots.register({
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: 30,
            label: function () { return t('app.title'); },
          }, PanelIcon);
        });
      }, 'neuralnet3d:panellist');

      effectOrRun(ctx, function () {
        return slots.inject('main', function () {
          return slots.register({ name: 'main', key: PANEL_ID }, LabPage);
        });
      }, 'neuralnet3d:main');
    }

    return {
      inject: ['slots'],
      apply: apply,
      __internals: {
        inferArch: inferArch,
        buildScene: buildScene,
        computeActivations: computeActivations,
        samplesFor: samplesFor,
        sampleById: sampleById,
        PRESETS: PRESETS,
        fmtCount: fmtCount,
        PALETTE: PALETTE,
      },
    };
  },
});
