$(document).ready(function() {
    $.get("/api/ping", function(data, status){
        if(data.message === "pong"){
          console.log("teVis API is ready");
          $("#apiStatus").text("API ready - Version: "+data.serverVersion);
          $("#serverVersion").text("teVis Version: "+data.serverVersion);
        }else {
          console.error("teVis API is NOT  ready");
          $("#apiStatus").text("API NOT ready - Version: "+data.serverVersion);
        }
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
          $('#labelBtn').removeClass('d-none');
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

      var direction = $('input[name="graphDirection"]:checked').val() || 'LR';
      var look = $('input[name="radioLook"]:checked').val() || 'classic';

      $.get("/api/diagram/"+$("#token").val()+"/"+$("#agFilter option:selected").val()+"/"+$("#labelFilter option:selected").val()+"/"+direction+"/"+look, function(data, status){
        if(status === "success"){
          console.log(data);
          if (typeof tevisTopologyInit === "function") {
            tevisTopologyInit("visGraph", {
              graphDirection: direction,
              visDarkBackground: look === "dark"
            }, window.tevisTopologyStatic);
          }
        }else{
          console.error("DIAGRAM GET Failed");
        };
      });
    });

    $('#teForm').on('submit', function(e) {
    });    

    console.log("jQuery is loaded and ready!");
});
