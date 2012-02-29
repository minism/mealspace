from django.forms import ModelForm
from django import forms
from food.models import *
from django.template.defaultfilters import slugify


class IngredientForm(ModelForm):
    class Meta:
        model = Ingredient
        fields = ('name', 'description')

    description = forms.CharField(required=False, widget=forms.Textarea)
    description.widget.attrs = {
        'cols': 25,
        'rows': 5,
    }

    def clean(self):
        super(IngredientForm, self).clean()
        cleaned_data = self.cleaned_data
        if not cleaned_data.get('name'):
            msg = "Name cannot be blank."
            self._errors['name'] = self.error_class([msg])
            raise forms.ValidationError(msg)
        slug = slugify(cleaned_data['name'])
        if len(Ingredient.objects.filter(slug=slug)) > 0:
            msg = "This ingredient already exists."
            self._errors['name'] = self.error_class([msg])
            raise forms.ValidationError(msg)
        cleaned_data['slug'] = slug
        return cleaned_data


class MealForm(ModelForm):
    class Meta:
        model = Meal
        fields = ('name', 'description', 'image', 'ingredients')

    description = forms.CharField(required=False, widget=forms.Textarea)
    description.widget.attrs = {
        'cols': 40,
        'rows': 6,
    }

    def clean(self):
        super(MealForm, self).clean()
        cleaned_data = self.cleaned_data
        if not cleaned_data.get('name'):
            msg = "Name cannot be blank."
            self._errors['name'] = self.error_class([msg])
            raise forms.ValidationError(msg)
        slug = slugify(cleaned_data['name'])
        if len(Meal.objects.filter(slug=slug)) > 0:
            msg = "This meal already exists."
            self._errors['name'] = self.error_class([msg])
            raise forms.ValidationError(msg)
        cleaned_data['slug'] = slug
        return cleaned_data
