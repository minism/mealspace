import markdown
import string
import random
import json

from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import render
from django.contrib.auth import login, authenticate
from django.db.models import Q
from django import http
from food.forms import *
from food.models import *

def index(request):
        # elif request.POST.get('command', '') == 'ingredient':
        #     ingredient_form = IngredientForm(data=request.POST)
        #     if ingredient_form.is_valid():
        #         cleaned_data = ingredient_form.cleaned_data
        #         ingredient = Ingredient()
        #         ingredient.name = cleaned_data.get('name')
        #         ingredient.slug = cleaned_data.get('slug')
        #         ingredient.description = cleaned_data.get('description')
        #         ingredient.save()
        #     else:
        #         showform = '#ingredientform'

        # elif request.POST.get('command', '') == 'meal':
        #     meal_form = MealForm(data=request.POST)
        #     if meal_form.is_valid():
        #         cleaned_data = meal_form.cleaned_data
        #         meal = Meal()
        #         meal.name = cleaned_data.get('name')
        #         meal.slug = cleaned_data.get('slug')
        #         meal.description = cleaned_data.get('description')
        #         meal.image = cleaned_data.get('image')
        #         meal.save()
        #         for ingredient in cleaned_data.get('ingredients', []):
        #             meal.ingredients.add(ingredient)
        #     else:
        #         showform = '#mealform'

    context = {
        'ingredients': Ingredient.active_objects.all(),
    }
    return render(request, 'food/index.html', context)


def ajax_edit_ingredient(request, pk):
    if request.is_ajax():
        ingredient = Ingredient.objects.get(pk=int(pk))
        success = False
        if request.method == 'POST':
            # Unique name hack
            tmpslug = ingredient.slug
            ingredient.slug = ''.join([random.choice(string.ascii_letters) for i in range(32)])
            ingredient.save()
            form = IngredientForm(data=request.POST)
            if form.is_valid():
                cleaned_data = form.cleaned_data
                ingredient.name = cleaned_data.get('name')
                ingredient.slug = cleaned_data.get('slug')
                ingredient.description = cleaned_data.get('description')
                ingredient.save()
                success = True
            else:
                ingredient.slug = tmpslug
                ingredient.save()
        else:
            form = IngredientForm(instance=ingredient)
        context = {
            'form': form,
            'pk': pk,
            'success': success,
        }
        return render(request, 'food/ajax_edit_ingredient.html', context)
    return http.HttpResponseBadRequest()


def ajax_edit_meal(request, pk):
    if request.is_ajax():
        meal = Meal.objects.get(pk=int(pk))
        success = False
        if request.method == 'POST':
            form = MealForm(data=request.POST)
            # Unique name hack
            tmpslug = meal.slug
            meal.slug = ''.join([random.choice(string.ascii_letters) for i in range(32)])
            meal.save()
            if form.is_valid():
                cleaned_data = form.cleaned_data
                meal.name = cleaned_data.get('name')
                meal.slug = cleaned_data.get('slug')
                meal.description = cleaned_data.get('description')
                meal.image = cleaned_data.get('image')
                meal.save()
                meal.ingredients.clear()
                for ingredient in cleaned_data.get('ingredients', []):
                    meal.ingredients.add(ingredient)
                success = True
            else:
                meal.slug = tmpslug
                meal.save()
        else:
            form = MealForm(instance=meal)
        context = {
            'form': form,
            'pk': pk,
            'success': success,
        }
        return render(request, 'food/ajax_edit_meal.html', context)
    return http.HttpResponseBadRequest()


def ajax_get_meals(request):
    if not request.is_ajax():
        return http.HttpResponseBadRequest()
    qtype = request.GET.get('qtype', 'all')
    if qtype not in ('all', 'union', 'intersection', 'strict'):
        return http.HttpResponseBadRequest("Invalid query type")
    meals = []
    ingredient_pks = map(int, json.loads(request.POST.get('ingredient_pks', [])))
    if qtype == 'all':
        meals = Meal.active_objects.all()
    elif qtype == 'union':
        meals = Meal.active_objects.filter(ingredients__pk__in=ingredient_pks).distinct()
    elif qtype == 'intersection':
        if len(ingredient_pks) > 0:
            meals = Meal.active_objects.all()
            for pk in ingredient_pks:
                meals = meals.filter(ingredients__pk=pk)
    elif qtype == 'strict':
        meals = []
    context = {
        'meals': meals
    }
    return render(request, 'food/meal_list.html', context)



