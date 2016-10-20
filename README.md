# localapp

Learning project that allows admin user to add neighbourhoods and parks around them. This project also supports a rest api implementation.

### Demo
[ParksApp](http://parksapp.herokuapp.com)

### Some major routes are 

    /api/v1/neighborhoods - returns a list of all neighborhoods

    /api/v1/getparks/:nid - returns parks around a neighborhood is passed in

    /api/v1/createneighborhood - create new neighbourhood

### Frontend

There is no frontend for this application but admin panel is present. Templating is done using ejs.

### Instructions to deploy
##### If deploy to Heroku
Create an account and new Database on mlab under free version. Add credentials in config/database.js file.

1. Create an account on Heroku.
2. Create a new app.
3. After app is created, click on Resources tab.
4. Search for mlab, click on it and provision a free version.
5. Create a repository on bitbucket or github.
6. Download and install heroku toolbelt.
7. Inside your app folder on local, type following commands:

    git init
    git remote add origin ..url to git repo ending with .git w/o double dots ..
    git push -u origin --all
    heroku login, and fill in your credentials
    heroku git:remote -a app-name
    git push heroku master

8. Your app is now hosted on Heroku, you can check by visiting app-name from heroku.herokuapp.com