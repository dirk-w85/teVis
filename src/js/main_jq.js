$(document).ready(function() {
    // Your jQuery code here
    console.log("jQuery is loaded and ready!");

    $('#teForm').on('submit', function(e) {
      const $submitBtn = $('#submitBtn');
      const $spinner = $('#loading-spinner');
      const $buttonText = $('#buttonText');

      // Show spinner and update button state
      $spinner.removeClass('d-none');
      //$buttonText.text('Loading...');
      //$submitBtn.prop('disabled', true);
    });    
});