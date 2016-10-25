$(document).ready(function() {
  $('#addcategory').on('click', function() {
    $('#categoryform').removeClass('hidden');
    $('#categories').addClass('hidden');
  });
  $('#backcategory').on('click', function() {
    $('#categoryform').addClass('hidden');
    $('#categories').removeClass('hidden');
  });

});