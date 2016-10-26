$(document).ready(function() {
  $('#addcategory').on('click', function() {
    $('#categoryform').removeClass('hidden');
    $('#categories').addClass('hidden');
  });
  $('#backcategory').on('click', function() {
    $('#categoryform').addClass('hidden');
    $('#categories').removeClass('hidden');
  });
  $('select').material_select();

  $('#addbook').on('click', function() {
    $('#bookform').removeClass('hidden');
    $('#books').addClass('hidden');
  });
  $('#bookback').on('click', function() {
    $('#bookform').addClass('hidden');
    $('#books').removeClass('hidden');
  });

});