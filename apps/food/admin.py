from django.contrib import admin
from food.models import *


class MealAdmin(admin.ModelAdmin):
    fields = ('name', 'description', 'image')


class IngredientAdmin(admin.ModelAdmin):
    fields = ('name', )


admin.site.register(Meal, MealAdmin)
admin.site.register(Ingredient, IngredientAdmin)
