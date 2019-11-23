const app = require('express')()
const bodyParser = require('body-parser')
const argPort = process.argv[2]
const port = !!argPort ? +argPort : 9580
const config = require('../config')

if (config.log4js) {
  require('../log4js/index')
}

app.engine('html', require('ejs').renderFile);
app.use(bodyParser.json({limit: '2mb'}))
app.use(bodyParser.urlencoded({limit: '2mb', extended: true}))
app.use((req, resp, next) => {
    resp.header("Access-Control-Allow-Credentials", true)
    resp.header('Access-Control-Allow-Origin', '*')
    resp.header('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
    resp.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    next()
})

app.use('/index', (req, res) => {
	res.render("index.html",{ title:"hello" })
})

app.listen(port, () => {
    console.log('server start!')
    console.log(`port is ${port}`)
})
