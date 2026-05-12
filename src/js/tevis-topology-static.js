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
        borderWidth: 2,
        margin: 16,
        color: {
          background: "#fffbeb",
          border: "#d97706",
          highlight: { background: "#fef3c7", border: "#b45309" },
          hover: { background: "#fff7ed", border: "#ea580c" },
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
          color: "rgba(15, 23, 42, 0.08)",
          size: 10,
          x: 0,
          y: 2,
        },
        shapeProperties: { borderRadius: 8 },
      },
      test: {
        shape: "box",
        borderWidth: 2,
        margin: 16,
        color: {
          background: "#f0f9ff",
          border: "#0284c7",
          highlight: { background: "#e0f2fe", border: "#0369a1" },
          hover: { background: "#e0f2fe", border: "#0c4a6e" },
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
          color: "rgba(15, 23, 42, 0.08)",
          size: 10,
          x: 0,
          y: 2,
        },
        shapeProperties: { borderRadius: 8 },
      },
      target: {
        shape: "box",
        borderWidth: 2,
        margin: 16,
        color: {
          background: "#f5f3ff",
          border: "#5b21b6",
          highlight: { background: "#ede9fe", border: "#4c1d95" },
          hover: { background: "#ede9fe", border: "#6d28d9" },
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
          color: "rgba(15, 23, 42, 0.08)",
          size: 10,
          x: 0,
          y: 2,
        },
        shapeProperties: { borderRadius: 8 },
      },
    },
    nodes: {
      margin: 16,
      borderWidth: 2,
      borderWidthSelected: 3,
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
        color: "rgba(15, 23, 42, 0.06)",
        size: 8,
        x: 0,
        y: 2,
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
   * @param {object|null} [opts] - optional vis.Network options overrides
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

    el.style.background = "#f1f5f9";
    el.style.borderRadius = "10px";

    const g = enrichNodesForReadability(normalizeGraph(data));
    const nodes = new vis.DataSet(g.nodes);
    const edges = new vis.DataSet(g.edges);
    const options = opts ? Object.assign({}, defaultOptions, opts) : defaultOptions;

    const network = new vis.Network(el, { nodes, edges }, options);
    requestAnimationFrame(function () {
      network.fit({ padding: 48, animation: { duration: 250, easingFunction: "easeInOutQuad" } });
    });
    return network;
  }

  window.tevisTopologyInit = initTevisTopology;
  window.tevisTopologyStatic = {
    nodes: STATIC_NODES,
    edges: STATIC_EDGES,
    init: initTevisTopology,
  };
})();
