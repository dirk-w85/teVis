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

        }else {
          console.error("AG GET Failed");
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