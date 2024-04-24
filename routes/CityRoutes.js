const express = require('express');
const router = express.Router(); // mini instance

const requestIp = require('request-ip');
const admin = require('firebase-admin');
const serviceAccount = require('./../car-parking-slot-booking-95109-firebase-adminsdk-b4ea0-db6951c313.json');

// Define a middleware function to capture IP address
const getIpAddress = (req, res, next) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;
    req.userIpAddress = ip;
    next();
};



admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://car-parking-slot-booking-95109-default-rtdb.firebaseio.com'
});

router.use(express.urlencoded({ extended: true }));
const methodOverride = require('method-override');

//requiring the session
const session = require('express-session');
router.use(session({
    secret: 'your_secret_key', // Secret key for session
    resave: false,
    saveUninitialized:true
}));

router.use(methodOverride('_Method'));

const City = require('../model/City');
const SP = require('../model/SP');
const Location = require('../model/Location');
const Slot = require('../model/Slot');
router.use('/ParkApp', express.static('ParkApp'));


// Read
router.get('/cities', getIpAddress, async (req, res) => {
    try {
        const userIpAddress = req.userIpAddress;
        console.log(userIpAddress);

        //fetching the userid of the user from req.body
        const userId = req.body.userId; // Retrieve user ID from request body
        const db = admin.database();
        const userRef = db.ref(`/users/${userId}`);

        const ipAddressRef = userRef.child('ipAddresses');
        const newIpAddressRef = ipAddressRef.push();
        
        newIpAddressRef.set({
            ipAddress: userIpAddress,
            timestamp: admin.database.ServerValue.TIMESTAMP
        });

        //redirecting to the page and rendering
        let cities = await City.find();
        res.render('cities/index', { cities });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// To Expand a particular City
router.get('/cities/:id', async (req, res) => {
    let { id } = req.params;
    let foundCity = await City.findById(id).populate('locations'); 
    console.log(foundCity);
    req.session.CityId = foundCity._id;
    res.render('locations/index', { foundCity });
})

//ADMIN ROUTES :

// --> Read
router.get('/admin/cities', async (req, res) => {
    let cities = await City.find();
    res.render('cities/adminIndex', { cities });
})


// --> To Show a Particular City
router.get('/admin/cities/:id', async (req, res) => {
    let { id } = req.params;
    let foundCity = await City.findById(id).populate('locations'); 
    // console.log(foundCity);
    req.session.CityId = foundCity._id;
    res.render('cities/show', { foundCity });
})

// --> To add a New City
router.get('/admin/city/new', (req, res) => {
    res.render('cities/new');
})

// --> To actually add in database
router.post('/admin/cities', async(req, res) => {
    let { name, img } = req.body;
    await City.create({ name, img });
    res.redirect('/admin/cities');
})

// --> DELETE THE EXISTING City
router.delete('/admin/city/:id' , async(req,res)=>{
    let {id} = req.params;
    let city = await City.findById(id);
    
    for (let idd of city.locations) {
        await Location.findByIdAndDelete(idd);
    }

    await City.findByIdAndDelete(id);
    res.redirect('/admin/cities');
})


module.exports = router;
