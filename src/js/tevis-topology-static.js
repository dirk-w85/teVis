/**
 * Apache ECharts topology: static fallback or server JSON from createDiagrams (nodes/edges).
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

  /** Exact dark canvas (product spec). Kept as TEVIS_VIS_DARK_BG for template compatibility. */
  const TEVIS_VIS_DARK_BG = "#07182D";

  const LIGHT_CONTAINER_BG = "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)";

  const GROUP_CATEGORY = { agent: 0, test: 1, target: 2 };

  const LIGHT_STYLES = {
    agent: {
      fill: "#fffdf7",
      border: "#f59e0b",
      text: "#78350f",
      shadow: "rgba(245, 158, 11, 0.35)",
    },
    test: {
      fill: "#f0fbff",
      border: "#0ea5e9",
      text: "#0c4a6e",
      shadow: "rgba(14, 165, 233, 0.32)",
    },
    target: {
      fill: "#faf8ff",
      border: "#7c3aed",
      text: "#1e1b4b",
      shadow: "rgba(167, 139, 250, 0.28)",
    },
  };

  const DARK_STYLES = {
    agent: {
      fill: "#0f3557",
      border: "#fbbf24",
      text: "#fef3c7",
      shadow: "rgba(251, 191, 36, 0.35)",
    },
    test: {
      fill: "#0c3550",
      border: "#38bdf8",
      text: "#e0f2fe",
      shadow: "rgba(56, 189, 248, 0.35)",
    },
    target: {
      fill: "#1a2040",
      border: "#a78bfa",
      text: "#ede9fe",
      shadow: "rgba(167, 139, 250, 0.32)",
    },
  };

  function normalizeGraph(data) {
    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      return { nodes: STATIC_NODES, edges: STATIC_EDGES };
    }
    return { nodes: data.nodes, edges: data.edges };
  }

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

  function groupLevel(group) {
    if (group === "agent") return 0;
    if (group === "target") return 2;
    return 1;
  }

  function wrapLabel(text, maxCharsPerLine) {
    const out = [];
    String(text || "")
      .split("\n")
      .forEach(function (line) {
        line = line.trim();
        if (!line) {
          out.push("");
          return;
        }
        while (line.length > maxCharsPerLine) {
          let breakAt = line.lastIndexOf(" ", maxCharsPerLine);
          if (breakAt <= 0) breakAt = maxCharsPerLine;
          out.push(line.slice(0, breakAt).trim());
          line = line.slice(breakAt).trim();
        }
        if (line) out.push(line);
      });
    return out.join("\n");
  }

  function measureNode(label, group) {
    const fontSize = group === "target" ? 12 : 13;
    const charPx = fontSize * 0.58;
    const maxNodeWidth = 340;
    const minWidth = 136;
    const hPad = 32;
    const vPad = 24;
    const lineHeight = fontSize + 5;
    const maxChars = Math.max(12, Math.floor((maxNodeWidth - hPad) / charPx));
    const displayLabel = wrapLabel(label, maxChars);
    const lines = displayLabel.split("\n");
    const maxLen = Math.max(1, ...lines.map(function (l) {
      return l.length;
    }));
    const width = Math.min(maxNodeWidth, Math.max(minWidth, Math.ceil(maxLen * charPx) + hPad));
    const labelWidth = width - hPad;
    const height = Math.max(52, lines.length * lineHeight + vPad);
    return {
      size: [width, height],
      displayLabel: displayLabel,
      fontSize: fontSize,
      lineHeight: lineHeight,
      labelWidth: labelWidth,
    };
  }

  function normalizeDirection(dir) {
    if (dir === "TD" || dir === "UD" || dir === "TB") return "vertical";
    return "horizontal";
  }

  function layoutNodes(rawNodes, direction) {
    const buckets = [[], [], []];
    rawNodes.forEach(function (n) {
      buckets[groupLevel(n.group)].push(n);
    });
    buckets.forEach(function (col) {
      col.sort(function (a, b) {
        return String(a.id).localeCompare(String(b.id));
      });
    });

    const colSep = 380;
    const vertical = normalizeDirection(direction) === "vertical";
    const positioned = [];

    buckets.forEach(function (col, lvl) {
      const rowGap = 24;
      const measuredCol = col.map(function (n) {
        return measureNode(n.label, n.group);
      });
      const maxColHeight = Math.max.apply(
        null,
        measuredCol.map(function (m) {
          return m.size[1];
        })
      );
      const levelSep = maxColHeight + 80;

      col.forEach(function (n, i) {
        const measured = measuredCol[i];
        const rowStep = measured.size[1] + rowGap;
        const offset = i * rowStep - ((col.length - 1) * rowStep) / 2;
        positioned.push(
          Object.assign({}, n, {
            symbolSize: measured.size,
            displayLabel: measured.displayLabel,
            labelFontSize: measured.fontSize,
            labelLineHeight: measured.lineHeight,
            labelWidth: measured.labelWidth,
            x: vertical ? offset : lvl * colSep,
            y: vertical ? lvl * levelSep : offset,
          })
        );
      });
    });
    return positioned;
  }

  function styleForGroup(group, dark) {
    const palette = dark ? DARK_STYLES : LIGHT_STYLES;
    return palette[group] || palette.test;
  }

  function buildEChartsOption(graph, opts) {
    const dark = !!(opts && (opts.visDarkBackground || opts.darkBackground));
    const direction = (opts && (opts.graphDirection || opts.direction)) || "LR";
    const edgeColor = dark ? "#5c6b82" : "#94a3b8";
    const edgeLabelColor = dark ? "#cbd5e1" : "#0f172a";
    const positioned = layoutNodes(graph.nodes, direction);

    const data = positioned.map(function (n) {
      const style = styleForGroup(n.group, dark);
      return {
        id: n.id,
        name: n.displayLabel || n.label,
        x: n.x,
        y: n.y,
        symbol: "roundRect",
        symbolSize: n.symbolSize,
        category: GROUP_CATEGORY[n.group] != null ? GROUP_CATEGORY[n.group] : 1,
        itemStyle: {
          color: style.fill,
          borderColor: style.border,
          borderWidth: 3,
          shadowBlur: 18,
          shadowColor: style.shadow,
          shadowOffsetX: -2,
          shadowOffsetY: 4,
        },
        label: {
          show: true,
          color: style.text,
          fontSize: n.labelFontSize || 13,
          fontFamily: fontStack,
          lineHeight: n.labelLineHeight || 18,
          width: n.labelWidth,
          overflow: "break",
          align: "center",
          verticalAlign: "middle",
        },
      };
    });

    const links = (graph.edges || []).map(function (e) {
      const link = {
        source: e.from,
        target: e.to,
        lineStyle: {
          color: edgeColor,
          width: 2,
          curveness: 0,
        },
      };
      if (e.label) {
        link.label = {
          show: true,
          formatter: e.label,
          color: edgeLabelColor,
          fontSize: 11,
          fontFamily: fontStack,
        };
      }
      return link;
    });

    return {
      backgroundColor: dark ? TEVIS_VIS_DARK_BG : "transparent",
      animationDuration: 250,
      tooltip: {
        trigger: "item",
        formatter: function (p) {
          if (p.dataType === "edge") {
            const lbl = p.data.label && p.data.label.formatter;
            return lbl ? "Protocol: " + lbl : p.data.source + " → " + p.data.target;
          }
          return (p.data.name || p.name || "").replace(/\n/g, "<br>");
        },
      },
      series: [
        {
          type: "graph",
          layout: "none",
          roam: true,
          draggable: true,
          data: data,
          links: links,
          categories: [{ name: "Agents" }, { name: "Tests" }, { name: "Targets" }],
          edgeSymbol: ["none", "arrow"],
          edgeSymbolSize: 10,
          lineStyle: {
            curveness: 0,
          },
          emphasis: {
            focus: "adjacency",
            lineStyle: { width: 3, color: dark ? "#38bdf8" : "#2563eb", curveness: 0 },
          },
        },
      ],
    };
  }

  function applyContainerChrome(el, dark) {
    el.style.setProperty("background", dark ? TEVIS_VIS_DARK_BG : LIGHT_CONTAINER_BG, "important");
    el.style.setProperty("border", dark ? "1px solid #143d5e" : "1px solid #e2e8f0", "important");
    el.style.borderRadius = "10px";
  }

  function disposeChart(el) {
    if (el._tevisResizeHandler) {
      window.removeEventListener("resize", el._tevisResizeHandler);
      el._tevisResizeHandler = null;
    }
    if (el._tevisChart) {
      el._tevisChart.dispose();
      el._tevisChart = null;
    }
  }

  /**
   * @param {string} containerId
   * @param {object|null} [opts] - visDarkBackground / darkBackground, graphDirection (LR|TD|UD)
   * @param {{nodes: object[], edges: object[]}|null} [data]
   * @returns {echarts.ECharts|null}
   */
  function initTevisTopology(containerId, opts, data) {
    if (typeof echarts === "undefined") {
      console.error("tevis-topology: Apache ECharts is not loaded");
      return null;
    }
    const el = document.getElementById(containerId);
    if (!el) {
      console.error("tevis-topology: missing container #" + containerId);
      return null;
    }

    const userOpts = opts || {};
    const dark = !!(userOpts.visDarkBackground || userOpts.darkBackground);
    applyContainerChrome(el, dark);
    disposeChart(el);

    const graph = enrichNodesForReadability(normalizeGraph(data));
    el._tevisLastData = graph;
    el._tevisLastOpts = Object.assign({}, userOpts);

    const chart = echarts.init(el, null, { renderer: "canvas" });
    chart.setOption(buildEChartsOption(graph, el._tevisLastOpts));

    const onResize = function () {
      chart.resize();
    };
    el._tevisResizeHandler = onResize;
    window.addEventListener("resize", onResize);
    el._tevisChart = chart;

    requestAnimationFrame(function () {
      chart.resize();
    });
    return chart;
  }

  function setTevisTopologyDirection(containerId, direction) {
    const el = document.getElementById(containerId);
    if (!el || !el._tevisLastData) return null;
    const opts = Object.assign({}, el._tevisLastOpts || {}, { graphDirection: direction });
    return initTevisTopology(containerId, opts, el._tevisLastData);
  }

  window.tevisTopologyInit = initTevisTopology;
  window.tevisTopologySetDirection = setTevisTopologyDirection;
  window.TEVIS_VIS_DARK_BG = TEVIS_VIS_DARK_BG;
  window.tevisTopologyStatic = {
    nodes: STATIC_NODES,
    edges: STATIC_EDGES,
    init: initTevisTopology,
    darkBg: TEVIS_VIS_DARK_BG,
  };
})();
