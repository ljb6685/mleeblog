# Blog application - Backend
>NodeJS and Koa framework were used to build the backend. Koa framework was developed by refactoring Express. In this project, I used Koa framework to make it easier to manage asynchronous tasks, avoiding callback hell and apply middleware by using async/await.

## REST API
* POST /posts - Write new post
* GET /posts - Search post list
* GET /posts/:id - Search post
* DELETE /posts/:id - Remove post
* PATCH /posts/:id - Update post

## Database
MongoDB was used and connected to the database using mongoose.

## Pagenation
Mongoose-pagination library was used.

## Admin Login
The user can create, edit, and delete posts only when logged in as an administrator.