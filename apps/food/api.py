from tastypie.resources import ModelResource
from tastypie.authentication import Authentication
from tastypie.authorization import Authorization
from tastypie.validation import Validation
from tastypie import fields

from food.models import Ingredient, Meal


class RequestAuthentication(Authentication):
    def apply_limits(self, request, object_list):
        if request and hasattr(request, 'user') and request.user.is_authenticated():
            return object_list.all()
        return object_list.none()


class RequestAuthorization(Authorization):
    def is_authorized(self, request, obj=None):
        if request and hasattr(request, 'user') and request.user.is_authenticated():
            return True
        if request.method in ('POST', 'PUT', 'DELETE'):
            return False
        return True



class IngredientValidation(Validation):
    def is_valid(self, bundle, request=None):
        errors = {}
        if not bundle.data or not bundle.data.get('name'):
            return {'message': "No data or no name in model"}
        if len(Ingredient.objects.filter(name=bundle.data.get('name'))) > 0:
            errors['message'] = "Ingredient '%s' already exists." % bundle.data.get('name')
        return errors



class IngredientResource(ModelResource):
    class Meta:
        queryset = Ingredient.active_objects.all()
        resource_name = 'ingredient'
        authentication = RequestAuthentication()
        authorization = RequestAuthorization()
        validation = IngredientValidation()
        excludes = [
            'created_at',
            'updated_at',
        ]

class MealResource(ModelResource):
    ingredients = fields.ManyToManyField(IngredientResource, 'ingredients', full=True)

    class Meta:
        queryset = Meal.active_objects.all()
        resource_name = 'meal'
        authentication = RequestAuthentication()
        authorization = RequestAuthorization()
        excludes = [
            'created_at',
            'updated_at',
        ]
