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


if getattr(settings, 'DEBUG', False) or getattr(settings, 'DEBUG_STATIC', False):
    # If we are in debug mode, prepend a rule to urlpatterns to serve the static media
    import re
    urlpatterns = patterns('',
        url(r'^%s(?P<path>.*)$' % re.escape(settings.STATIC_URL), 'django.views.static.serve', {
            'document_root': settings.STATIC_ROOT
        }),
    ) + urlpatterns
