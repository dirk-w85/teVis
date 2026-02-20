$(document).ready(function() {
    // Your jQuery code here

    $.get("/api/ping", function(data, status){
        if(data.message === "pong"){
          console.log("teVis API is ready");
          $("#apiStatus").text("API ready");
          $("#serverVersion").text("teVis Version: "+data.serverVersion);
        }else {
          console.error("teVis API is NOT  ready");
          $("#apiStatus").text("API NOT ready");
        };
      });

    $('#getAG').click(function(){
      console.log("Clicked");
      console.log($("#userInput").val())

      $.get("/api/accountgroups/"+$("#userInput").val(), function(data, status){
        if(status === "success"){
          //console.log(data);  
          data = JSON.parse(data)

          $.each(data.accountGroups, function(index, group) {
            console.log(group.accountGroupName);
            $('#ag').append('<option value="' + group.aid + '">' + group.accountGroupName + '</option>');
          });

          $('#dropdown').removeClass('d-none');

          $('#graphSettings').removeClass('d-none');

          $('#labelBtn').removeClass('d-none');

        }else {
          console.error("AG GET Failed");
        };
      });
    });

    $('#labelBtn').click(function(){
      console.log("Clicked");
      console.log($("#userInput").val())

      $.get("/api/labels/"+$("#userInput").val(), function(data, status){
        if(status === "success"){
          data = JSON.parse(data)

          $.each(data.tags, function(index, tag) {
            console.log(tag.tag);
            $('#label').append('<option value="' + tag.id + '">' + tag.value + '</option>');
          });

          $('#dropdownLabel').removeClass('d-none');
          $('#diagramBtn').removeClass('d-none');

        }else {
          console.error("LABEL GET Failed");
        };
      });
    });

    $('#diagramBtn').click(function(){
      console.log("Clicked");
      console.log($("#userInput").val())
      console.log($("#dropdownLabel option:selected").val())

      $.get("/api/diagram/"+$("#userInput").val()+"/"+$("#dropdownLabel option:selected").val(), function(data, status){
        if(status === "success"){                   
          console.log(data);

          $('#mermaidBox').empty(); // Clear previous diagram
          $('#mermaidBox').removeAttr('data-processed');
          $('#mermaidBox').append(data);

          mermaid.run();
          
          $('#mermaidCard').removeClass('d-none');

        }else {
          console.error("LABEL GET Failed");
        };
      });

    });



    $('#teForm').on('submit', function(e) {
      //const $submitBtn = $('#submitBtn');
      // Show spinner and update button state
      $('#loading-spinner').removeClass('d-none');
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