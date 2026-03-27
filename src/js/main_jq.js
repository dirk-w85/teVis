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
          $('#getAG').addClass('d-none');


          $.get("/api/labels/"+$("#userInput").val()+"/"+$("#ag option:selected").val(), function(data, status){
            if(status === "success"){
              data = JSON.parse(data)
              $('#label').empty();
            
              $.each(data.tags, function(index, tag) {
                if(tag.objectType == "test" && tag.assignments.length > 0 && tag.id.length>10){
                  console.log(tag.tag);
                  $('#label').append('<option value="' + tag.id + '">' + tag.value +' (Tests: '+tag.assignments.length+')</option>');
                }
              });
            
              $('#dropdownLabel').removeClass('d-none');
              $('#diagramBtn').removeClass('d-none');
              $('#graphSettings').removeClass('d-none');
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

          $.each(data.tags, function(index, tag) {
            if(tag.objectType == "test" && tag.assignments.length > 0 && tag.id.length>10){
              console.log(tag.tag);
              $('#labelFilter').append('<option value="' + tag.id + '">' + tag.key +' (Tests: '+tag.assignments.length+')</option>');
            }
          });

          $('#labelSection').removeClass('invisible');
          $('#diagramBtn').removeClass('d-none');
          $('#graphSettings').removeClass('d-none');
          $('#labelBtn').addClass('d-none');
        }else {
          console.error("LABEL GET Failed");
        };
      });
    });

    $('#getAG').click(function(){
      console.log("Clicked");
      console.log("token:"+$("#userInput").val())

      $.get("/api/accountgroups/"+$("#userInput").val(), function(data, status){
        if(status === "success"){
          data = JSON.parse(data)

          $.each(data.accountGroups, function(index, group) {
            console.log(group.accountGroupName);
            $('#ag').append('<option value="' + group.aid + '">' + group.accountGroupName + '</option>');
          });

          $('#dropdown').removeClass('d-none');    
          $('#getAG').addClass('d-none');

          $.get("/api/labels/"+$("#userInput").val()+"/"+$("#ag option:selected").val(), function(data, status){
            if(status === "success"){
              data = JSON.parse(data)
              $('#label').empty();
            
              $.each(data.tags, function(index, tag) {
                if(tag.objectType == "test" && tag.assignments.length > 0 && tag.id.length>10){
                  console.log(tag.tag);
                  $('#label').append('<option value="' + tag.id + '">' + tag.value +' (Tests: '+tag.assignments.length+')</option>');
                }
              });
            
              $('#dropdownLabel').removeClass('d-none');
              $('#diagramBtn').removeClass('d-none');
              $('#graphSettings').removeClass('d-none');
              $('#labelBtn').addClass('d-none');
            }else {
              console.error("LABEL GET Failed");
            };
          });

        }else {
          console.error("AG GET Failed");
        };
      });
    });

    $('#agBtn').click(function(){
      console.log("agBtn Clicked");

      $.get("/api/labels/"+$("#token").val()+"/"+$("#agFilter option:selected").val(), function(data, status){
        if(status === "success"){
          data = JSON.parse(data)
          $('#labelFilter').empty();

          $.each(data.tags, function(index, tag) {
            if(tag.objectType == "test" && tag.assignments.length > 0 && tag.id.length>10){
              console.log(tag);
              $('#labelFilter').append('<option value="' + tag.id + '">' + tag.key +' (Tests: '+tag.assignments.length+')</option>');
            }
          });

          $('#labelSection').removeClass('invisible');
          $('#diagramBtn').removeClass('d-none');
          $('#graphSettings').removeClass('d-none');
          $('#agBtn').addClass('invisible');
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


//      $('#mermaidCard').addClass('d-none');
//      if($('input[name="radioLook"]:checked').val() == "dark"){
//        $('#mermaidCard').addClass('tevis-dark');
//      }else{
//        $('#mermaidCard').removeClass('tevis-dark');
//      }
//
//      $('#loading-spinner').removeClass('d-none');      

      $.get("/api/diagram/"+$("#token").val()+"/"+$("#agFilter option:selected").val()+"/"+$("#labelFilter option:selected").val()+"/"+$('input[name="radioDirection"]:checked').val()+"/"+$('input[name="radioLook"]:checked').val(), function(data, status){
        if(status === "success"){                   
          console.log(data);

//          $('#mermaidBox').empty(); // Clear previous diagram
//          $('#mermaidBox').removeAttr('data-processed');
//          $('#mermaidBox').append(data);

//          mermaid.run();
          
//          $('#loading-spinner').addClass('d-none');
//          $('#mermaidCard').removeClass('d-none');
        }else {
          console.error("LABEL GET Failed");
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