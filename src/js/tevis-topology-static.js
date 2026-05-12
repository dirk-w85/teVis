/**
 * Static sample topology for vis-network (agents → tests → targets).
 * Replace STATIC_NODES / STATIC_EDGES or load from fetch() when wiring the backend.
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

  const defaultOptions = {
    layout: {
      hierarchical: {
        direction: "LR",
        sortMethod: "directed",
        levelSeparation: 280,
        nodeSpacing: 110,
        treeSpacing: 220,
      },
    },
    groups: {
      agent: {
        color: { background: "#FF9000", border: "#E58200" },
        font: { color: "#ffffff" },
        shape: "ellipse",
      },
      test: {
        color: { background: "#02C8FF", border: "#00A8D6" },
        font: { color: "#07182D" },
        shape: "box",
      },
      target: {
        color: { background: "#0A60FF", border: "#0848CC" },
        font: { color: "#ffffff" },
        shape: "box",
      },
    },
    nodes: { margin: 12, font: { size: 14, face: "system-ui, sans-serif" } },
    edges: {
      arrows: { to: { enabled: true, scaleFactor: 0.75 } },
      smooth: { type: "cubicBezier", forceDirection: "horizontal", roundness: 0.35 },
      font: { size: 11, align: "middle" },
    },
    physics: false,
    interaction: { hover: true, navigationButtons: true, keyboard: true },
  };

  /**
   * @param {string} containerId - element id for the graph
   * @param {object} [opts] - optional vis.Network options overrides
   * @returns {vis.Network|null}
   */
  function initTevisTopology(containerId, opts) {
    if (typeof vis === "undefined") {
      console.error("tevis-topology: vis-network is not loaded");
      return null;
    }
    const el = document.getElementById(containerId);
    if (!el) {
      console.error("tevis-topology: missing container #" + containerId);
      return null;
    }

    const nodes = new vis.DataSet(STATIC_NODES);
    const edges = new vis.DataSet(STATIC_EDGES);
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
