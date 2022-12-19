const User = require('../models/user');
const { clientId, clientSecret, port, jstSecretKey } = require('../config.json');
const { request } = require('undici');
const jwt = require('jsonwebtoken');


// Retrieve and return all users from the database.
exports.findAll = async (req, res) => {
    if(req.headers.suthorization){
        let verification = await User.findOne({token: req.headers.suthorization})
        if(!verification){
            return res.status(400).send({
                status: "failure",
                message: "invalid authentication"
            });
        }
    }
    User.find()
        .then(users => {
            return res.status(200).send({ data: users, status: "success" });
        }).catch(err => {
            return res.status(400).send({
                status: "failure",
                message: err.message || "Something went wrong while getting list of users."
            });
        });
};

exports.discordLogin = async (req, res) => {
    // Validate request
    if (!req.query.code) {
        return res.status(400).send({
            status: "failure",
            message: "Code Is Required"
        });
    }
    if (req.query.code) {
        try {
            const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code: req.query.code,
                    grant_type: 'authorization_code',
                    redirect_uri: `http://localhost:${port}/api/users/code`,
                    scope: 'identify',
                }).toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            const oauthData = await tokenResponseData.body.json();
            console.log("oauthData ===> ", oauthData);
            const userResult = await request('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${oauthData.token_type} ${oauthData.access_token}`,
                },
            });
            // console.log("userResult ====> ",userResult)
            let diccordUser = await userResult.body.json()
            console.log(diccordUser);
            if (diccordUser && diccordUser.id) {
                let data = {
                    time: Date(),
                    discordId: diccordUser.id,
                }
                const token = jwt.sign(data, jstSecretKey);
                const newUser = {
                    token: token,
                    userName: diccordUser.username,
                    email: diccordUser.email,
                    discordId: diccordUser.id,
                    discriminator: diccordUser.discriminator,
                    locale: diccordUser.locale,
                    verified: diccordUser.verified
                };
                // Save user in the database
                User.findOneAndUpdate({discordId: diccordUser.id},newUser,{new: true, upsert: true})
                    .then(data => {
                        return res.status(200).send({ data: data, status: "success" });
                    }).catch(err => {
                        return res.status(400).send({
                            status: "failure",
                            message: err.message || "Something went wrong while creating new user."
                        });
                    });
            }
        } catch (error) {
            return res.status(400).send({
                status: "failure",
                message: err.message || "Something went wrong while creating new user."
            });
        }
    }
};

// Find a single User with a id
exports.findOne = async (req, res) => {  
    if(req.headers.suthorization){
    let verification = await User.findOne({token: req.headers.suthorization})
    if(!verification){
        return res.status(400).send({
            status: "failure",
            message: "invalid authentication"
        });
    }
}
    User.findById(req.params.id)
        .then(user => {
            if (!user) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.id
                });
            }
            res.send(user);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "User not found with id " + req.params.id
                });
            }
            return res.status(500).send({
                message: "Error getting user with id " + req.params.id
            });
        });
};

// Delete a User with the specified id in the request
exports.delete =  async (req, res) => {
    if(req.headers.suthorization){
        let verification = await User.findOne({token: req.headers.suthorization})
        if(!verification){
            return res.status(400).send({
                status: "failure",
                message: "invalid authentication"
            });
        }
    }
    User.findByIdAndRemove(req.params.id)
        .then(user => {
            if (!user) {
                return res.status(404).send({
                    message: "user not found with id " + req.params.id
                });
            }
            res.send({ message: "user deleted successfully!" });
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "user not found with id " + req.params.id
                });
            }
            return res.status(500).send({
                message: "Could not delete user with id " + req.params.id
            });
        });
};