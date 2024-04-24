const express = require('express');
const router = express.Router(); // mini instance

router.use(express.urlencoded({ extended: true }));

const methodOverride = require('method-override');

router.use(methodOverride('_Method'));

const session = require('express-session');
router.use(session({
    secret: 'your_secret_key', // Secret key for session
    resave: false,
    saveUninitialized: true
  }));


const Location = require('../model/Location');
const City = require('../model/City');
const SP = require('../model/SP');





// To Expand a particular Location
router.get('/locations/:id', async (req, res) => {
    let { id } = req.params;
    let foundLocation = await Location.findById(id).populate('sp'); 
    // req.session.foundLocationId = foundLocation._id;
    // console.log(foundLocation);
    let CityId = req.session.CityId;
    res.locals.CityId=CityId;
    res.render('services/index', { foundLocation });
    // res.send(req.params);
})

// ADMIN ROUTES:

// To show a particlar location
router.get('/admin/locations/:id', async (req, res) => {
    let { id } = req.params;
    let foundLocation = await Location.findById(id).populate('sp'); 
    req.session.LocationId = foundLocation._id;
    // console.log(foundLocation);
    res.render('locations/show', { foundLocation });
})

//to add a location
// router.post('/cities/:id/location', async (req, res) => {
//     let { id } = req.params;
//     let { name,img } = req.body;

//     let city = await City.findById(id);
//     let location = new Location({ name,img });

//     city.locations.push(location);

//     await city.save();
//     await location.save();

//     res.send('location stored successfully');
//     // res.redirect('/admin/cities/:id');

// })


// --> To add a New Location
router.get('/admin/location/new', (req, res) => {
    res.render('locations/new');
})

//to add a location
router.post('/admin/location/new', async (req, res) => {
    let id = req.session.CityId;
    let { name,img } = req.body;

    let city = await City.findById(id);
    let location = new Location({ name,img });

    city.locations.push(location);

    await city.save();
    await location.save();

    // res.send('location stored successfully');
    res.redirect(`/admin/cities/${id}`);

})




// DELETE THE EXISTING LOCATION
router.delete('/admin/location/:id' , async(req,res)=>{
    let {id} = req.params;
    let location = await Location.findById(id);
    
    for (let idd of location.sp) {
        await SP.findByIdAndDelete(idd);
    }

    await Location.findByIdAndDelete(id);
    res.redirect('/admin/cities');
})




module.exports = router;