#!/usr/bin/env bash
echo "Compiling bootstrap.less"
lessc apps/mainsite/static/bootstrap/less/bootstrap.less > apps/mainsite/static/bootstrap/css/bootstrap.css
echo "Compiling screen.less"
lessc apps/mainsite/static/css/screen.less > apps/mainsite/static/css/screen.css
echo "Running collectstatic"
python manage.py collectstatic
echo "Deploying static to m9"
rsync -avz staticfiles/ m:~/web/heroku/mealspace/static/
