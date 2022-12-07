const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const crypto = require("crypto");
const User = require('../models/user');
const sendEmail = require('../models/mail');
router.get('/', (req, res, next) => {
	return res.render('index.ejs');
});
router.post('/', (req, res, next) => {
	let personInfo = req.body;

	if (!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {
      User.findOne({ username: personInfo.username }, (err, data) => {
      if(!data){
			  User.findOne({ email: personInfo.email }, (err, data) => {
				if (!data) {
					let c;
					User.findOne({}, (err, data) => {
						if (data) {
							c = data.unique_id + 1;
						} else {
							c = 1;
						}

						let newPerson = new User({
							unique_id: c,
							email: personInfo.email,
							username: personInfo.username,
							password: personInfo.password,
							passwordConf: personInfo.passwordConf,
              verified:false,
              codrocoins:0
						});

						newPerson.save((err, Person) => {
							if (err)
								console.log(err);
							else
								console.log('Success');
						});

					}).sort({ _id: -1 }).limit(1);
					res.send({ "Success": "You are regestered,You can login now." });
				} else {
					res.send({ "Success": "Email is already used." });
				}
        
			});
      }else{
         res.send({ "Success": "username already exists" });
      }
      });
		} else {
			res.send({ "Success": "password is not matched" });
		}
	}
});
router.get('/login', (req, res, next) => {
	return res.render('login.ejs');
});

router.post('/login', (req, res, next) => {
	User.findOne({ email: req.body.email }, (err, data) => {
		if (data) {

			if (data.password == req.body.password) {
				req.session.userId = data.unique_id;
				res.send({ "Success": "Success!" });
			} else {
				res.send({ "Success": "Wrong password!" });
			}
		} else {
			res.send({ "Success": "This Email Is not regestered!" });
		}
	});
});

router.get('/profile', async(req, res, next) => {
	User.findOne({ unique_id: req.session.userId },async (err, data) => {
		if (!data) {
			res.redirect('/');
		} else {
            const account = await fetch(process.env.pterodactyl_domain+"/api/application/users/"+data.ptero_id+"?include=servers", {
		       "method": "GET",
		       "headers": {
		           "Accept": "application/json",
		           "Content-Type": "application/json",
		           "Authorization": `Bearer ${process.env.pterodactyl_key}`
		         }
		      });
		     const accountlist = await account.json();
		    console.log(accountlist);
      req.session.userId = data.unique_id;
			  return res.render('data.ejs', { "name": data.username, "email": data.email,"emailverify":data.verified,"count":accountlist.attributes, "coins":data.codrocoins});
        }
	});
});

router.get('/logout', (req, res, next) => {
	if (req.session) {
		// delete session object
		req.session.destroy((err) => {
			if (err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}
});

router.get('/forgetpass', (req, res, next) => {
	res.render("forget.ejs");
});

router.post('/forgetpass', (req, res, next) => {
	User.findOne({ email: req.body.email }, (err, data) => {
		if (!data) {
			res.send({ "Success": "This Email Is not regestered!" });
		} else {
			if (req.body.password == req.body.passwordConf) {
				data.password = req.body.password;
				data.passwordConf = req.body.passwordConf;

				data.save((err, Person) => {
					if (err)
						console.log(err);
					else
						console.log('Success');
					res.send({ "Success": "Password changed!" });
				});
			} else {
				res.send({ "Success": "Password does not matched! Both Password should be same." });
			}
		}
	});

});
router.get('/details', (req, res, next) => {
  User.findOne({ unique_id: req.session.userId },async (err, data) => {
     if(!data)
     {
        res.redirect('/profile');              
     }else{
        return res.render('details.ejs', { "name":data.username, "email": data.email,"emailverify":data.verified, "coins":data.codrocoins});
     }
  });
});
router.post('/details', (req, res, next) => {
  User.findOne({ unique_id: req.session.userId },async (err, data) => {
     if(!data)
     {
        res.redirect('/profile');              
     }else{
        data.verificationcode=crypto.randomBytes(32).toString("hex");
       data.save((err, Person) => {
					if (err)
						console.log(err);
					else
						console.log('Success');
       });
					await sendEmail('darknoobyt178@gmail.com', "email verification  code", data.verificationcode);
        req.session.userId = data.unique_id;
        res.send({ "Success": "Success!" });
     }
  });
});
router.get('/verify', (req, res, next) => {
	return res.render('verify.ejs');
});


router.post('/verify', async(req, res, next) => {
	User.findOne({ unique_id: req.session.userId }, async (err, data) => {
		if (data) {

			if (data.verificationcode === req.body.verifycode) {
				req.session.userId = data.unique_id;
        data.verified= true;
        
        const account = await fetch(process.env.pterodactyl_domain+"/api/application/users?include=servers&filter[email]="+ encodeURIComponent(data.email), {
        "method": "GET",
        "headers": {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.pterodactyl_key}`
         }
     });
    const accountlist = await account.json();
    let user = accountlist.data.filter(acc => acc.attributes.email.toLowerCase() == data.email);
		if (user.length == 0) {   
      let accountjson = await fetch(process.env.pterodactyl_domain+"/api/application/users", {
						  "method": "POST",
						  "headers": {
						    "Accept": "application/json",
						    "Content-Type": "application/json",
						    "Authorization": `Bearer ${process.env.pterodactyl_key}`
						  },
						  body: JSON.stringify({
						    email: data.email,
						    username: data.username,
						    first_name: data.username,
						    last_name: "Codroid",
						    password:data.password
						  })
						});
            let accountinfo = JSON.parse(await accountjson.text());
      
      if (await accountjson.status == 201) {
        
          data.ptero_id=accountinfo.attributes.id;
          data.save((err, Person) => {
					 if (err)
						 console.log(err);
					 else
						 console.log('Success');
          });
          res.send({ "Success": "Success!" });
      }else{
         console.log('some error occured');
         console.log(accountjson);
      }
    }
    else{
      res.send({ "Success": "pterodactyle error" });
    }
			} else {
				res.send({ "Success": "Wrong password!" });
			}
		} else {
			res.send({ "Success": "This Email Is not regestered!" });
		}
	});
});
router.get('/servers', (req, res, next) => {
	return res.render('server.ejs');
});


module.exports = router;