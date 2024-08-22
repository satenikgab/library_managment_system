const express = require("express")
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/library");
const PORT = 3001;
const app= express();
app.use(bodyParser.json());

const bookSchema = new mongoose.Schema({
    title:String,
    pages:Number,
    author:{ type: mongoose.Schema.Types.ObjectId, ref: "authors"},
});

const authorSchema = new mongoose.Schema({
    name:String,
    birthDate:Date,
    nationality:{
        type:String,
        enum:["American", "Belgian", "Russian", "Armenian"],
    }
});

const Book = mongoose.model("books",bookSchema);

const Author = mongoose.model("authors",authorSchema);

app.post("/add", async(req, res) => {
    const {title, pages, name, birthDate, nationality} = req.body;
    if(!title || !pages || !name || !birthDate || !nationality){
        return res.status(400).send("Invalid data");
    }
    try {
            
    const author = new Author({
        name,
        birthDate,
        nationality
    });
    const savedAuthor = await author.save();
    
    const book = new Book({
        title,
        pages,
        author:savedAuthor._id
    });

    await book.save();

    res.send(200).status("Ok");

    } catch {
        res.status(500).send("Error adding book or author");
    }
});

app.get("/books", async (req, res)=>{
    const books = await Book.find().populate("author").exec();
    if(!books){
        return res.status(404).send("Books not found");
    }
    res.status(200).send(books);
})


app.get("/book", async (req, res)=>{

    const title = req.query;

    try {
        const book = await Book.findOne(title).populate("author").exec();
        if (!book) {
            return res.status(404).send("book not found");
        }
        res.status(200).send(book);

    }  catch {
        res.status(500).send("Error getting book");
         
    }
    
    
});

app.put("/book", async (req, res) => {
    const { title } = req.query; 
    if (!title) {
        return res.status(400).send("Title required");
    }

    const updatedData = req.body; 

    try {
        const updatedBook = await Book.findOneAndUpdate(
            { title },     
            { $set: updatedData }, 
            { new: true, runValidators: true } 
        );

        if (!updatedBook) {
            return res.status(404).send("Book not found");
        }

    
        res.status(200).send("Updated successfully");
    } catch  {
        
        res.status(500).send("Error updating book");
    }
});

app.delete("/book", async (req, res) => {
    const { title } = req.query; 
    if (!title) {
        return res.status(400).send("Title required");
    }
    try {
       await Book.deleteOne({title});
       res.status(200).send("deleted successfully");
    
    } catch {
        res.status(500).send("Error deleting book");

    }

})

app.listen(PORT,() => {
    console.log("Server running" );
});
