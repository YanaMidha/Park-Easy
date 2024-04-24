const express = require('express');
const router = express.Router(); // mini instance

router.use(express.urlencoded({ extended: true }));

const methodOverride = require('method-override');

router.use(methodOverride('_Method'));

const Location = require('../model/Location');
const City = require('../model/City');
const SP = require('../model/SP');
const Slot = require('../model/Slot');

router.get('/slot/:id', async(req, res) => {
    let { id } = req.params;
    let foundSlot = await Slot.findById(id);
    res.locals.foundSlot = foundSlot;
    res.render('slots/index', { foundSlot });
})

// FORM TO EDIT A PARTIICULAR SLOT
router.get('/slot/:id/edit' , async(req,res)=>{
    let {id} = req.params;
    let foundSlot = await Slot.findById(id);
    console.log(foundSlot);
    res.render('slots/edit' , {foundSlot})
})

// TO CHANGE THE AVAILABILITY
router.put('/slot/:id' , async(req,res)=>{
    // let hour = req.query.constantValue;
    let { id } = req.params;
    let Vnum = req.body.Vnum;
    let hour = req.body.hour;
    let foundSlot = await Slot.findById(id);
    console.log(foundSlot);
        foundSlot.availability[hour].isAvail = !foundSlot.availability[hour].isAvail;
        foundSlot.availability[hour].vehicleNumber = Vnum;

    await foundSlot.save();
    res.redirect(`/slot/${id}`);
})



module.exports=router;
