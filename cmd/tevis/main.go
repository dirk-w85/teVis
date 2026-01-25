package main

import (
    "fmt"
    "html/template"    
	"log/slog"
    "net/http"
	"github.com/dirk-w85/golang-helper"
	"encoding/json"
	"strings"
	"os"
	"github.com/gin-gonic/gin"
)

const baseVersion = "v0.2.1."
var curVersion string
var curBuild string

type TEVisSettings struct {
	Version		string
	Build		string
	Token		string
	AID			string
	Loglevel	string
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
//	CreatedDate     time.Time `json:"createdDate"`
	ModifiedBy      string    `json:"modifiedBy"`
//	ModifiedDate    time.Time `json:"modifiedDate"`
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

type ALLDiagrams struct {
    Tags []struct {
        LabelID     string
        Diagram     string
    }
}

type TEAllAccountGroups struct {
	AccountGroups []struct {
		AccountGroupName      string `json:"accountGroupName"`
		Aid                   string `json:"aid"`
	} `json:"accountGroups"`
}

type TEAllTests struct {
	Tests []struct {
		Interval              int       `json:"interval"`
		TestID                string    `json:"testId"`
		BgpMeasurements       bool      `json:"bgpMeasurements"`
		UsePublicBgp          bool      `json:"usePublicBgp"`
		Description           string    `json:"description"`
		LiveShare             bool      `json:"liveShare"`
		TestName              string    `json:"testName"`
		CreatedBy             string    `json:"createdBy"`
//		CreatedDate           time.Time `json:"createdDate"`
		ModifiedBy            string    `json:"modifiedBy"`
//		ModifiedDate          time.Time `json:"modifiedDate"`
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
	} `json:"tests"`
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
	lines := []string{}
	
	json.Unmarshal([]byte(response), &teLabels)
	slog.Debug("TAGS", "Tags received", len(teLabels.Tags))
	for _, label := range teLabels.Tags {
		lines = append(lines, label.Value)
	}
	//return lines
	return teLabels
}

func getAccountGroups (token string) string {
    slog.Debug("getAccountGroups", "Getting ALL Account-Groups...")
	getData := map[string]string{
		"Token": token,
	}
	// Getting TE Labels 
	url := fmt.Sprintf("https://api.thousandeyes.com/v7/account-groups")
	response := helper.GETrequest(url,getData)
	//fmt.Println(response)
	var teAGs TEAllAccountGroups
	json.Unmarshal([]byte(response), &teAGs)
	slog.Debug("getAccountGroups", "Account Groups received", len(teAGs.AccountGroups))

	return response
}

func getAllTests(teAGT string, teAID string) TEAllTests{
    slog.Debug("getAllTests", "Getting ALL Tests...")

    getData := map[string]string{
		"Token": teAGT,
	}

	// Getting all TE Tests 
	url := fmt.Sprintf("https://api.thousandeyes.com/v7/tests?aid="+teAID)
	response := helper.GETrequest(url,getData)
    //fmt.Println(response)
    var teAllTests TEAllTests
    json.Unmarshal([]byte(response), &teAllTests)


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
    //fmt.Println(response)
    var teTestDetail TETestDetail
    json.Unmarshal([]byte(response), &teTestDetail)

    return teTestDetail
}

func createDiagrams(teLabels TELabels, teVisSettings TEVisSettings) ALLDiagrams {
    var allDiagrams ALLDiagrams

    teAllTests := getAllTests(teVisSettings.Token, teVisSettings.AID)

	slog.Debug("createDiagrams", "Creating Diagrams...")
	for _, label := range teLabels.Tags {
        lines := []string{}
	    lines = append(lines, "---")
	    lines = append(lines, "config:")
	    lines = append(lines, "  look: "+teVisSettings.GraphLook)	
	    lines = append(lines, "---")
	    lines = append(lines, "graph "+teVisSettings.GraphDirection)

		lines = append(lines, "classDef teAgent fill:#FF9000,color:#fff,stroke:#FF9000")
        lines = append(lines, "classDef teTest fill:#02C8FF,color:#07182D,stroke:#02C8FF")
        lines = append(lines, "classDef teTarget fill:#0A60FF,color:#fff,stroke:#0A60FF")

		for _, assignedTest := range label.Assignments {
            for _, test := range teAllTests.Tests{
                if(test.TestID == assignedTest.ID){
                    // Define the Tests
					mermaidTest := ""
					mermaidTest = fmt.Sprintf("test_%s[\"**%s**<br>*Type: %s<br>Interval: %ds*\"]:::teTest", test.TestID, test.TestName, test.Type, test.Interval )
					lines = append(lines, mermaidTest)

                    teTestDetail := getTestDetails(test.Links.Self.Href, teVisSettings.Token)

                    // Define the Agents
                    mermaidAgent := ""

                    for _, agent := range teTestDetail.Agents {
                        if(agent.AgentType == "cloud"){
                            mermaidAgent = fmt.Sprintf("agent_%s([\"%s<br>*%s*\"]):::teAgent",agent.AgentID, agent.AgentName, agent.AgentType )
                        }

                        if(agent.AgentType == "enterprise"){
                            mermaidAgent = fmt.Sprintf("agent_%s([\"%s<br>*%s<br>%s*\"]):::teAgent",agent.AgentID, agent.AgentName, agent.IPAddresses[0], agent.AgentType )
                        }
                        lines = append(lines, mermaidAgent)
                    }

                    // Connecting Agents to Tests
                    for _, agent := range teTestDetail.Agents {
                        lines = append(lines, "agent_"+agent.AgentID+" --> test_"+test.TestID)
                    }

					// Connecting Tests to Test-Targets
					mermaidTestTarget := "test_"+test.TestID+" -- unsupported --> target_dummy>Test-Type not yet supported in teVis]:::teTarget"

					if(test.Type == "agent-to-server"){
						mermaidTestTarget = fmt.Sprintf("test_%s -- %s --> srv_%s[\"%s\"]:::teTarget", test.TestID, test.Protocol, test.TestID, test.Server)
					}

					if(test.Type == "http-server"){
						mermaidTestTarget = fmt.Sprintf("test_%s -- %s<br>Trace: %s --> srv_%s[\"<p>%s</p>\"]:::teTarget", test.TestID, test.Protocol, test.PathTraceMode, test.TestID, test.URL)
					}

					if(test.Type == "page-load"){
						mermaidTestTarget = fmt.Sprintf("test_%s -- %s<br>Trace: %s --> srv_%s[\"<p>%s</p>\"]:::teTarget", test.TestID, test.Protocol, test.PathTraceMode, test.TestID, test.URL)
					}

					if(test.Type == "dns-server"){
						for _, dnsServer := range test.DNSServers {
							mermaidTestTarget = fmt.Sprintf("test_%s -- Trace: %s --> srv_%s_%s[\"<p>%s</p>\"]:::teTarget", test.TestID, test.PathTraceMode, test.TestID, dnsServer.ServerID, dnsServer.ServerName)
							lines = append(lines, mermaidTestTarget)
						}
						mermaidTestTarget = ""
					}

					lines = append(lines, mermaidTestTarget)
                }
            }	        
		}

        diagram := strings.Join(lines, "\n")

        allDiagrams.Tags = append(allDiagrams.Tags, struct {
            LabelID string
            Diagram string
        }{
            LabelID: label.ID,
            Diagram: diagram,
        })
	}
	slog.Debug("createDiagrams", "Diagrams created.")
	return allDiagrams
}

func homeHandler(w http.ResponseWriter, r *http.Request) {

	//tmpl, err := template.ParseGlob("footer.html")
	//tmpl := template.Must(template.ParseGlob("templates/*.html"))
	tmpl, err := template.ParseFiles("formTemplate.html")
    if err != nil {
        http.Error(w, "Error parsing template", http.StatusInternalServerError)
        return
    }
    
    err = tmpl.Execute(w, nil)
    if err != nil {
        http.Error(w, "Error executing template", http.StatusInternalServerError)
		fmt.Println(err)
        return
    }
	slog.Debug("homeHandler", "Form Page Template executed.")
}

func apiAccountGroupHandler(c *gin.Context) {   
	userInput := c.Param("token")

	//userInput := "91bbe972-f931-446a-97e4-016797e5293a"
	slog.Debug("apiAccountGroupHandler", "Using Bearer", userInput)
	//getAccountGroups(userInput)

	c.String(http.StatusOK, getAccountGroups(userInput))
    return
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

	//logger := slog.New(slog.NewJSONHandler(os.Stderr,nil))
	logger := slog.New(slog.NewJSONHandler(os.Stderr,&slog.HandlerOptions{Level: slog.LevelDebug}))
	slog.SetDefault(logger)
	slog.Debug("main", "Application started - Version", teVisSettings.Version)
	slog.Debug("main", "Current Build", teVisSettings.Build)

	router := gin.Default()
  
    slog.Debug("main", "Server starting on", teVisSettings.ServerPort)
    slog.Debug("main", "Press Ctrl+C to stop the server", "")

	router.StaticFile("/favicon.ico", "./templates/favicon.ico")
	router.StaticFile("/js/main_jq.js", "./src/js/main_jq.js")
	router.StaticFile("/js/app.js", "./src/js/app.js")
	router.StaticFile("/js/test_app.jsx", "./src/js/test_app.jsx")
	router.StaticFile("/css/tevis.css", "./src/css/tevis.css")
	router.StaticFile("/testpage", "./templates/test_page.html")

	// GIN - Templates
	router.LoadHTMLGlob("templates/*")

	// GIN - Routes

	router.GET("/", func(c *gin.Context) {
        c.HTML(http.StatusOK, "formTemplate.html", gin.H{
            "title":   "Gin HTML Templates",
            "message": "Welcome to Gin templating!",
        })
    })

	router.POST("/submit", func(c *gin.Context) {		
	    // Get the input value
	    teVisSettings.Token = c.PostForm("userInput")
		teVisSettings.GraphLook = c.PostForm("radioDefault")
		teVisSettings.GraphDirection = c.PostForm("radioDirection")
		teVisSettings.GraphBrand = c.PostForm("radioBrandColors")
		teVisSettings.AID = c.PostForm("ag")

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
        })
    })

	router.GET("/api/accountgroups/:token", apiAccountGroupHandler)

	// Start server
    router.Run(":"+teVisSettings.ServerPort)
}
