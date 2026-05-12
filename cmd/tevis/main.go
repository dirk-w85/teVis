package main

import (
    "errors"
    "fmt"
    "html/template"    
	"log/slog"
	"os"
    "net/http"
	"github.com/dirk-w85/golang-helper"
	"encoding/json"
	"sort"
	"strings"
	"github.com/gin-gonic/gin"
)

const baseVersion = "v0.3.1."
var curVersion string
var curBuild string

type TEVisSettings struct {
	Version		string
	Build		string
	Token		string
	AID			string
	Label		string
	GraphLook	string
	GraphBrand	string
	GraphDirection	string
	ServerPort	string
	DarkMode	bool
}

type TETestDetail struct {
	Interval        int       `json:"interval"`
	TestID          string    `json:"testId"`
	BgpMeasurements bool      `json:"bgpMeasurements"`
	UsePublicBgp    bool      `json:"usePublicBgp"`
	Description     string    `json:"description"`
	LiveShare       bool      `json:"liveShare"`
	TestName        string    `json:"testName"`
	CreatedBy       string    `json:"createdBy"`
	ModifiedBy      string    `json:"modifiedBy"`
	SavedEvent      bool      `json:"savedEvent"`
	Type            string    `json:"type"`
	AlertsEnabled   bool      `json:"alertsEnabled"`
	Enabled         bool      `json:"enabled"`
	Agents          []struct {
		Prefix            string   `json:"prefix"`
		IPAddresses       []string `json:"ipAddresses"`
		PublicIPAddresses []string `json:"publicIpAddresses"`
		Network           string   `json:"network"`
		AgentID           string   `json:"agentId"`
		AgentName         string   `json:"agentName"`
		AgentType         string   `json:"agentType"`
		CountryID         string   `json:"countryId"`
		Location          string   `json:"location"`
	} `json:"agents"`
	BandwidthMeasurements bool   `json:"bandwidthMeasurements"`
	ContinuousMode        bool   `json:"continuousMode"`
	DscpID                string `json:"dscpId"`
	Ipv6Policy            string `json:"ipv6Policy"`
	MtuMeasurements       bool   `json:"mtuMeasurements"`
	NumPathTraces         int    `json:"numPathTraces"`
	PathTraceMode         string `json:"pathTraceMode"`
	ProbeMode             string `json:"probeMode"`
	NetworkMeasurements   bool   `json:"networkMeasurements"`
	Protocol              string `json:"protocol"`
	RandomizedStartTime   bool   `json:"randomizedStartTime"`
	Server                string `json:"server"`
	Dscp                  string `json:"dscp"`
	Links                 struct {
		Self struct {
			Href string `json:"href"`
		} `json:"self"`
		TestResults []struct {
			Href string `json:"href"`
		} `json:"testResults"`
	} `json:"_links"`
}

// VisNode / VisEdge are serialized for vis-network (same graph as Mermaid in createDiagrams).
type VisNode struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Group string `json:"group"`
}

type VisEdge struct {
	From  string `json:"from"`
	To    string `json:"to"`
	Label string `json:"label,omitempty"`
}

type VisGraph struct {
	Nodes []VisNode `json:"nodes"`
	Edges []VisEdge `json:"edges"`
}

type LabelDiagram struct {
	LabelID  string
	Diagram  string
	DarkMode bool
	VisJSON  template.JS
}

type ALLDiagrams struct {
	Tags []LabelDiagram
}

// TopologyTagOption is one ThousandEyes tag/label for the topology tag dropdown.
type TopologyTagOption struct {
	LabelID    string
	Value      string
	Key        string
	ObjectType string
}

type TEAllAccountGroups struct {
	AccountGroups []struct {
		AccountGroupName      string `json:"accountGroupName"`
		Aid                   string `json:"aid"`
	} `json:"accountGroups"`
}

// TEAPIError is returned by ThousandEyes on failed requests (non-list payloads).
type TEAPIError struct {
	Error            string `json:"error"`
	ErrorDescription string `json:"error_description"`
}

type TEAllTests struct {
	Tests []TETest `json:"tests"`
}

type TETest struct {
		Interval              int       `json:"interval"`
		TestID                string    `json:"testId"`
		BgpMeasurements       bool      `json:"bgpMeasurements"`
		UsePublicBgp          bool      `json:"usePublicBgp"`
		Description           string    `json:"description"`
		LiveShare             bool      `json:"liveShare"`
		TestName              string    `json:"testName"`
		CreatedBy             string    `json:"createdBy"`
		ModifiedBy            string    `json:"modifiedBy"`
		SavedEvent            bool      `json:"savedEvent"`
		Type                  string    `json:"type"`
		AlertsEnabled         bool      `json:"alertsEnabled"`
		Enabled               bool      `json:"enabled"`
		BandwidthMeasurements bool      `json:"bandwidthMeasurements"`
		ContinuousMode        bool      `json:"continuousMode"`
		DscpID                string    `json:"dscpId"`
		Ipv6Policy            string    `json:"ipv6Policy"`
		MtuMeasurements       bool      `json:"mtuMeasurements"`
		NumPathTraces         int       `json:"numPathTraces"`
		PathTraceMode         string    `json:"pathTraceMode"`
		ProbeMode             string    `json:"probeMode"`
		NetworkMeasurements   bool      `json:"networkMeasurements"`
		Protocol              string    `json:"protocol"`
		RandomizedStartTime   bool      `json:"randomizedStartTime"`
		Server                string    `json:"server"`
		Dscp                  string    `json:"dscp"`
		URL                  string    `json:"url"`
		DNSServers		[]struct {
			ServerID		  string 	`json:"serverid"`
			ServerName		  string 	`json:"serverName"`
		} `json:"dnsServers"`
		Links                 struct {
			Self struct {
				Href string `json:"href"`
			} `json:"self"`
			TestResults []struct {
				Href string `json:"href"`
			} `json:"testResults"`
		} `json:"_links"`
}

type TELabels struct {
	Tags []struct {
		ID          string    `json:"id"`
		Aid         int64     `json:"aid"`
		ObjectType  string    `json:"objectType"`
		Key         string    `json:"key"`
		Value       string    `json:"value"`
		Color       string    `json:"color"`
		Icon        string    `json:"icon"`
		Description any       `json:"description"`
		AccessType  string    `json:"accessType"`
		LegacyID    int64     `json:"legacyId"`
		Assignments []struct {
			ID   string `json:"id"`
			Type string `json:"type"`
		} `json:"assignments"`
	} `json:"tags"`
}

type TELabel struct {
		ID          string    `json:"id"`
		Aid         int64     `json:"aid"`
		ObjectType  string    `json:"objectType"`
		Key         string    `json:"key"`
		Value       string    `json:"value"`
		Color       string    `json:"color"`
		Icon        string    `json:"icon"`
		Description any       `json:"description"`
		AccessType  string    `json:"accessType"`
		LegacyID    int64     `json:"legacyId"`
		Assignments []struct {
			ID   string `json:"id"`
			Type string `json:"type"`
		} `json:"assignments"`
}

// firstAgentIP picks a stable display address for enterprise agents without indexing empty slices.
func firstAgentIP(publicIPs, privateIPs []string) string {
	if len(publicIPs) > 0 {
		return publicIPs[0]
	}
	if len(privateIPs) > 0 {
		return privateIPs[0]
	}
	return "no IP"
}

// teJSONUnmarshal parses a ThousandEyes JSON body into dest. On failure it logs and returns false.
func teJSONUnmarshal(context string, body string, dest any) bool {
	if err := json.Unmarshal([]byte(body), dest); err != nil {
		slog.Error("ThousandEyes JSON unmarshal failed", "context", context, "err", err, "bodyLen", len(body))
		return false
	}
	return true
}

func getLabels (teVisSettings TEVisSettings) TELabels {
    slog.Debug("Getting ALL Tags/Labels...")
	slog.Debug("SETTINGS", "Used AID", teVisSettings.AID)
	getData := map[string]string{
		"Token": teVisSettings.Token,
	}
	// Getting TE Labels 
	url := fmt.Sprintf("https://api.thousandeyes.com/v7/tags?expand=assignments&aid="+teVisSettings.AID)
	response := helper.GETrequest(url,getData)
	//fmt.Println(response)
	var teLabels TELabels
	if !teJSONUnmarshal("getLabels", response, &teLabels) {
		return teLabels
	}
	slog.Debug("TAGS", "Tags received", len(teLabels.Tags))
	return teLabels
}

func getAccountGroups(token string) string {
	slog.Debug("getAccountGroups", "Getting ALL Account-Groups...")
	getData := map[string]string{"Token": token}
	url := "https://api.thousandeyes.com/v7/account-groups"
	return helper.GETrequest(url, getData)
}

// fetchAccountGroups loads account groups for a token and parses the JSON body.
func fetchAccountGroups(token string) (TEAllAccountGroups, error) {
	var empty TEAllAccountGroups
	slog.Debug("fetchAccountGroups", "request")
	getData := map[string]string{"Token": token}
	url := "https://api.thousandeyes.com/v7/account-groups"
	body := helper.GETrequest(url, getData)
	var apiErr TEAPIError
	if err := json.Unmarshal([]byte(body), &apiErr); err == nil && apiErr.Error != "" {
		desc := apiErr.ErrorDescription
		if desc == "" {
			desc = apiErr.Error
		}
		return empty, errors.New(desc)
	}
	var out TEAllAccountGroups
	if !teJSONUnmarshal("fetchAccountGroups", body, &out) {
		return empty, errors.New("invalid account-groups response from ThousandEyes")
	}
	return out, nil
}

// lookupDefaultAID returns an account group AID for API calls when the user did not pick one.
// If several groups exist, the first after sorting by name is used (deterministic).
func lookupDefaultAID(token string) (aid string, accountGroupName string, err error) {
	ags, err := fetchAccountGroups(token)
	if err != nil {
		return "", "", err
	}
	if len(ags.AccountGroups) == 0 {
		return "", "", errors.New("no account groups returned for this token")
	}
	sort.Slice(ags.AccountGroups, func(i, j int) bool {
		return strings.ToLower(ags.AccountGroups[i].AccountGroupName) < strings.ToLower(ags.AccountGroups[j].AccountGroupName)
	})
	g := ags.AccountGroups[0]
	if len(ags.AccountGroups) > 1 {
		slog.Info("lookupDefaultAID: multiple account groups; using first by name",
			"chosenAid", g.Aid, "chosenName", g.AccountGroupName, "total", len(ags.AccountGroups))
	}
	return g.Aid, g.AccountGroupName, nil
}

// ensureAID sets settings.AID from the token when the form did not send an account group.
func ensureAID(s *TEVisSettings) error {
	if strings.TrimSpace(s.AID) != "" {
		return nil
	}
	if strings.TrimSpace(s.Token) == "" {
		return errors.New("bearer token is required")
	}
	aid, name, err := lookupDefaultAID(s.Token)
	if err != nil {
		return err
	}
	s.AID = aid
	slog.Debug("ensureAID", "resolved", "aid", aid, "accountGroupName", name)
	return nil
}

func getLabels2 (token string, aid string) string {
    slog.Debug("getLabels2", "Getting ALL Labels...")
	getData := map[string]string{
		"Token": token,
	}
	// Getting TE Labels 
	url := fmt.Sprintf("https://api.thousandeyes.com/v7/tags?aid="+aid+"&expand=assignments")
	response := helper.GETrequest(url,getData)
	//fmt.Println(response)
	var teLabels TELabels
	if !teJSONUnmarshal("getLabels2", response, &teLabels) {
		return response
	}
	slog.Debug("getLabels2", "Labels received", len(teLabels.Tags))

	return response
}

func getLabelDetails (teVisSettings TEVisSettings) TELabel {
	slog.Debug("getLabelDetails", "Getting Details for Label ", teVisSettings.Label)

	getData := map[string]string{
		"Token": teVisSettings.Token,
	}
	 
	url := fmt.Sprintf("https://api.thousandeyes.com/v7/tags/"+teVisSettings.Label+"?expand=assignments&aid="+teVisSettings.AID)
	response := helper.GETrequest(url,getData)
	var teLabel TELabel
	if !teJSONUnmarshal("getLabelDetails", response, &teLabel) {
		return teLabel
	}

	slog.Debug("getLabelDetails", "Assignments for Label", len(teLabel.Assignments))

	return teLabel
}

func graphFromNodeMap(nodes map[string]VisNode, edges []VisEdge) VisGraph {
	ids := make([]string, 0, len(nodes))
	for id := range nodes {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	out := make([]VisNode, 0, len(ids))
	for _, id := range ids {
		out = append(out, nodes[id])
	}
	return VisGraph{Nodes: out, Edges: edges}
}

// topologySelectableTags returns tags that carry test assignments (same filter as the results page).
func topologySelectableTags(teLabels TELabels) []TopologyTagOption {
	var out []TopologyTagOption
	for _, t := range teLabels.Tags {
		if (t.ObjectType != "test" && t.ObjectType != "endpoint-test") || len(t.Assignments) == 0 {
			continue
		}
		out = append(out, TopologyTagOption{
			LabelID:    t.ID,
			Value:      t.Value,
			Key:        t.Key,
			ObjectType: t.ObjectType,
		})
	}
	return out
}

// visGraphForTag builds agents → tests → targets for tests assigned to a single tag (label id).
func visGraphForTag(teLabels TELabels, teAllTests TEAllTests, token string, labelID string) (VisGraph, error) {
	for _, label := range teLabels.Tags {
		if label.ID != labelID {
			continue
		}
		nodes := make(map[string]VisNode)
		var edges []VisEdge
		var scrap []string
		for _, assignedTest := range label.Assignments {
			for _, test := range teAllTests.Tests {
				if test.TestID != assignedTest.ID {
					continue
				}
				detail := getTestDetails(test.Links.Self.Href, token)
				addMermaidAndVisForTest(&scrap, nodes, &edges, test, detail, true)
			}
		}
		return graphFromNodeMap(nodes, edges), nil
	}
	return VisGraph{}, errors.New("tag not found")
}

// addMermaidAndVisForTest appends Mermaid lines and vis nodes/edges for one test (same logic as historical createDiagrams / getDiagram).
func addMermaidAndVisForTest(lines *[]string, nodes map[string]VisNode, edges *[]VisEdge, test TETest, detail TETestDetail, boldTestTitle bool) {
	tid := test.TestID
	testNodeID := "test_" + tid
	var testMermaid string
	if boldTestTitle {
		testMermaid = fmt.Sprintf("test_%s[\"**%s**<br>*Type: %s<br>Interval: %ds*\"]:::teTest", tid, test.TestName, test.Type, test.Interval)
	} else {
		testMermaid = fmt.Sprintf("test_%s[\"%s<br>*Type: %s<br>Interval: %ds*\"]:::teTest", tid, test.TestName, test.Type, test.Interval)
	}
	*lines = append(*lines, testMermaid)
	nodes[testNodeID] = VisNode{
		ID:    testNodeID,
		Label: fmt.Sprintf("%s\nType: %s\nInterval: %ds", test.TestName, test.Type, test.Interval),
		Group: "test",
	}

	for _, agent := range detail.Agents {
		aid := "agent_" + agent.AgentID
		if agent.AgentType == "cloud" {
			*lines = append(*lines, fmt.Sprintf("agent_%s([\"%s<br>*%s*\"]):::teAgent", agent.AgentID, agent.AgentName, agent.AgentType))
			nodes[aid] = VisNode{ID: aid, Label: fmt.Sprintf("%s\n(%s)", agent.AgentName, agent.AgentType), Group: "agent"}
		}
		if agent.AgentType == "enterprise" {
			ip := firstAgentIP(agent.PublicIPAddresses, agent.IPAddresses)
			*lines = append(*lines, fmt.Sprintf("agent_%s([\"%s<br>*%s<br>%s*\"]):::teAgent", agent.AgentID, agent.AgentName, ip, agent.AgentType))
			nodes[aid] = VisNode{ID: aid, Label: fmt.Sprintf("%s\n%s\n(%s)", agent.AgentName, ip, agent.AgentType), Group: "agent"}
		}
	}
	for _, agent := range detail.Agents {
		*edges = append(*edges, VisEdge{From: "agent_" + agent.AgentID, To: testNodeID})
	}

	mermaidTestTarget := "test_" + tid + " -- unsupported --> target_dummy>Test-Type not yet supported in teVis]:::teTarget"
	needsUnsupportedVis := true

	if test.Type == "agent-to-server" {
		mermaidTestTarget = fmt.Sprintf("test_%s -- %s --> srv_%s[\"%s\"]:::teTarget", tid, test.Protocol, tid, test.Server)
		sid := "srv_" + tid
		nodes[sid] = VisNode{ID: sid, Label: test.Server, Group: "target"}
		*edges = append(*edges, VisEdge{From: testNodeID, To: sid, Label: test.Protocol})
		needsUnsupportedVis = false
	}
	if test.Type == "http-server" {
		mermaidTestTarget = fmt.Sprintf("test_%s -- %s<br>Trace: %s --> srv_%s[\"<p>%s</p>\"]:::teTarget", tid, test.Protocol, test.PathTraceMode, tid, test.URL)
		sid := "srv_" + tid
		nodes[sid] = VisNode{ID: sid, Label: test.URL, Group: "target"}
		*edges = append(*edges, VisEdge{From: testNodeID, To: sid, Label: test.Protocol})
		needsUnsupportedVis = false
	}
	if test.Type == "page-load" {
		mermaidTestTarget = fmt.Sprintf("test_%s -- %s<br>Trace: %s --> srv_%s[\"<p>%s</p>\"]:::teTarget", tid, test.Protocol, test.PathTraceMode, tid, test.URL)
		sid := "srv_" + tid
		nodes[sid] = VisNode{ID: sid, Label: test.URL, Group: "target"}
		*edges = append(*edges, VisEdge{From: testNodeID, To: sid, Label: test.Protocol})
		needsUnsupportedVis = false
	}
	if test.Type == "dns-server" {
		needsUnsupportedVis = false
		for _, dnsServer := range test.DNSServers {
			line := fmt.Sprintf("test_%s -- Trace: %s --> srv_%s_%s[\"<p>%s</p>\"]:::teTarget", tid, test.PathTraceMode, tid, dnsServer.ServerID, dnsServer.ServerName)
			*lines = append(*lines, line)
			sid := fmt.Sprintf("srv_%s_%s", tid, dnsServer.ServerID)
			nodes[sid] = VisNode{ID: sid, Label: dnsServer.ServerName, Group: "target"}
			*edges = append(*edges, VisEdge{From: testNodeID, To: sid, Label: "dns"})
		}
		mermaidTestTarget = ""
	}
	if needsUnsupportedVis {
		nodes["target_dummy"] = VisNode{ID: "target_dummy", Label: "Test type not yet supported in teVis", Group: "target"}
		*edges = append(*edges, VisEdge{From: testNodeID, To: "target_dummy", Label: "unsupported"})
	}
	*lines = append(*lines, mermaidTestTarget)
}

func getDiagram (teVisSettings TEVisSettings) string {
    slog.Debug("getDiagram", "Getting Diagram for Label...", teVisSettings.Label)
	slog.Debug("getDiagram", "Creating Diagrams...")

	teLabel := getLabelDetails(teVisSettings)

	var teAllTests TEAllTests
	if len(teLabel.Assignments) > 0 {
		teAllTests = getAllTests(teVisSettings.Token, teVisSettings.AID)
	}

	lines := []string{}
	lines = append(lines, "---")
	lines = append(lines, "theme: base")
	lines = append(lines, "config:")
	lines = append(lines, "---")
	lines = append(lines, "graph "+teVisSettings.GraphDirection)

	if teVisSettings.GraphLook == "dark" {
		lines = append(lines, "linkStyle default stroke:#ffffff")
	}

	lines = append(lines, "classDef teAgent fill:#FF9000,color:#fff,stroke:#FF9000")
    lines = append(lines, "classDef teTest fill:#02C8FF,color:#07182D,stroke:#02C8FF")
    lines = append(lines, "classDef teTarget fill:#0A60FF,color:#fff,stroke:#0A60FF")

	nodes := make(map[string]VisNode)
	var edges []VisEdge

	for _, assignedTest := range teLabel.Assignments {
		for _, test := range teAllTests.Tests {
			if test.TestID == assignedTest.ID {
				detail := getTestDetails(test.Links.Self.Href, teVisSettings.Token)
				addMermaidAndVisForTest(&lines, nodes, &edges, test, detail, false)
			}
		}
	}

	if len(teLabel.Assignments) == 0 {
		lines = append(lines, "no[No tests assigned to this label/tag.]:::teTest")
	}
	return strings.Join(lines, "\n")
}

func getAllTests(teAGT string, teAID string) TEAllTests{
    slog.Debug("getAllTests", "Getting ALL Tests...")

    getData := map[string]string{
		"Token": teAGT,
	}

	// Getting all TE Tests 
	url := fmt.Sprintf("https://api.thousandeyes.com/v7/tests?aid="+teAID)
	response := helper.GETrequest(url,getData)
    var teAllTests TEAllTests
    if !teJSONUnmarshal("getAllTests", response, &teAllTests) {
		return teAllTests
	}


	slog.Debug("getAllTests", "CEA Tests received", len(teAllTests.Tests))
	slog.Debug("getAllTests", "Received ALL Tests...")
    return teAllTests
}

func getTestDetails(testURL string, teAGT string) TETestDetail {
    getData := map[string]string{
		"Token": teAGT,
	}

	// Getting TE Tests Details 
	url := fmt.Sprintf(testURL+"?expand=agent")
	response := helper.GETrequest(url,getData)
    var teTestDetail TETestDetail
    if !teJSONUnmarshal("getTestDetails", response, &teTestDetail) {
		return teTestDetail
	}

    return teTestDetail
}

func createDiagrams(teLabels TELabels, teVisSettings TEVisSettings) ALLDiagrams {
    var allDiagrams ALLDiagrams

    teAllTests := getAllTests(teVisSettings.Token, teVisSettings.AID)

	slog.Debug("createDiagrams", "Creating Diagrams...")
	for _, label := range teLabels.Tags {
        lines := []string{}
	    lines = append(lines, "---")
		lines = append(lines, "theme: base")
	    lines = append(lines, "config:")
	    lines = append(lines, "  look: "+teVisSettings.GraphLook)	
	    lines = append(lines, "---")
	    lines = append(lines, "graph "+teVisSettings.GraphDirection)

		if teVisSettings.GraphLook == "dark" {
			lines = append(lines, "linkStyle default stroke:#ffffff")
		}

		lines = append(lines, "classDef teAgent fill:#FF9000,color:#fff,stroke:#FF9000")
        lines = append(lines, "classDef teTest fill:#02C8FF,color:#07182D,stroke:#02C8FF")
        lines = append(lines, "classDef teTarget fill:#0A60FF,color:#fff,stroke:#0A60FF")

		nodes := make(map[string]VisNode)
		var edges []VisEdge

		for _, assignedTest := range label.Assignments {
            for _, test := range teAllTests.Tests{
                if test.TestID == assignedTest.ID {
                    teTestDetail := getTestDetails(test.Links.Self.Href, teVisSettings.Token)
					addMermaidAndVisForTest(&lines, nodes, &edges, test, teTestDetail, true)
                }
            }
		}

        diagram := strings.Join(lines, "\n")
		vis := graphFromNodeMap(nodes, edges)
		visBytes, err := json.Marshal(vis)
		if err != nil {
			slog.Error("createDiagrams vis JSON marshal failed", "err", err)
			visBytes = []byte(`{"nodes":[],"edges":[]}`)
		}

        allDiagrams.Tags = append(allDiagrams.Tags, LabelDiagram{
            LabelID:  label.ID,
            Diagram:  diagram,
			DarkMode: teVisSettings.DarkMode,
			VisJSON:  template.JS(visBytes),
        })
	}
	slog.Debug("createDiagrams", "Diagrams created.")
	return allDiagrams
}

func apiAccountGroupHandler(c *gin.Context) {
	userInput := c.Param("token")
	slog.Debug("apiAccountGroupHandler", "Using Bearer", userInput)
	c.String(http.StatusOK, getAccountGroups(userInput))
}

func apiLabelsHandler(c *gin.Context) {
	token := c.Param("token")
	aid := c.Param("aid")
	slog.Debug("apiLabelsHandler", "Using Bearer", token, "AID", aid)
	c.String(http.StatusOK, getLabels2(token, aid))
}

func apiDiagramHandler(c *gin.Context, teVisSettings TEVisSettings) {
	teVisSettings.Token = c.Param("token")
	teVisSettings.Label = c.Param("label")
	teVisSettings.AID = c.Param("aid")

	if c.Param("look") == "classic" || c.Param("look") == "dark" {
		teVisSettings.GraphLook = c.Param("look")
	}

	if c.Param("direction") == "LR" || c.Param("direction") == "TD" {
		teVisSettings.GraphDirection = c.Param("direction")
	}

	slog.Debug("apiDiagramHandler", "Using Bearer", teVisSettings.Token, "Label", teVisSettings.Label, "AID", teVisSettings.AID)
	c.String(http.StatusOK, getDiagram(teVisSettings))
}

func main() {
	var teVisSettings TEVisSettings
	teVisSettings.GraphLook = "classic"
	teVisSettings.GraphDirection = "LR"
	teVisSettings.GraphBrand = "thousandeyes"
	teVisSettings.DarkMode = false

	teVisSettings.Version = baseVersion+curVersion
	teVisSettings.Build = curBuild
	teVisSettings.ServerPort = "8090"

	logger := slog.New(slog.NewJSONHandler(os.Stderr, &slog.HandlerOptions{Level: slog.LevelDebug}))
	slog.SetDefault(logger)
	slog.Debug("main", "Application started - Version", teVisSettings.Version)
	slog.Debug("main", "Current Build", teVisSettings.Build)

	router := gin.Default()
  
    slog.Debug("main", "Server starting on", teVisSettings.ServerPort)
    slog.Debug("main", "Press Ctrl+C to stop the server", "")

	router.StaticFile("/favicon.ico", "./templates/favicon.ico")
	router.StaticFile("/js/main_jq.js", "./src/js/main_jq.js")
	router.StaticFile("/img/teVisLogo.png", "./src/img/teVisLogo.png")
	router.StaticFile("/css/tevis.css", "./src/css/tevis.css")
	router.StaticFile("/js/tevis-topology-static.js", "./src/js/tevis-topology-static.js")
	router.StaticFile("/testpage", "./templates/test_page.html")

	// GIN - Templates
	router.LoadHTMLGlob("templates/*")

	applyTEPost := func(c *gin.Context, s *TEVisSettings) {
		s.DarkMode = false
		s.Token = c.PostForm("userInput")
		gl := c.PostForm("radioDefault")
		if gl != "" {
			s.GraphLook = gl
		}
		gd := c.PostForm("radioDirection")
		if gd != "" {
			s.GraphDirection = gd
		}
		if gb := c.PostForm("radioBrandColors"); gb != "" {
			s.GraphBrand = gb
		}
		s.AID = c.PostForm("ag")
		if s.GraphLook == "dark" {
			s.DarkMode = true
		}
	}

	// GIN - Routes
	router.GET("/", func(c *gin.Context) {
        c.HTML(http.StatusOK, "index.html", gin.H{
            "title":   "Gin HTML Templates",
            "message": "Welcome to Gin templating!",
        })
    })

	router.GET("/form", func(c *gin.Context) {
		c.HTML(http.StatusOK, "formTemplate.html", gin.H{})
	})

	router.POST("/submit", func(c *gin.Context) {		
		applyTEPost(c, &teVisSettings)
		if err := ensureAID(&teVisSettings); err != nil {
			slog.Warn("submitHandler ensureAID", "err", err)
			c.HTML(http.StatusOK, "formTemplate.html", gin.H{
				"Error": "Could not determine account group (aid): " + err.Error(),
			})
			return
		}
		slog.Debug("submitHandler", "Current teVis Settings:", teVisSettings)

		teLabels := getLabels(teVisSettings)
		allDiagrams := createDiagrams(teLabels, teVisSettings)

        c.HTML(http.StatusOK, "resultTemplate.html", gin.H{
            "UserInput":  teVisSettings.Token,
            "UserAID": teVisSettings.AID,
			"Diagrams": allDiagrams,
			"Labels": teLabels,
        })
    })

	router.GET("/test", func(c *gin.Context) {
        c.HTML(http.StatusOK, "test_formTemplate.html", gin.H{
            "title":   "Gin HTML Templates",
            "message": "Welcome to Gin templating!",
        })
    })

	router.GET("/tests", func(c *gin.Context) {
        c.HTML(http.StatusOK, "tests.html", gin.H{
            "title":   "Gin HTML Templates",
            "topic": "Cloud & Enterprise",
        })
    })

	router.GET("/topology", func(c *gin.Context) {
		c.HTML(http.StatusOK, "topology.html", gin.H{
			"title":           "Topology · teVis",
			"CredentialStep": true,
		})
	})

	router.POST("/topology", func(c *gin.Context) {
		var s TEVisSettings
		s.GraphLook = "classic"
		s.GraphDirection = "LR"
		s.GraphBrand = "thousandeyes"
		applyTEPost(c, &s)
		if err := ensureAID(&s); err != nil {
			slog.Warn("topologyPost ensureAID", "err", err)
			c.HTML(http.StatusOK, "topology.html", gin.H{
				"title":            "Topology · teVis",
				"CredentialStep":     true,
				"Error":              "Could not determine account group (aid): " + err.Error(),
			})
			return
		}
		teLabels := getLabels(s)
		teAllTests := getAllTests(s.Token, s.AID)
		tags := topologySelectableTags(teLabels)
		labelID := strings.TrimSpace(c.PostForm("labelId"))

		baseH := gin.H{
			"title":           "Topology · teVis",
			"CredentialStep":  false,
			"UserAID":         s.AID,
			"GraphLook":       s.GraphLook,
			"GraphDir":        s.GraphDirection,
			"GraphBrand":      s.GraphBrand,
			"Tags":            tags,
			"Token":           s.Token,
			"SelectedLabelID": labelID,
		}

		if labelID == "" {
			if len(tags) == 0 {
				baseH["Error"] = "No tags with test assignments were found for this account. Try another token or account group (aid override)."
				baseH["CredentialStep"] = true
				baseH["ShowTagPicker"] = false
				baseH["ShowGraph"] = false
				c.HTML(http.StatusOK, "topology.html", baseH)
				return
			}
			baseH["ShowTagPicker"] = true
			baseH["ShowGraph"] = false
			c.HTML(http.StatusOK, "topology.html", baseH)
			return
		}

		graph, err := visGraphForTag(teLabels, teAllTests, s.Token, labelID)
		if err != nil {
			baseH["Error"] = "Could not build graph for this tag: " + err.Error()
			baseH["ShowTagPicker"] = true
			baseH["ShowGraph"] = false
			baseH["SelectedLabelID"] = ""
			c.HTML(http.StatusOK, "topology.html", baseH)
			return
		}
		raw, mErr := json.Marshal(graph)
		if mErr != nil {
			raw = []byte(`{"nodes":[],"edges":[]}`)
		}
		baseH["ShowTagPicker"] = true
		baseH["ShowGraph"] = true
		baseH["VisDarkDefault"] = s.GraphLook == "dark"
		baseH["MergedVis"] = template.JS(raw)
		c.HTML(http.StatusOK, "topology.html", baseH)
	})

	router.GET("/endpoint", func(c *gin.Context) {
        c.HTML(http.StatusOK, "endpoint.html", gin.H{
            "title":   "Gin HTML Templates",
            "topic": "Endpoint",
        })
    })

	router.GET("/alerts", func(c *gin.Context) {
        c.HTML(http.StatusOK, "alerts.html", gin.H{
            "title":   "Gin HTML Templates",
            "topic": "Alert Rules",
        })
    })

	router.GET("/test/submit", func(c *gin.Context) {	
		slog.Debug("testHandler", "Current teVis Settings:", teVisSettings)

		teLabels := getLabels(teVisSettings)
		allDiagrams := createDiagrams(teLabels, teVisSettings)

        c.HTML(http.StatusOK, "resultTemplate.html", gin.H{
            "UserInput":  teVisSettings.Token,
            "UserAID": teVisSettings.AID,
			"Diagrams": allDiagrams,
			"Labels": teLabels,
        })
    })

	router.GET("/api/ping", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "message": "pong",
			"serverVersion": teVisSettings.Version,
        })
    })

	router.GET("/api/accountgroups/:token", apiAccountGroupHandler)
	router.GET("/api/labels/:token/:aid", apiLabelsHandler)

	router.GET("/api/diagram/:token/:aid/:label/:direction/:look", func(c *gin.Context) {
		apiDiagramHandler(c, teVisSettings)
	})

	// Start server
    router.Run(":"+teVisSettings.ServerPort)
}
