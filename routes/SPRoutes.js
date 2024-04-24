const express = require('express');
const router = express.Router(); // mini instance
const mongoose = require('mongoose');
router.use(express.urlencoded({ extended: true }));

const methodOverride = require('method-override');

router.use(methodOverride('_Method'));

const Location = require('../model/Location');
const City = require('../model/City');
const SP = require('../model/SP');
const Slot = require('../model/Slot');

const session = require('express-session');
router.use(session({
    secret: 'your_secret_key', // Secret key for session
    resave: false,
    saveUninitialized: true
  }));

  router.get('/timeform/:id',async(req,res)=>{
    let {id} = req.params;
    spID = id;
    // Check if spID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(spID)) {
        return res.status(400).json({ error: 'Invalid spID format.' });
    }
    // console.log(spID);
    currentSP = await SP.findById(id);
    // req.session.foundSPId = foundSp._id;
    res.render('../views/payment/input.ejs',{currentSP});
})


//To get the input time in req.body
router.post('/submit',async (req,res)=>{
    const intime=req.body;
    let hour = req.body.inputHour;
    console.log(req.body.inputHour);
    let foundSPId = req.session.foundSPId;
    console.log(foundSPId)
    let foundSp = await SP.findById(foundSPId);
    let avaiSlots=0;
    for(let item of foundSp.slots){
        let foundSlot = await Slot.findById(item);
        if(foundSlot.availability[hour].isAvail){
            avaiSlots++;
        }
    }
    // console.log(avaiSlots);

    
    res.send('Form submitted successfully');
})



// ADMIN ROUTES 


//To add service provider
router.get('/admin/service/new', (req, res) => {
    res.render('services/new');
})

//to add a service provider
router.post('/admin/service/new', async (req, res) => {
    let id = req.session.LocationId;
    let { name, img, number, idd, password } = req.body;

    let location = await Location.findById(id);

    let availability = [];
    for (let i = 0; i < 24; i++) {
        let newObj = {
            hour: i,
            isAvail: true,
            paymentIntentId: NaN,
            vehicleNumber: NaN
        };
        availability.push(newObj);
    }

    let sps = new SP({ name, img, idd, password });
    let serviceId = sps._id;

    // Attempt to save the SP
    try {
        await sps.save();

        // Save slots after saving the service provider
        for (let i = 0; i < number; i++) {
            let slotNumber = i + 1;
            let slot = new Slot({ availability ,slotNumber,serviceId});
            sps.slots.push(slot);
            await slot.save();
        }
        await sps.save();
        location.sp.push(sps);
        await location.save();

        res.redirect(`/admin/locations/${id}`);
    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000 || error.code === 11001) {
            // Duplicate key error, handle accordingly
            console.error("Duplicate key error for idd:", idd);
            // You can redirect or send an error response to the client
            res.status(400).send("Id already taken !!! Please choose a different UniqueId.");
        } else {
            // Handle other errors
            console.error("Error saving SP:", error);
            res.status(500).send("Internal Server Error");
        }
    }
});




// To show a particlar service provider
router.get('/admin/sp/:id', async (req, res) => {
    let { id } = req.params;
    let foundSP = await SP.findById(id); 
    // console.log(foundLocation);
    res.render('services/show', { foundSP });
})

// To delete a service provider
router.delete('/admin/sp/:id', async (req, res) => {
    let { id } = req.params;
    let sp = await SP.findById(id);

    for (let idd of sp.slots) {
        let slot = await Slot.findByIdAndDelete(idd);
    }
    
    await SP.findByIdAndDelete(id);
    res.redirect(`/admin/locations/${req.session.LocationId}`);

})


// Login Routes
router.get('/security/login', (req, res) => {
    res.render('services/securityLogin');
})

function isObjectEmpty(obj) {
    return Object.entries(obj).length === 0;
}

router.post('/security/login', async (req, res) => {
    let { idd, password } = req.body;

    try {
        // Find the service provider based on idd and password
        let foundservice = await SP.findOne({ idd, password }).populate('slots');
        req.session.serviceId = foundservice._id;
        if (!foundservice) {
            // No matching service provider found
            return res.status(400).send("Credentials don't match !!! PLEASE RETRY.");
        }

        // Log the found service provider
        // console.log(foundservice);

        // Check if foundservice is empty or has populated slots
        if (isObjectEmpty(foundservice) || !foundservice.slots) {
            // Handle the case where foundservice is empty or doesn't have slots
            return res.status(400).send("Service provider data is incomplete.");
        }

        // Render the view with the found service provider and its populated slots
        res.render('services/securityIndex', { foundservice });
    } catch (error) {
        console.error('Error finding service provider:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/search', async (req, res) => {
    const searchHour = req.query.hour;
    console.log(searchHour);
    try {
        // Find the SP by idd
        let spId = req.session.serviceId;
        console.log(spId);
        let sp = await SP.find({'_id': spId }).populate('slots');
        console.log(sp);

        if (!sp) {
            return res.status(404).json({ error: 'SP not found' });
        }

        // Query for slots based on the specified hour and availability
        // let searchResults = [];
        
        let query = {
            'serviceId':spId,
            'availability': {
                $elemMatch: {
                    'isAvail': true,
                    'hour':searchHour
                }
            }
        }
        let searchResults = await Slot.find(query);     
        
        console.log(searchResults);

        res.json(searchResults);
    } catch (error) {
        console.error('Error performing search:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports=router;
