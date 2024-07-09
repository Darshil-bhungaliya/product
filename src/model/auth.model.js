import Joi from 'joi';

export const validateUser = function validateUser(user) {
    const JoiSchema = Joi.object({

        firstname: Joi.string()
            .min(3)
            .max(30)
            .required(),
        lastname: Joi.string()
            .min(3)
            .max(30)
            .required(),

        email: Joi.string()
            .email()
            .min(3)
            .max(50)
            .required(),
        password: Joi.string()
            .min(5)
            .max(30)
            .required()
    })

    return JoiSchema.validate(user)
}