from django.conf.urls.defaults import patterns, include, url
from django.conf import settings
from django.contrib import admin
import food.urls

admin.autodiscover()

handler500 = 'mainsite.views.error500'
handler404 = 'mainsite.views.error404'

urlpatterns = patterns('',


    url(r'^$', 'food.views.index'),
    url(r'^food/', include(food.urls)),
    url(r'^admin/', include(admin.site.urls)),

    # Auth
    url(r'^login/', 'django.contrib.auth.views.login'),
    url(r'^logout/', 'mainsite.views.logout_view'),

)

