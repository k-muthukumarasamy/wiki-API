const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/wikiDB", {useNewUrlParser: true, useUnifiedTopology: true});

const articleSchema = new mongoose.Schema({
  title: String,
  content: String
});

const Article = mongoose.model("Article", articleSchema);
app.get("/", function(req, res){
  res.send("Server Started @ 3000 ...");
});

// chained route handlers for all articles
app.route("/articles")
.get(function(req, res){
  Article.find(function(err, articles){
    if(!err){
      res.send(articles);
    }else{
      res.send(err);
    }
  })
})
.post(function(req, res){
  const article = new Article({
    title: req.body.title,
    content: req.body.content
  });
  article.save(function(err){
    if(!err){
      res.send("Document Post Success ...");
    }else{
      res.send(err);
    }
  });
})
.delete(function(req, res){
  Article.deleteMany(function(err){
    if(!err){
      res.send("Delete All Success ...");
    }else{
      res.send(err);
    }
  })
});



// chained route handlers for specific article
app.route("/articles/:articleName")
.get(function(req, res){
  const articleName = req.params.articleName;
  Article.findOne({title: articleName}, function(err, article){
    if(article){
      res.send(article);
    }else{
      res.send("Article not found ...");
    }
  });
})
.put(function(req, res){
  const articleName = req.params.articleName;
  const article = {
    title: req.body.title,
    content: req.body.content
  };
  const options = {
    new: "false"
  };

  // use findOne and replace
  Article.findOneAndReplace({title: articleName}, req.body,options, function(err, newArticle){
    if(!err){
      if(newArticle){
        res.send("Article PUT success ...");
      }else{
        res.send("Article not found ...");
      }
    }else{
      res.send(err);
    }
  });
})
.patch(function(req, res){
  // {overwrite: true} ; this option is set to true in case of PUT;
  // replaces the old document with the new document, it will remove the undefined attribute

  // {title: req.body.title, content: req.body.content} replaced with req.body

  // {omitUndefined: true}; prevent saving the undefined value and omits it during the update;
  // used when values are specified at attribute level ie) {title: req.body.title, content: req.body.content}

  //$set:{req.body} or $set:{title: req.body.title, content: req.body.content} ; set can also be used to specify the value to update

  const articleName = req.params.articleName;
  // console.log(req.body);
  Article.update({title: articleName}, req.body, function(err){
    if(!err){
      res.send("Article PATCH success ...");
    }else{
      res.send(err);
    }
  });
})
.delete(function(req, res){
  const articleName = req.params.articleName;
  Article.deleteOne({title: articleName}, function(err){
    if(!err){
      res.send("Article DELETE success ...");
    }
    else{
      res.send(err);
    }
  })
});

app.listen(3000, function(){
  console.log("Server started @ 3000 ...");
});
