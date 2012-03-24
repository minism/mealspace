$(function()
{
    $('.main-error > a.close').click(function(e) {
        $(this).parent('.alert').hide();
    });

    $('#clear-search').click(function() {
        $('#search').val('').focus();
        $('#ingredient-list li').show()
    });

    $('#search').keyup(function(e) {
        var text = $(this).val();
        var re = new RegExp(text, 'i');
        $('#ingredient-list li').each(function(){
            var ingredient_name = $(this).find('.ingredient-name').html()
            console.log(ingredient_name);
            if($.trim(ingredient_name).search(re) == -1) {
                $(this).hide()
            }   
            else {
                $(this).show()
            }
        });
    });

})