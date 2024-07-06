const Product = require("../models/product");
const ITEMS_PER_PAGE = 10;
exports.getProducts = async (req ,res , next) => {
    try{
        const page = +req.query.page || 1;
        const totalProducts = await Product.find().countDocuments();
        const productsToSkip = (page-1) * ITEMS_PER_PAGE;

        if(totalProducts == 0){
            throw new Error("No products found").statusCode(404);
        }
        const products = await Product.find().select('_id title price mainImage').skip(productsToSkip).limit(ITEMS_PER_PAGE);
        return res.status(200).json({
            products : products,
            currentPage : page,
            totalPages : Math.ceil(totalProducts/ITEMS_PER_PAGE)
        })
    }
    catch(err){
        next(err);
    }
}

exports.getProduct = async (req , res , next) => {
    try{
        const product = await Product.findById(req.params.productID);
        if(!product){
            return res.status(404).json({
                message : "Product not found with the given ID"
            })
        }
        return res.status(200).json({
            product : product
        })
    }
    catch(err){
        next(err);
    }
}

