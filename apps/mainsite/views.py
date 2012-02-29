from django import http
from django import template
from django.conf import settings
from django.shortcuts import render
from django.contrib.auth import logout, login
from django.http import HttpResponseRedirect


def logout_view(request):
    logout(request)
    next = request.GET.get('next', '/')
    return HttpResponseRedirect(next)


def error500(request, template_name='500.html'):
    t = template.loader.get_template(template_name)
    context = template.Context({
        'STATIC_URL': settings.STATIC_URL,
    })
    return http.HttpResponseServerError(t.render(context))


def error404(request, template_name='404.html'):
    t = template.loader.get_template(template_name)
    context = template.Context({
        'STATIC_URL': settings.STATIC_URL,
    })
    return http.HttpResponseNotFound(t.render(context))

