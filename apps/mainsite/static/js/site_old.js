/* Client side state */
window.qtype = 'intersection';
window.show_edit = false;

function connect_button_form(button, form)
{
    button.click(function() {
        $('.formbox:visible').slideUp(100);
        if (!form.is(':visible'))
        {
            form.slideDown(100);
        }
    });
}


$(function(){

    /* AJAX CSRF */
    $(document).ajaxSend(function(event, xhr, settings) {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    function sameOrigin(url) {
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }
    function safeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    }
    });




    $('.uibutton').button({
        icons: {
            //
        }
    });

    $('#edit-all-button').click(function() {
        edits = $('.edit');
        if (window.show_edit)
        {
            window.show_edit = false;
            edits.css('visibility', 'hidden');
        }   
        else
        {
            window.show_edit = true;
            edits.css('visibility', 'visible');
        }
    });

    $('.formbox').hide();
    $('#loginform').css('margin-left', $('#loginform').width() * -1 - 25 + $('#login-button').width());
    connect_button_form($('#login-button'), $('#loginform'));
    connect_button_form($('#ingredient-add-button'), $('#ingredientform'));
    connect_button_form($('#meal-add-button'), $('#mealform'));

    $('#viewtype-buttons').buttonset();
    $('#search-area').buttonset();

    $('#ingredients li').click(function() {
        $(this).toggleClass('selected');
        reload_meals();
    });

    $('#reset-button').click(function() {
        $('#ingredients li').removeClass('selected');
        reload_meals();
    })

    $('#search').keyup(function(e) {
        var text = $(this).val();
        var re = new RegExp(text, 'i');
        $('#ingredients li').each(function(){
            if($.trim($(this).html()).search(re) == -1) {
                $(this).css('display', 'none');
            }   
            else {
                $(this).css('display', '');
            }
        });
    });


    /* Ajax loaders */
    $('#all').click(function() { load_meals('all'); });
    $('#union').click(function() { load_meals('union'); });
    $('#intersection').click(function() { load_meals('intersection'); });
    $('#strict').click(function() { load_meals('strict'); });
    


    /* Ajax edit forms */
    $('.edit > a').click(function (e) {
        $('.editbox').remove();
    });

    $('.ingredient > a').click(function (e) {
        e.preventDefault();
        pk = $(this).attr('href');
        url = '/food/edit-ingredient/' + pk;
        formdiv = $('<div/>').addClass('formbox').addClass('editbox');
        safeSnap(formdiv, e.pageX, e.pageY);
        formdiv.hide().prependTo($('body'));
        formdiv.load(url, function() {
            formdiv.slideDown(100);
            $('.uibutton').button();
        });

        $(formdiv).submit(function(e) {
            e.preventDefault();
            $.post(url, $(formdiv).children('form').serialize(), function(data) {
                formdiv.html(data);
                $('.uibutton').button();
            });
            return true;
        });
        return true;
    });
});


/* Ajax load meal list */
function load_meals(qtype)
{
    /* Store qtype for later */
    window.qtype = qtype;

    /* Show nice loading message */
    $('#meal_ajax_container').html('<center><br/><p>Loading...</p></center>');

    /* Build list of ingredient pks */
    ingredient_pks = Array();
    $.each($('#ingredients li.selected > span.hidden_pk'), function() {
        ingredient_pks.push(this.innerHTML);
    });

    /* Get meals */
    $('#meal_ajax_container').load('/food/get-meals/?qtype=' + qtype, {
        'ingredient_pks': JSON.stringify(ingredient_pks)
    }, function() {

        /* Apply needed jquery */

        if (window.show_edit)
        {
            $('.edit').css('visibility', 'visible');
        }   

        $('.meal > a').click(function (e) {
            e.preventDefault();
            pk = $(this).attr('href');
            url = '/food/edit-meal/' + pk;
            formdiv = $('<div/>').addClass('formbox').addClass('editbox');
            safeSnap(formdiv, e.pageX, e.pageY);
            formdiv.hide().prependTo($('body'));
            formdiv.load(url, function() {
                formdiv.slideDown(100);
                $('.uibutton').button();
            });

            $(formdiv).submit(function(e) {
                e.preventDefault();
                $.post(url, $(formdiv).children('form').serialize(), function(data) {
                    formdiv.html(data);
                    $('.uibutton').button();
                });
                return true;
            });
            return true;
        });
    });

}

function reload_meals()
{
    if (window.qtype != 'all')
    {
        load_meals(window.qtype);
    }
}

/* Position an element on x,y without overflowing page */
function safeSnap(e, x, y)
{
    e.css('left', Math.min(x, window.innerWidth - 600)).css('top', y);
}







/* Document init logic */
$(function() {
   $('#' + window.qtype).click(); 
});