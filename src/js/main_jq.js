// Define Nodes
        const nodes = new vis.DataSet([
            // Agents
            { id: 'agent_315431', label: 'Frankfurt, Germany\ncloud', color: '#FF9000', font: {color: '#fff'}, shape: 'ellipse' },
            { id: 'agent_1332303', label: 'TECOPS-2278-02\n10.1.17.124', color: '#FF9000', font: {color: '#fff'}, shape: 'ellipse' },
            { id: 'agent_1467088', label: 'R1-ISR1121-X-01\n1.1.1.2', color: '#FF9000', font: {color: '#fff'}, shape: 'ellipse' },
            { id: 'agent_1606666', label: 'R1-ASR1001-X-01\n10.1.18.41', color: '#FF9000', font: {color: '#fff'}, shape: 'ellipse' },
            { id: 'agent_1610058', label: 'R1-C9300-24UX-01\n10.1.20.4', color: '#FF9000', font: {color: '#fff'}, shape: 'ellipse' },
            // Tests
            { id: 'test_7031323', label: 'MSTeams - DNS - External\nType: dns-trace', color: '#02C8FF' },
            { id: 'test_7031325', label: 'MSTeams - Video - Internal\nType: agent-to-server', color: '#02C8FF' },
            { id: 'test_7031313', label: 'MSTeams - DNS - Internal\nType: dns-server', color: '#02C8FF' },
            { id: 'test_7031316', label: 'MSTeams - External\nType: agent-to-server', color: '#02C8FF' },
            { id: 'test_7031318', label: 'MSTeams - Internal\nType: agent-to-server', color: '#02C8FF' },
            { id: 'test_7031317', label: 'MSTeams - Audio - Internal\nType: agent-to-server', color: '#02C8FF' },
            // Targets
            { id: 'target_dummy', label: 'Test-Type not supported', color: '#0A60FF', font: {color: '#fff'} },
            { id: 'srv_7031325', label: 'worldaz.tr.teams.microsoft.com:443', color: '#0A60FF', font: {color: '#fff'} },
            { id: 'srv_7031313_2221921', label: 'ns1-39.azure-dns.com', color: '#0A60FF', font: {color: '#fff'} },
            { id: 'srv_7031313_2241766', label: 'ns2-39.azure-dns.net', color: '#0A60FF', font: {color: '#fff'} },
            { id: 'srv_7031313_2241771', label: 'ns3-39.azure-dns.org', color: '#0A60FF', font: {color: '#fff'} },
            { id: 'srv_7031313_2245711', label: 'ns4-39.azure-dns.info', color: '#0A60FF', font: {color: '#fff'} },
            { id: 'srv_7031316', label: 'worldaz.tr.teams.microsoft.com:443', color: '#0A60FF', font: {color: '#fff'} },
            { id: 'srv_7031318', label: 'worldaz.tr.teams.microsoft.com:443', color: '#0A60FF', font: {color: '#fff'} },
            { id: 'srv_7031317', label: 'worldaz.tr.teams.microsoft.com:443', color: '#0A60FF', font: {color: '#fff'} }
        ]);

        // Define Edges
        const edges = new vis.DataSet([
            { from: 'agent_315431', to: 'test_7031323' },
            { from: 'test_7031323', to: 'target_dummy', label: 'unsupported' },
            { from: 'agent_1332303', to: 'test_7031325' }, { from: 'agent_1467088', to: 'test_7031325' }, { from: 'agent_1606666', to: 'test_7031325' }, { from: 'agent_1610058', to: 'test_7031325' },
            { from: 'test_7031325', to: 'srv_7031325', label: 'tcp' },
            { from: 'agent_1332303', to: 'test_7031313' }, { from: 'agent_1606666', to: 'test_7031313' }, { from: 'agent_1610058', to: 'test_7031313' },
            { from: 'test_7031313', to: 'srv_7031313_2221921', label: 'classic' }, { from: 'test_7031313', to: 'srv_7031313_2241766', label: 'classic' }, { from: 'test_7031313', to: 'srv_7031313_2241771', label: 'classic' }, { from: 'test_7031313', to: 'srv_7031313_2245711', label: 'classic' },
            { from: 'agent_315431', to: 'test_7031316' }, { from: 'test_7031316', to: 'srv_7031316', label: 'tcp' },
            { from: 'agent_1332303', to: 'test_7031318' }, { from: 'agent_1467088', to: 'test_7031318' }, { from: 'agent_1606666', to: 'test_7031318' }, { from: 'agent_1610058', to: 'test_7031318' },
            { from: 'test_7031318', to: 'srv_7031318', label: 'tcp' },
            { from: 'agent_1332303', to: 'test_7031317' }, { from: 'agent_1467088', to: 'test_7031317' }, { from: 'agent_1606666', to: 'test_7031317' }, { from: 'agent_1610058', to: 'test_7031317' },
            { from: 'test_7031317', to: 'srv_7031317', label: 'tcp' }
        ]);

        // Configuration
        const options = {
            layout: { hierarchical: { direction: 'LR', sortMethod: 'directed', levelSeparation: 300 } },
            nodes: { shape: 'box', margin: 10, font: { face: 'Arial' } },
            edges: { arrows: 'to', font: { align: 'top' } },
            physics: false
        };





$(document).ready(function() {
    // Your jQuery code here

    $.get("/api/ping", function(data, status){
        if(data.message === "pong"){
          console.log("teVis API is ready");
          $("#apiStatus").text("API ready - Version: "+data.serverVersion);
          $("#serverVersion").text("teVis Version: "+data.serverVersion);
        }else {
          console.error("teVis API is NOT  ready");
          $("#apiStatus").text("API NOT ready - Version: "+data.serverVersion);
        };
      });

   $('#tokenBtn').click(function(){
      console.log("tokenBTN clicked");
      console.log("token: "+$("#token").val());

      $.get("/api/accountgroups/"+$("#token").val(), function(data, status){
        if(status === "success"){
          data = JSON.parse(data)

          $.each(data.accountGroups, function(index, group) {
            console.log(group.accountGroupName);
            $('#agFilter').append('<option value="' + group.aid + '">' + group.accountGroupName + '</option>');
          });

          $('#agForm').removeClass('invisible');  

          $.get("/api/labels/"+$("#token").val()+"/"+$("#agFilter option:selected").val(), function(data, status){
            if(status === "success"){
              data = JSON.parse(data)
              $('#labelFilter').empty();
              
              console.log(data.tags.length);
              $.each(data.tags, function(index, tag) {
                if(tag.objectType == "test" && tag.assignments.length > 0 && tag.id.length>10){
                  console.log(tag.tag);
                  $('#labelFilter').append('<option value="' + tag.id + '">' + tag.key +' (Tests: '+tag.assignments.length+')</option>');
                }
              });
            
              $('#labelSection').removeClass('invisible');
              $('#tokenBtn').addClass('invisible');
            }else {
              console.error("LABEL GET Failed");
            };
          });

        }else {
          console.error("AG GET Failed");
        };
      });
    });

    $('#agFilter').on('change', function() {
      console.log("Selected AG ID:", $(this).val());
      $.get("/api/labels/"+$("#token").val()+"/"+$("#agFilter option:selected").val(), function(data, status){
        if(status === "success"){
          data = JSON.parse(data)
          $('#labelFilter').empty();

          console.log(data.tags.length);
          if(data.tags.length == 0){
            alert("No Labels found for this Account Group received. Please create a Label first.");
          }else{
            $.each(data.tags, function(index, tag) {
              if(tag.objectType == "test" && tag.assignments.length > 0 && tag.id.length>10){
                console.log(tag.tag);
                $('#labelFilter').append('<option value="' + tag.id + '">' + tag.key +' (Tests: '+tag.assignments.length+')</option>');
              }
            });
          }

          $('#labelSection').removeClass('invisible');
          $('#diagramBtn').removeClass('d-none');
          $('#graphSettings').removeClass('d-none');
          $('#labelBtn').addClass('d-none');
        }else {
          console.error("LABEL GET Failed");
        };
      });
    });

    $('#labelBtn').click(function(){
      console.log("labelBtn Clicked");
      console.log("Token: "+$("#token").val())
      console.log("AG: "+$("#agFilter option:selected").val())
      console.log("Label: "+$("#labelFilter option:selected").val())


      $.get("/api/diagram/"+$("#token").val()+"/"+$("#agFilter option:selected").val()+"/"+$("#labelFilter option:selected").val()+"/"+$('input[name="radioDirection"]:checked').val()+"/"+$('input[name="radioLook"]:checked').val(), function(data, status){
        if(status === "success"){                   
          console.log(data);
          // Initialize Network
          const network = new vis.Network(document.getElementById('visGraph'), { nodes, edges }, options);

        }else{
          console.error("DIAGRAM GET Failed");
        };
      });
    });

    $('#teForm').on('submit', function(e) {
      //const $submitBtn = $('#submitBtn');
      // Show spinner and update button state      
    });    

// #---- TROUBLESHOOTING ----#
//    console.log('Element found:', $('#getAG').length);  // Sollte 1 sein
//
//    if ($('#getAG').length === 0) {
//      console.error('Element #getAG not found!');
//    }else {
//      console.log('Element #getAG found!');
//    } 


    console.log("jQuery is loaded and ready!");
});


