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