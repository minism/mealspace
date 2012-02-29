from django.conf.urls.defaults import patterns, include, url
from tastypie.api import Api

import food.views
from food.api import IngredientResource, MealResource

# API objects
api = Api(api_name='v1')
api.register(IngredientResource())
api.register(MealResource())


urlpatterns = patterns('',
    url(r'^$', 'food.views.index'),
    url(r'^api/', include(api.urls)),

    # Old Ajax
    # url(r'^get-meals/', 'food.views.ajax_get_meals'),
    # url(r'^edit-ingredient/(\d+)', 'food.views.ajax_edit_ingredient'),
    # url(r'^edit-ingredient/', 'food.views.ajax_edit_ingredient'),
    # url(r'^edit-meal/(\d+)', 'food.views.ajax_edit_meal'),
    # url(r'^edit-meal/', 'food.views.ajax_edit_meal'),
)
