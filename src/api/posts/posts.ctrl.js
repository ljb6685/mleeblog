const Post = require('../../models/post')
const Joi = require('joi')

// Validation of ObjectId (middleware added on index.js)
const { ObjectId } = require('mongoose').Types

exports.checkObjectId = (ctx, next) => {
  const { id } = ctx.params
  if(!ObjectId.isValid(id)) {
    ctx.status = 400 // Requested by wrong id (400 error)
    return null
  }
  return next()
}

exports.checkLogin = (ctx, next) => {
  if (!ctx.session.logged) {
    ctx.status = 401 // Unauthorized
    return null
  }
  return next()
}

// Create posts (POST)
exports.write = async (ctx) => {
// Validation of keys using Joi
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required()
  })
  const result = Joi.validate(ctx.request.body, schema)
  
  if (result.error) {
    ctx.status = 400
    ctx.body = result.error
    return
  }

  const { title, body, tags } = ctx.request.body
  const post = new Post({  // Created new Post instance
    title, body, tags
  })  
  try {
    await post.save()  // Register on database
    ctx.body = post  // Return result
  } catch(e) {  // Error occurs on database
    ctx.throw(e, 500)  // Sever internal error (500)
  }
}

// Search all posts (GET) including pagination
exports.list = async (ctx) => {
  const page = parseInt(ctx.query.page || 1, 10)
  const { tag } = ctx.query
  const query = tag ? {
    tags: tag // Search post by tag from tags array
  } : {}

  if (page < 1) {
    ctx.status = 400
    return
  }

  try {
    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)  // Each page having 10 posts
      .lean()
      .exec();
    const postCount = await Post.countDocuments(query).exec()
    const limitBodyLength = post => ({
      ...post,
      body: post.body.length < 350 ? post.body : `${post.body.slice(0, 350)}...`
    })
    ctx.body = posts.map(limitBodyLength)
    ctx.set('Last-Page', Math.ceil(postCount / 10))
  } catch (e) {
    ctx.throw(500, e)
  }
}

// Search post by id (GET ~/:id)
exports.read = async (ctx) => {
  const { id } = ctx.params
  try {
    const post = await Post.findById(id).exec()
    if(!post) {  // If post is not existed, return 404 error
      ctx.status = 404  // Not found error (404)
      return
    }
    ctx.body = post
  } catch (e) {
    ctx.throw(e, 500)
  }
}

// Delete post by id (DELETE ~/:id)
exports.remove = async (ctx) => {
  const { id } = ctx.params
  try {
    await Post.findByIdAndRemove(id).exec()
    ctx.status = 204
  } catch (e) {
    ctx.throw(e, 500)
  }
}

// Update post by id (PATCH ~/:id)
exports.update = async (ctx) => {
  const { id } = ctx.params;
  try {
    const post = await Post.findByIdAndUpdate(
      id, ctx.request.body, { new: true }).exec()
    if(!post) {  // If post is not existed, return 404 error
      ctx.status = 404
      return
    }
    ctx.body = post  
  } catch(e) {
    ctx.throw(e, 500)
  } 
}