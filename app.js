const request = require('request')
const cheerio = require('cheerio')
const express = require('express')
const bodyParser = require('body-parser');
const router = express.Router();
const app = express()


const log = function () {
  console.log.apply(console, arguments)
}

function Article() {
  this.title = ''
  this.videoUrl = ''
  this.coverUrl = ''
}

const saveArticle = function (article) {
  const fs = require('fs')
  const path = './public/article.json'
  const s = JSON.stringify(article, null, 2)
  fs.writeFile(path, s, function (error) {
    if (error !== null) {
      log('*** 写入文件错误', error)
    } else {
      log('--- 保存成功')
    }
  })
}



const articleFromUrl = function (url) {
  request(url, function (error, response, body) {
    // 回调函数的三个参数分别是  错误, 响应, 响应数据
    // 检查请求是否成功, statusCode 200 是成功的代码
    if (error === null && response.statusCode == 200) {
      // cheerio.load 用字符串作为参数返回一个可以查询的特殊对象
      const e = cheerio.load(body)
      var task = [];
      //文章数组,页面上是没有的,在js中,通过正则截取出来
      var msglist = body.match(/var msgList = ({.+}}]});?/);
      if (!msglist) return callback(`-没有搜索到,只支持订阅号,服务号不支持!`);
      msglist = msglist[1];
      msglist = msglist.replace(/(&quot;)/g, '\\\"').replace(/(&nbsp;)/g, '');
      msglist = JSON.parse(msglist);
      if (msglist.list.length == 0) return callback(`-没有搜索到,只支持订阅号,服务号不支持!`);

      var linkUrl = []
      var listurl = ''

      for (let i = 0; i < msglist.list.length; i++) {

        const msg = msglist.list[i];
        var article_first = msg.app_msg_ext_info;
        var article_others = article_first.multi_app_msg_item_list
        listurl = 'https://mp.weixin.qq.com' + article_first.content_url.replace(/(amp;)|(\\)/g, '')
        linkUrl.push(listurl)

        for (let i = 0; i < article_others.length; i++) {
          listurl = 'https://mp.weixin.qq.com' + article_others[i].content_url.replace(/(amp;)|(\\)/g, '')
          linkUrl.push(listurl)
        }
      }

      for (var i = 0; i < linkUrl.length; i++) {
        request(linkUrl[i], function (error, response, body) {
          if (error === null && response.statusCode == 200) {
            var article = new Article()
            const e = cheerio.load(body)
             article.title = body.match(/var msg_title = (".+");?/);
			if(!article.title){
				article.title = ['"此篇违规"','"此篇违规"']
				article.title = article.title[1];
				article.title = JSON.parse(article.title);
			}else{
				article.title = article.title[1];
				article.title = JSON.parse(article.title);
			}
            
            article.videoUrl = e('.video_iframe').attr('data-src');
			if(!e('.video_iframe').attr('data-src')){
				article.videoUrl = e('.video_iframe').attr('src');
			}

            article.coverUrl = body.match(/var msg_cdn_url = (".+");?/);
			if(!article.coverUrl){
				article.coverUrl = ['"此篇违规"','"此篇违规"']
				article.coverUrl = article.coverUrl[1];
				article.coverUrl = JSON.parse(article.coverUrl);
			}else{
				article.coverUrl = article.coverUrl[1];
				article.coverUrl = JSON.parse(article.coverUrl);
			}

            task.push(article);
            saveArticle(task);
          }
        })
      }

    } else {
      console.log('*** ERROR 请求失败 ', error)
    }

  })
}

app.use(express.static('public'))
app.use(function(req, res, next) { 
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => res.send('./public/index.html'))
app.get('/url.json', (req, res) => res.send('./public/url.json'))

app.post('/url.json', function(req, res, next) {
  // 获取参数
  var query = req.body;
  console.log("post请求：参数", query);
  res.send(query);
  const __main = function () {
    articleFromUrl(query.url);
  }
  __main()
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))

 