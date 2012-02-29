/* Globals */
var API_ROOT = '/food/api/v1/';
var ingredients, meals;
var new_ingredient_view = null;
var lastFilterType = 'intersection';


// This function checks a var set by django is_authenticated -- doesnt actually allow
// any editing but will show controls.
function documentEditable()
{
    if (window.allowEditActions && window.allowEditActions == true)
    {
        return true;
    }
    return false;
}


/* Models */

var BaseModel = Backbone.Model.extend({
    defaults: {
        editing: false,
    },

    validate: function(attrs) {
        if (attrs.name != null && attrs.name != undefined) {
            if (!typeof(attrs.name) == 'string' || attrs.name.length < 1)
            {
                return "Name cannot be blank";
            }
        }
    },

    enableEditing: function() {
        this.set('editing', true);
    },
})

var Ingredient = BaseModel.extend({
    defaults: {
        selected: false,
    },

    initialize: function() {
        // Refilter
        this.bind('change:selected', function() { 
            filterMealView(); 
        });
    },

    toggleSelection: function() {
        this.set('selected', !this.get('selected'));
    },

    editForm: function() {
        var obj = factory.div().addClass('edit form-inline')
                         .append($('<input class="input-medium" type="text"/>').attr('value', this.get('name')))
                         .append($('<button class="cancel btn">Cancel</button>'))
                         .append($('<button class="save btn">Save</button>'));
        return obj
    },
});

var Meal = BaseModel.extend({
    validate: function(attrs) {
        debugger;
        if (attrs.ingredients == undefined || attrs.ingredients.length < 1)
        {
            return "Must select at least once ingredient.";
        }
    },

    saveFromForm: function(form) {
        // Get ingredients list from form
        ingredient_ids = []
        try
        {
            ingredient_ids = $('#meal-ingredients > option:selected').map(function() { return $(this).val(); });
        }
        catch (e)
        {
            showMealError("Invalid ingredient");
            return;
        }
        ingredient_objects = ingredients.filter(function(ingredient) {
             return _.contains(ingredient_ids, ingredient.id);
        });

        if (ingredient_objects.length < 1)
        {
            ingredient_objects = this.get('ingredients');
        }

        // Save model
        this.save({
            name: form.find('#meal-name').val(),
            description: form.find('#meal-description').val(),
            ingredients: ingredient_objects,
        }, {
            success: function(model, response) {
                fetchMeals();
            },
            error: function(model, response) {
                if (response.status && response.status == 401)
                    return showMealError("You don't have permission to do that.");
                return showMealError(response);
            },
        });
    },
});


/* Views */

var BaseView = Backbone.View.extend({
    initialize: function(options) {
        // Automatically render model changes
        var that = this;
        this.model.bind('change', function() { return that.render() });
    },
});

var IngredientView = BaseView.extend({
    className: 'list-item',
    tagName: 'li',
    
    events: {
        'click .view': 'select',
        'click .edit button.save': 'saveEdit',
        'click .edit button.cancel': 'cancelEdit',
        'dblclick': 'edit',
    },

    select: function() {
        if (!this.model.get('editing'))
        {
            this.model.toggleSelection();
        }
    },

    edit: function() {
        if (documentEditable())
        {
            if (!this.model.get('editing'))
            {
                this.model.set('editing', true);
            }
        }
    },

    saveEdit: function() {
        var that = this;
        var success = function() {
            that.model.set('editing', false);
            if (that == new_ingredient_view)
            {
                new_ingredient_view = null;
            }

            // Repopulate meal list
            fetchMeals();
        }
        var newName = this.$el.children('.edit').children('input').val();
        if (newName != this.model.get('name') || this.model.isNew())
        {
            this.model.save({name: newName}, {
                success: success,
                error: function(model, response) {
                    debugger;
                    if (response.status && response.status == 401)
                        return showIngredientError("You don't have permission to do that.");
                    return showIngredientError(response);
                }
            });
        }
        else
        {
            success();
        }
    },

    cancelEdit: function() {
        this.model.set('editing', false);
    },

    render: function() {
        // Edit view
        if (this.model.get('editing'))
        {
            this.$el.removeClass('selected');
            this.$el.html(this.model.editForm());
        }

        // Default view
        else
        {
            this.$el.html(factory.vdiv().html(this.model.get('name')));
            // Selected view
            if (this.model.get('selected'))
            {
                this.$el.addClass('selected');
            }
            else
            {
                this.$el.removeClass('selected');
            }
        }

        return this;
    },

    updateFilterView: function() {
        debugger;
        filterMealView();  
    },
});

var MealView = BaseView.extend({
    className: 'list-item',
    tagName: 'li',

    events: {
        'dblclick': 'edit',
    },

    edit: function() {
        if (documentEditable())
        {
            inflateMealEditTemplate(this.model).modal();   
        }
    },

    render: function() {
        // Inflate template
        this.$el.html(meal_template);
        this.$el.children('.meal-name').html(this.model.get('name'));
        this.$el.children('.meal-description').html(this.model.get('description'));

        // Add ingredients
        var list = this.$el.children('.meal-ingredients');
        _.each(this.model.get('ingredients'), function(ingredient) {
            list.append($('<li/>').addClass('inner').html(ingredient.name));
        });
        return this;
    },
});

function addIngredientView(model)
{
    // Instantiate view on model
    var view = new IngredientView({
        model: model,
    });

    // Add views element to DOM
    $('#ingredient-list').append(view.$el);

    return view.render();
}

function addMealView(model)
{
    // Instantiate view on model
    var view = new MealView({
        model: model,
    });

    // Add element to dom
    $('#meal-list').append(view.$el);

    return view.render();
}

function populateCollectionViews(collection, viewConstructor, filter)
{
    collection.each(function(model) {
        if (filter == undefined || filter(model))
        {
            viewConstructor(model);
        }
    });
}

function filterMealView(type)
{
    if (type)
    {
        // Cache type
        lastFilterType = type;
    }
    else
    {
        type = lastFilterType;
    }

    // Clear list
    $('#meal-list').empty();

    // Get selected ingredient ids
    var selected_ingredient_ids = _.pluck(ingredients.filter(function(i) { 
        return i.get('selected');
    }), 'id');

    function mealIngredients(meal)
    {
        return _.pluck(meal.get('ingredients'), 'id');
    }

    // Determine filter function based on type
    var filter = function() { return false; }
    if (type == 'all')
    {
        filter = function() { return true; }
    }
    if (type == 'union')
    {
        filter = function(model) {
            return _.any(selected_ingredient_ids, function(id) {
                return _.contains(mealIngredients(model), id);
            });
        }
    }
    if (type == 'intersection' && selected_ingredient_ids.length > 0)
    {
        filter = function(model) {
            return _.all(selected_ingredient_ids, function(id) {
                return _.contains(mealIngredients(model), id);
            });
        }
    }

    populateCollectionViews(meals, addMealView, filter);
}

/* Collections */

var DjangoCollection = Backbone.Collection.extend({

    // Return proper objects from tastypie response
    parse: function(response) {
        return response.objects
    }
});


var Ingredients = DjangoCollection.extend({
    model: Ingredient,
    url: API_ROOT + 'ingredient/',
});

var Meals = DjangoCollection.extend({
    model: Meal,
    url: API_ROOT + 'meal/',
});


function fetchMeals() {
    meals.fetch({
        success: function(collection, response) {
            filterMealView();
            meal_progress.parent('div').remove();
        },
        error: function(collection, response) {
            showMealError("Error loading meal set.");
            meal_progress.parent('div').remove();
        },
    });
}


/* Logic */
$(function() {

    // Create progress bars
    ing_progress = factory.progress($('#ingredient-list')).css('width', '0%');
    meal_progress = factory.progress($('#meal-list')).css('width', '0%');
    _.defer(function() { ing_progress.css('width', '100%'); });
    _.defer(function() { meal_progress.css('width', '100%'); });

    // Load initial data
    ingredients = new Ingredients;
    ingredients.fetch({
        success: function(collection) {
            populateCollectionViews(collection, addIngredientView);
            ing_progress.parent('div').remove();
        },
        error: function(collection) {
            showIngredientError("Error loading ingredient set.");
            ing_progress.parent('div').remove();
        },
    });

    meals = new Meals;
    fetchMeals();

    // Setup non-backbone UI
    $('#add-ingredient').click(function(e) {
        if (!new_ingredient_view)
        {
            // Create a new client-side ingredient and render
            var new_model = new Ingredient({name: 'New Ingredient'});
            ingredients.add(new_model);
            new_ingredient_view = addIngredientView(new_model);
            new_ingredient_view.render();
        }

        // Activate editing and jump to view
        new_ingredient_view.model.enableEditing();
        showEditView(new_ingredient_view);
    });

    $('#add-meal').click(function(e) {
        // Populate edit template
        var new_model = new Meal({name: 'New Meal'});
        meals.add(new_model);
        modal = inflateMealEditTemplate(new_model).modal();
    });


    $('#switch-all').click(function(){ return filterMealView('all') });
    $('#switch-union').click(function(){ return filterMealView('union') });
    $('#switch-intersection').click(function(){ return filterMealView('intersection') });

    $('#help-button').popover({
        placement: 'bottom',
    });

});


/* Factories */
var factory = {}
factory.div = function() { return $('<div/>'); }
factory.vdiv = function() { return factory.div().addClass('view'); }
factory.alert = function(html) { 
    return factory.div().html(html).addClass('alert alert-error');
}
factory.progress = function(element) {
    return $('<div class="progress progress-info progress-striped active"/>').append(
        $('<div class="bar"/>')
    ).prependTo(element).children('div');
}


/* Utility */

function scrollToElement(element)
{
    $(window).scrollTop(element.offset().top - 100);
}

function showEditView(view)
{
    view.$el.children('.edit').children('input').select();
    scrollToElement(view.$el)
}

function showMealError(response) { return showError('#meal-error', response); }
function showIngredientError(response) { return showError('#ingredient-error', response); }

function showError(id, response)
{
    message = response;
    if (response.responseText)
    {
        message = response.responseText
        try
        {
            errorObject = JSON.parse(response.responseText);
            if (errorObject.message)
            {
                message = errorObject.message;
            }
        }
        catch (e)
        {
            // NOP
        }
    }

    var el = $(id).show();
    el.children('p').html("Error: " + message);
    scrollToElement(el);
}


/* Meal edit template */

function inflateMealEditTemplate(model)
{
    // Base template
    var $el = $(meal_edit_template);

    // Populate ingredients widget
    ingredients.filter(function(i) {return !i.isNew()}).forEach(function(ingredient) {
        $el.find('#meal-ingredients').append(
            $('<option/>').attr('value', ingredient.id).html(ingredient.get('name'))
        );
        $el.find('#meal-name').attr('value', model.get('name'));
        $el.find('#meal-description').attr('value', model.get('description'));
    });

    // Setup save button
    $el.find('.save-button').click(function (e) {
        console.log('clicked');
        $el.modal('hide');
        model.saveFromForm($el); 
    });

    return $el;
}

var meal_edit_template = [
    '<div class="modal">'                                           ,
    '   <div class="modal-header">'                                 ,
    '       <a class="close" data-dismiss="modal">×</a>'            ,
    '       <h1>Create/Edit Meal</h1>'                              ,
    '   </div>'                                                     ,
    '   <div class="modal-body">'                                   ,
    '   <form class="form-horizontal">'                             ,  
    '    <div class="control-group">'                               ,
    '        <label class="control-label" for="meal-name">Name</label>'  ,
    '        <div class="controls">'                                ,
    '            <input type="input-xlarge" id="meal-name">'             ,
    '        </div>'                                                ,
    '    </div>'                                                    ,
    '    <div class="control-group">'                               ,
    '        <label class="control-label" for="meal-description">Description</label>',
    '        <div class="controls">'                                ,
    '            <textarea id="meal-description"/>'                      ,
    '        </div>'                                                ,
    '    </div>'                                                    ,
    '    <div class="control-group">',
    '       <label class="control-label" for="meal-ingredients">Ingredients</label>',
    '       <div class="controls">',
    '           <select size="20" id="meal-ingredients" multiple="multiple"/>',
    '       </div>',
    '   </div>',
    '</form>'                                                       ,
    '   </div>'                                                     ,
    '   <div class="modal-footer">'                                 ,
    '       <button class="btn btn-primary save-button">Save</button>',
    '   </div>'                                                     ,
    '</div>'                                                        ,
].join('\n');

var meal_template = [
    '<h2 class="meal-name">Name</h2>',
    '<p class="meal-description">Description</p>',
    '<div class="meal-ingredients">',
    '   <ul/>',
    '</div>',
].join('\n');


/* Page load state */
$(function() {
    $('#switch-intersection').click();
})
