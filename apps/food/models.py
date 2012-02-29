import os

from mainsite.settings import UPLOAD_ROOT
from django.db import models
import basic_models.models


class Ingredient(basic_models.models.DefaultModel):
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        ordering = ['name']

    def __unicode__(self):
        return self.name

class Meal(basic_models.models.DefaultModel):
    name = models.CharField(max_length=1024)
    ingredients = models.ManyToManyField(Ingredient)
    description = models.TextField(max_length=2**16, null=True, blank=True)
    image = models.ImageField(upload_to=os.path.join(UPLOAD_ROOT, 'images'), null=True, blank=True)

    class Meta:
        ordering = ['name']

    def __unicode__(self):
        return self.name
