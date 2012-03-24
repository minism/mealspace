$(function()
{
    $('.main-error > a.close').click(function(e) {
        $(this).parent('.alert').hide();
    });

    $('#clear-search').click(function() {
        $('#search').val('').focus();
    })
})