require('dotenv').config()

const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const mongoose = require('mongoose')
const api = require('./api')
const session = require('koa-session')

const app = new Koa()
const router = new Router()

const {
// if value is not existed, use port 4000 for default
  PORT: port = 4000,
  MONGO_URI: mongoURI,
  COOKIE_SIGN_KEY: signKey
} = process.env

// set to use Promise of Node
mongoose.Promise = global.Promise
mongoose.connect(mongoURI).then(() => {
  console.log('connected to mongodb')
}).catch((e) => {
  console.error(e)
})

// apply api router
router.use('/api', api.routes())

// apply bodyParser before applying router
app.use(bodyParser())

// apply session and key
const sessionConfig = {
  maxAge: 86400000 // 1 day validation
}

app.use(session(sessionConfig, app))
app.keys = [signKey]

// apply router in app instence
app.use(router.routes()).use(router.allowedMethods())

app.listen(port, () => {
  console.log('listening to port', port)
})