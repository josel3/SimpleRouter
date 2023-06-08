require('dotenv').config()
const fetch = require('node-fetch')
const fs = require('fs')
const https = require('http')
const url = require('url')

const apiKey = process.env.REST_API_KEY
const port = process.env.PORT

const listener = (req, res) => {
    const jsonBody = {error: null, data: null, code: 200}
    let search = url.parse(req.url).search
    let pathname = url.parse(req.url).pathname
    console.log('serving: ',req.url, pathname, search)
    const params = queryParams(req.url)
    if (pathname === "/findsequence") {
        fetch(`https://wse.ls.hereapi.com/2/findsequence.json${search}&apiKey=${apiKey}`)
        .then(data=>data.json())
        .then((json)=>{
            console.log(json)
            res.setHeader("Content-Type", "application/json")
            res.statusCode=jsonBody.code
            res.end(JSON.stringify(json))
        })
    }
    if(pathname === "/geocode"){
        
        fetch(`https://geocode.search.hereapi.com/v1/geocode${search}&qq=city=Córdoba&limit=1&at=-31.4135,-64.18105&in=countryCode:ARG&apiKey=${apiKey}`)
        .then(data=>data.json())
        .then((json)=>{
            console.log(json)
            res.setHeader("Content-Type", "application/json")
            res.statusCode=jsonBody.code
            res.end(JSON.stringify(json))
        })      
    }
    if(req.url === "/apikey"){
            console.log('inside apikey');   
            res.setHeader("Content-Type", "application/json")
            res.statusCode=jsonBody.code
            res.end(`{"key": "${process.env.FRONTEND_API_KEY}"}`)
              
    }
    if(req.url === "/"){
        res.setHeader("Content-Type", "text/html")
        fs.readFile('./source/index.html', (err , data)=>{
            if(err){
                res.statusCode = 500
                res.statusMessage = 'internal server error'
                res.end(res.statusMessage)
            }
            else{
                res.end(data)
            }
        })
    }
    if(req.url === "/mapFunctions.js"){
        res.setHeader("Content-Type", "application/javascript")
        fs.readFile('./source/mapFunctions.js', (err , data)=>{
            if(err){
                res.statusCode = 500
                res.statusMessage = 'internal server error'
                res.end(res.statusMessage)
            }
            else{
                res.end(data)
            }
        })
    }
    if(req.url === "/style.css"){
        res.setHeader("Content-Type", "text/css")
        fs.readFile('./source/style.css', (err , data)=>{
            if(err){
                res.statusCode = 500
                res.statusMessage = 'internal server error'
                res.end(res.statusMessage)
            }
            else{
                res.end(data)
            }
        })
    }
}

function queryParams(url) {
    let paramString = ""
    const paramStart = url.indexOf("?")
    if (paramStart !== -1) {
        paramString = url.substring(paramStart)
    }
    return paramString
}

function getData(res, jsonBody) {
    console.log(res, jsonBody);
    const { statusCode } = res;
    let error
    jsonBody.code = statusCode
    
    if (statusCode !== 200) {
        error = new Error(`Peticion fallida: ${statusCode}`);
    } 
    if (error) {
        console.error(error.message);
        jsonBody.error = error
        res.resume();
        return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const parsedData = JSON.parse(rawData);
            jsonBody.data = parsedData
        } catch (e) {
            console.error(e.message);
            jsonBody.error = e
        }
    });   
}

https.createServer(listener).listen(port, ()=>console.log('backend runinng! at port: ' + port))