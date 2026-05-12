/**
 * vis-network topology: static fallback or server JSON from createDiagrams (nodes/edges).
 */
(function () {
  "use strict";

  const STATIC_NODES = [
    { id: "agent_315431", label: "Frankfurt, Germany\ncloud", group: "agent" },
    { id: "agent_1332303", label: "TECOPS-2278-02\n10.1.17.124", group: "agent" },
    { id: "agent_1467088", label: "R1-ISR1121-X-01\n1.1.1.2", group: "agent" },
    { id: "agent_1606666", label: "R1-ASR1001-X-01\n10.1.18.41", group: "agent" },
    { id: "agent_1610058", label: "R1-C9300-24UX-01\n10.1.20.4", group: "agent" },
    { id: "test_7031323", label: "MSTeams - DNS - External\nType: dns-trace", group: "test" },
    { id: "test_7031325", label: "MSTeams - Video - Internal\nType: agent-to-server", group: "test" },
    { id: "test_7031313", label: "MSTeams - DNS - Internal\nType: dns-server", group: "test" },
    { id: "test_7031316", label: "MSTeams - External\nType: agent-to-server", group: "test" },
    { id: "test_7031318", label: "MSTeams - Internal\nType: agent-to-server", group: "test" },
    { id: "test_7031317", label: "MSTeams - Audio - Internal\nType: agent-to-server", group: "test" },
    { id: "target_dummy", label: "Test type not supported (sample)", group: "target" },
    { id: "srv_7031325", label: "worldaz.tr.teams.microsoft.com:443", group: "target" },
    { id: "srv_7031313_2221921", label: "ns1-39.azure-dns.com", group: "target" },
    { id: "srv_7031313_2241766", label: "ns2-39.azure-dns.net", group: "target" },
    { id: "srv_7031313_2241771", label: "ns3-39.azure-dns.org", group: "target" },
    { id: "srv_7031313_2245711", label: "ns4-39.azure-dns.info", group: "target" },
    { id: "srv_7031316", label: "worldaz.tr.teams.microsoft.com:443", group: "target" },
    { id: "srv_7031318", label: "worldaz.tr.teams.microsoft.com:443", group: "target" },
    { id: "srv_7031317", label: "worldaz.tr.teams.microsoft.com:443", group: "target" },
  ];

  const STATIC_EDGES = [
    { from: "agent_315431", to: "test_7031323" },
    { from: "test_7031323", to: "target_dummy", label: "unsupported" },
    { from: "agent_1332303", to: "test_7031325" },
    { from: "agent_1467088", to: "test_7031325" },
    { from: "agent_1606666", to: "test_7031325" },
    { from: "agent_1610058", to: "test_7031325" },
    { from: "test_7031325", to: "srv_7031325", label: "tcp" },
    { from: "agent_1332303", to: "test_7031313" },
    { from: "agent_1606666", to: "test_7031313" },
    { from: "agent_1610058", to: "test_7031313" },
    { from: "test_7031313", to: "srv_7031313_2221921", label: "classic" },
    { from: "test_7031313", to: "srv_7031313_2241766", label: "classic" },
    { from: "test_7031313", to: "srv_7031313_2241771", label: "classic" },
    { from: "test_7031313", to: "srv_7031313_2245711", label: "classic" },
    { from: "agent_315431", to: "test_7031316" },
    { from: "test_7031316", to: "srv_7031316", label: "tcp" },
    { from: "agent_1332303", to: "test_7031318" },
    { from: "agent_1467088", to: "test_7031318" },
    { from: "agent_1606666", to: "test_7031318" },
    { from: "agent_1610058", to: "test_7031318" },
    { from: "test_7031318", to: "srv_7031318", label: "tcp" },
    { from: "agent_1332303", to: "test_7031317" },
    { from: "agent_1467088", to: "test_7031317" },
    { from: "agent_1606666", to: "test_7031317" },
    { from: "agent_1610058", to: "test_7031317" },
    { from: "test_7031317", to: "srv_7031317", label: "tcp" },
  ];

  const fontStack =
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  /** Exact dark canvas for vis (product spec). */
  const TEVIS_VIS_DARK_BG = "#07182D";

  const LIGHT_VIS_CONTAINER_BG =
    "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)";

  /**
   * Light-surface nodes with a “shiny” look: brighter fills, thicker rims, and soft colored glows
   * (vis canvas draws solid fills; depth comes from shadow + border, not gradients).
   */
  const defaultOptions = {
    layout: {
      hierarchical: {
        direction: "LR",
        sortMethod: "directed",
        levelSeparation: 340,
        nodeSpacing: 140,
        treeSpacing: 260,
      },
    },
    groups: {
      agent: {
        shape: "box",
        borderWidth: 3,
        margin: 16,
        color: {
          background: "#fffdf7",
          border: "#f59e0b",
          highlight: { background: "#fffbeb", border: "#d97706" },
          hover: { background: "#fffef5", border: "#ea580c" },
        },
        font: {
          color: "#78350f",
          size: 15,
          face: fontStack,
          multi: false,
          bold: false,
          strokeWidth: 0,
        },
        shadow: {
          enabled: true,
          color: "rgba(245, 158, 11, 0.35)",
          size: 22,
          x: -2,
          y: 4,
        },
        shapeProperties: { borderRadius: 10 },
      },
      test: {
        shape: "box",
        borderWidth: 3,
        margin: 16,
        color: {
          background: "#f0fbff",
          border: "#0ea5e9",
          highlight: { background: "#e0f7ff", border: "#0284c7" },
          hover: { background: "#ecfeff", border: "#0369a1" },
        },
        font: {
          color: "#0c4a6e",
          size: 15,
          face: fontStack,
          bold: false,
          strokeWidth: 0,
        },
        shadow: {
          enabled: true,
          color: "rgba(14, 165, 233, 0.32)",
          size: 22,
          x: -2,
          y: 4,
        },
        shapeProperties: { borderRadius: 10 },
      },
      target: {
        shape: "box",
        borderWidth: 3,
        margin: 16,
        color: {
          background: "#faf8ff",
          border: "#7c3aed",
          highlight: { background: "#f5f3ff", border: "#5b21b6" },
          hover: { background: "#f3e8ff", border: "#6d28d9" },
        },
        font: {
          color: "#1e1b4b",
          size: 14,
          face: fontStack,
          bold: false,
          strokeWidth: 0,
        },
        shadow: {
          enabled: true,
          color: "rgba(124, 58, 237, 0.28)",
          size: 22,
          x: -2,
          y: 4,
        },
        shapeProperties: { borderRadius: 10 },
      },
    },
    nodes: {
      margin: 16,
      borderWidth: 3,
      borderWidthSelected: 4,
      widthConstraint: { maximum: 300 },
      labelHighlightBold: false,
      font: {
        size: 15,
        face: fontStack,
        align: "center",
        vadjust: 0,
        color: "#0f172a",
        strokeWidth: 0,
      },
      shadow: {
        enabled: true,
        color: "rgba(15, 23, 42, 0.14)",
        size: 18,
        x: -1,
        y: 3,
      },
    },
    edges: {
      width: 2,
      color: {
        color: "#94a3b8",
        highlight: "#2563eb",
        hover: "#64748b",
        inherit: false,
      },
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 0.9,
          type: "arrow",
        },
      },
      smooth: { type: "cubicBezier", forceDirection: "horizontal", roundness: 0.35 },
      font: {
        size: 12,
        align: "middle",
        face: fontStack,
        color: "#0f172a",
        strokeWidth: 0,
      },
    },
    physics: false,
    interaction: {
      hover: true,
      hoverConnectedEdges: true,
      navigationButtons: true,
      keyboard: true,
      tooltipDelay: 180,
    },
  };

  function cloneTopologyOptions() {
    return JSON.parse(JSON.stringify(defaultOptions));
  }

  function mergeGroup(base, patch) {
    const g = Object.assign({}, base);
    if (patch.color) {
      g.color = Object.assign({}, base.color, patch.color);
      if (patch.color.highlight) {
        g.color.highlight = Object.assign({}, base.color.highlight, patch.color.highlight);
      }
      if (patch.color.hover) {
        g.color.hover = Object.assign({}, base.color.hover, patch.color.hover);
      }
    }
    if (patch.font) {
      g.font = Object.assign({}, base.font, patch.font);
    }
    if (patch.shadow) {
      g.shadow = Object.assign({}, base.shadow, patch.shadow);
    }
    if (patch.borderWidth != null) {
      g.borderWidth = patch.borderWidth;
    }
    if (patch.shapeProperties) {
      g.shapeProperties = Object.assign({}, base.shapeProperties, patch.shapeProperties);
    }
    return g;
  }

  /** Node/edge colors tuned for canvas background {@link TEVIS_VIS_DARK_BG}. */
  function applyDarkVisTheme(options) {
    const darkGroup = {
      agent: {
        color: {
          background: "#0f3557",
          border: "#fbbf24",
          highlight: { background: "#134a78", border: "#fcd34d" },
          hover: { background: "#164e7a", border: "#fde68a" },
        },
        font: { color: "#fef3c7" },
        shadow: {
          enabled: true,
          color: "rgba(251, 191, 36, 0.35)",
          size: 22,
          x: -2,
          y: 4,
        },
      },
      test: {
        color: {
          background: "#0c3550",
          border: "#38bdf8",
          highlight: { background: "#0e4a6e", border: "#7dd3fc" },
          hover: { background: "#0f5680", border: "#bae6fd" },
        },
        font: { color: "#e0f2fe" },
        shadow: {
          enabled: true,
          color: "rgba(56, 189, 248, 0.35)",
          size: 22,
          x: -2,
          y: 4,
        },
      },
      target: {
        color: {
          background: "#1a2040",
          border: "#a78bfa",
          highlight: { background: "#252a55", border: "#c4b5fd" },
          hover: { background: "#2e3568", border: "#ddd6fe" },
        },
        font: { color: "#ede9fe" },
        shadow: {
          enabled: true,
          color: "rgba(167, 139, 250, 0.32)",
          size: 22,
          x: -2,
          y: 4,
        },
      },
    };
    options.groups.agent = mergeGroup(options.groups.agent, darkGroup.agent);
    options.groups.test = mergeGroup(options.groups.test, darkGroup.test);
    options.groups.target = mergeGroup(options.groups.target, darkGroup.target);
    options.nodes.font = Object.assign({}, options.nodes.font, { color: "#e2e8f0" });
    options.nodes.shadow = Object.assign({}, options.nodes.shadow, {
      color: "rgba(0, 0, 0, 0.45)",
      size: 20,
      x: -1,
      y: 3,
    });
    options.edges.color = Object.assign({}, options.edges.color, {
      color: "#5c6b82",
      highlight: "#38bdf8",
      hover: "#94a3b8",
      inherit: false,
    });
    options.edges.font = Object.assign({}, options.edges.font, { color: "#cbd5e1" });
    return options;
  }

  /**
   * @param {object|null} userOpts - may include `visDarkBackground` (stripped before passing to vis)
   */
  function buildNetworkOptions(userOpts) {
    const opts = userOpts || {};
    const dark = !!opts.visDarkBackground;
    const stripped = Object.assign({}, opts);
    delete stripped.visDarkBackground;
    let options = Object.assign(cloneTopologyOptions(), stripped);
    if (dark) {
      applyDarkVisTheme(options);
    }
    return options;
  }

  function normalizeGraph(data) {
    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      return { nodes: STATIC_NODES, edges: STATIC_EDGES };
    }
    return { nodes: data.nodes, edges: data.edges };
  }

  /**
   * Improves multi-line labels from the API: title line + detail lines with a blank separator read clearer.
   */
  function enrichNodesForReadability(graph) {
    const nodes = (graph.nodes || []).map(function (n) {
      const copy = Object.assign({}, n);
      if (typeof copy.label !== "string" || !copy.label.includes("\n")) {
        return copy;
      }
      const parts = copy.label.split("\n");
      if (parts.length < 2) {
        return copy;
      }
      const title = parts[0].trim();
      const rest = parts
        .slice(1)
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
      copy.label = title + "\n\n" + rest.join("\n");
      return copy;
    });
    return { nodes: nodes, edges: graph.edges || [] };
  }

  /**
   * @param {string} containerId - element id for the graph
   * @param {object|null} [opts] - vis overrides; set `visDarkBackground: true` for canvas {@link TEVIS_VIS_DARK_BG}
   * @param {{nodes: object[], edges: object[]}|null} [data] - from Go createDiagrams JSON; omit to use built-in sample
   * @returns {vis.Network|null}
   */
  function initTevisTopology(containerId, opts, data) {
    if (typeof vis === "undefined") {
      console.error("tevis-topology: vis-network is not loaded");
      return null;
    }
    const el = document.getElementById(containerId);
    if (!el) {
      console.error("tevis-topology: missing container #" + containerId);
      return null;
    }

    const darkBg = !!(opts && opts.visDarkBackground);
    el.style.setProperty("background", darkBg ? TEVIS_VIS_DARK_BG : LIGHT_VIS_CONTAINER_BG, "important");
    el.style.setProperty("border", darkBg ? "1px solid #143d5e" : "1px solid #e2e8f0", "important");
    el.style.borderRadius = "10px";

    if (el._tevisVisNetwork) {
      el._tevisVisNetwork.destroy();
      el._tevisVisNetwork = null;
    }

    const g = enrichNodesForReadability(normalizeGraph(data));
    const nodes = new vis.DataSet(g.nodes);
    const edges = new vis.DataSet(g.edges);
    const options = buildNetworkOptions(opts);

    const network = new vis.Network(el, { nodes, edges }, options);
    el._tevisVisNetwork = network;
    requestAnimationFrame(function () {
      network.fit({ padding: 48, animation: { duration: 250, easingFunction: "easeInOutQuad" } });
    });
    return network;
  }

  window.tevisTopologyInit = initTevisTopology;
  window.TEVIS_VIS_DARK_BG = TEVIS_VIS_DARK_BG;
  window.tevisTopologyStatic = {
    nodes: STATIC_NODES,
    edges: STATIC_EDGES,
    init: initTevisTopology,
    darkBg: TEVIS_VIS_DARK_BG,
  };
})();
