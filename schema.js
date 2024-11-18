const Joi = require('joi');

//product
module.exports.productSchema = Joi.object({
    product : Joi.object({
        // title: Joi.string().required(),
        // description : Joi.string().required(),
        // location : Joi.string().required(),
        // country : Joi.string().required(),
        // price : Joi.number().required().min(0),
        // category: Joi.string().required(),
    }).required() 
});


//service
module.exports.servicesSchema = Joi.object({
    service: Joi.object({
        // rating : Joi.number().required().min(1).max(5),
        // comment: Joi.string().required(),
    }).required()
})


//team


//review