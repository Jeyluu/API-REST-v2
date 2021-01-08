const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const overRide = require('method-override');


//upload image
const multer = require('multer');
var upload = multer({dest: 'uploads/'})

//express
const port = 1992;
const app = express();

//express static
app.use(express.static('public'));

//Method-override
app.use(overRide("_method"));
// Handlebars
app.engine('hbs', exphbs({defaultLayout: 'main', extname: 'hbs', handlebars: allowInsecurePrototypeAccess(Handlebars)}));
app.set('view engine', 'hbs')

// BodyParser
app.use(bodyParser.urlencoded({
    extended: true
}));


// MongoDB
//connection à mongoDb
mongoose.connect("mongodb://localhost:27017/boutiqueGames", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
//création d'un schema pour la collection
const productSchema = {
    title: String,
    content: String,
    price: Number,
    cover: { // pour ajouter l'image
        name: String,
        originalName: String,
        path: String,
        createAt: Date // date de création
    }
};
//Création d'un modèle
const Product = mongoose.model("product", productSchema);

// Routes
//on renvoit la vue Index.hbs sur le serveur pour l'afficher dans le localhost:4000
//pour afficher le mario bros la formule ci-dessous
app.route('/')
.get((req,res) => {
    Product.find(function(err, produit) {
    if(!err) {
    res.render("index", {
        product: produit
    })
    } else {
    res.send(err)
    }
    })
})

.post(upload.single('cover'),(req,res) => {//ajout du contenu dans la base de donnée // upload.single = middleware pour upload une image
    
    const file = req.file
    console.log(file)
    
    const newProduct = new Product({// permet d'afficher le contenu qui va être rentré sur internet
    title: req.body.title,
    content: req.body.content,
    price: req.body.price
    });

    if(file) {
        newProduct.cover = {
            name: file.filename,
            originalName: file.originalname,
            path: file.path,
            createAt: Date.now()
        }
    }


    newProduct.save(function(err) {
        if(!err) {
            res.send('Save done')
        } else {
            res.send(err)
        }
    })
})

.delete(function(req,res) {
    Product.deleteMany(function(err) {
        if(!err) {
            res.send('Tout à bien été effacé')
        } else {
            res.send(err)
        }
    })
});


//Route fichier Edition 
app.route("/:id")
.get(function(req,res) {//pour afficher l'URL
    Product.findOne(//on recupère le modèle avec Product
        {_id : req.params.id}, //params.id recupère l'identifiant dans l'objet de la base de donnée car l'ID ne changera jamais.
        function(err, produit) { //nous allons utiliser la valeur produit ci-dessous. Et produit va chercher les valeur dans product ligne 74 avec la fonction findOne
            if(!err) {
                res.render("edition",{ //edition est le nom du fichier dans views c'est en faite une autre page
                    _id: produit.id,
                    title: produit.title,
                    content:produit.content,
                    price:produit.price
                })
            } else {
                res.send(err)
            }
        }
    )
})

.put(function(req,res) {
    Product.updateOne( //methode updateOne à besoin de 3 arguments
        //argument condition
            {_id: req.params.id},
        //argument update
            {
                title: req.body.title,
                content: req.body.content,
                price: req.body.price
            },
        //argument option
            {multi:true}, //multi veut dire que l'on veut modifier plusieurs chose en même temps.
        //argument execution
        function(err){
            if(!err) {
                res.send('Mise à jour faite !'),
                console.log('La mise à jour a bien été prise en compte')
            } else {
                res.send(err),
                console.log("Erreur 404 : La mise à jour n'a pas pu être prise en compte")
            }

        }
    )
})

.delete(function(req,res) {
    Product.deleteOne(
        {_id: req.params.id},
        function(err) {
            if(!err) {
                res.send('Produit supprimé de la base de donnée')
            } else {
                res.send(err)
            }
        }
    )
})


app.listen(port, function() {
    console.log(`Ecoute le port ${port}, lancé à : ${new Date().toLocaleString()}`);
    
})