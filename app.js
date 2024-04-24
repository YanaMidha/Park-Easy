const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const CityRoutes = require('./routes/CityRoutes');
const LocationRoutes = require('./routes/LocationRoutes');
const SPRoutes = require('./routes/SPRoutes');
const SlotRoutes = require('./routes/SlotRoutes');
const StartRoutes = require('./routes/StartRoutes');
const bodyParser = require('body-parser');
const cors = require('cors');
const SP=require('./model/SP');
const slots = require('./model/Slot');
const stripe = require('stripe')('sk_test_...'); // Replace with your Stripe secret key

let spID;
let currentSP;

app.use('/timeform/:spId', async (req, res, next) => {
    spID = req.params.spId;
    // console.log(spID);
    if (!mongoose.Types.ObjectId.isValid(spID)) {
        return res.status(400).json({ error: 'Invalid spID provided' });
    }

    try {
        currentSP = await SP.findById(spID);
        // console.log(currentSP);
        if (!currentSP) {
            return res.status(404).json({ error: 'Service provider not found' });
        }
    } catch (error) {
        console.error('Error finding service provider:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

    next(); // Move to the next middleware/route handler
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(CityRoutes);
app.use(LocationRoutes);
app.use(SPRoutes);
app.use(StartRoutes);
app.use(SlotRoutes);

let storedStartTime;
let bookedSlotNumber;
let storedVnum;

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
});

const startMongoDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/Parking', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('DB CONNECTED');
    } catch (error) {
        console.error('Error while connecting DB', error);
    }
};

startMongoDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(cors());

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.post('/checkSlotAvailability', async (req, res) => {
    console.log(currentSP);
    let idd=currentSP._id;
    let currentSPSlotsIds = currentSP.slots;  // Initialize outside the try block
    // console.log(currentSPSlotsIds)
    try {
        const startTime = req.body.startTime;
        console.log(startTime);
        const availableSlots = await slots.find({
            'availability': {
                $elemMatch: {
                    'isAvail': true,
                    'hour': startTime
                }
            },
            '_id': { $in: currentSP.slots }
            // 'serviceId': idd // Use the array of slot IDs from the currentSP
        });
        console.log(availableSlots)
        res.json({ slotAvailable: availableSlots.length > 0, availableSlots });
    } catch (error) {
        console.error('Error checking slot availability:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// app.post('/checkSlotAvailability', async (req, res) => {
//     try {
//         const startTime = req.body.startTime;

//         const availableSlots = await ParkingSlot.find({
//             'availability': {
//                 $elemMatch: {
//                     'isAvail': true,
//                     'hour': startTime
//                 }
//             }
//         });

//         res.json({ slotAvailable: availableSlots.length > 0, availableSlots });
//     } catch (error) {
//         console.error('Error checking slot availability:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });
app.post('/getAvailableSlotCount', async (req, res) => {
    try {
        const spIDString = spID;

        const noOfSlotsAvail = await slots.countDocuments({
            'availability': {
                $elemMatch: {
                    'isAvail': true,
                    'hour': storedStartTime
                }
            },
            '_id': { $in: currentSP.slots } // Use the array of slot IDs from the currentSP
        });

        res.json({ slotCount: noOfSlotsAvail });
    } catch (error) {
        console.error('Error getting slot count:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/storeStartTime', async (req, res) => {
    try {
        const startTime = req.body.startTime;
        
        if (isNaN(startTime) || startTime < 0 || startTime > 23) {
            return res.status(400).json({ error: 'Invalid start time. Please enter a valid hour (0-23).' });
        }

        const availableSlots = await slots.find({
            'availability': {
                $elemMatch: {
                    'isAvail': true,
                    'hour': startTime
                }
            },
            '_id': { $in: currentSP.slots } // Use the array of slot IDs from the currentSP
        });

        if (availableSlots.length > 0) {
            storedStartTime = startTime;
            console.log('Start time stored on the server:', storedStartTime);
            res.status(200).json({ startTime: storedStartTime });
        } else {
            res.status(404).json({ error: `No Available Parking Slot for hour ${startTime}` });
        }
    } catch (error) {
        console.error('Error storing start time:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/storeVnum', async (req, res) => {
    console.log('here in/storeVnum',req.body.Vnum)
    try {
        const Vnum = req.body.Vnum;
        storedVnum=Vnum;
        res.status(200).json({ success: true, message: 'Vehicle number stored successfully.' });
    } catch (error) {
        console.error('Error storing Vehicle Number:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/start-payment', async (req, res) => {
    try {
        const startTime = storedStartTime;

        if (isNaN(startTime) || startTime < 0 || startTime > 23) {
            return res.status(400).json({ error: 'Invalid start time. Please enter a valid hour (0-23).' });
        }

        const availableSlots = await slots.find({
            'availability': {
                $elemMatch: {
                    'isAvail': true,
                    'hour': startTime
                }
            },
            '_id': { $in: currentSP.slots } // Use the array of slot IDs from the currentSP
        });

        if (availableSlots.length === 0) {
            console.error(`No available parking slot found for hour ${startTime}`);
            return res.status(404).json({ error: `No Available Parking Slot for hour ${startTime}` });
        }

        // Proceed to payment logic
        // ... (remaining code for payment logic)
    } catch (error) {
        console.error('Error starting payment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const event = req.body;

        console.log('Received webhook event:', JSON.stringify(event, null, 2));

        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;

                const startTime = storedStartTime;

                if (isNaN(startTime) || startTime < 0 || startTime > 23) {
                    return res.status(400).json({ error: 'Invalid start time received in webhook.' });
                }
                

                const availableSlot = await slots.findOneAndUpdate(
                    {
                        'availability': {
                            $elemMatch: {
                                'isAvail': true,
                                'hour': startTime
                            }
                        },
                        '_id': { $in: currentSP.slots } // Use the array of slot IDs from the currentSP
                    },
                    {
                        $set: {
                            'availability.$.isAvail': false,
                            'availability.$.paymentIntentId': paymentIntent.id,
                            'availability.$.vehicleNumber':storedVnum
                        },
                    },
                    { new: true }
                );

                if (!availableSlot) {
                    console.error(`No available parking slot found for hour ${startTime}`);
                    return res.status(404).json({ error: `No Available Parking Slot for hour ${startTime}` });
                }

                bookedSlotNumber = availableSlot.slotNumber;

                console.log('Parking slot updated successfully:', availableSlot);

                res.status(200).json({
                    message: `Slot ${bookedSlotNumber} booked successfully`,
                    slotNumber: bookedSlotNumber
                });
                break;

            default:
                console.log('Unhandled event type:', event.type);
                res.status(400).json({ error: 'Unhandled event type' });
        }
    } catch (error) {
        console.error('Error processing webhook event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/fetch-slot', async (req, res) => {
    try {
        const slotNumber = bookedSlotNumber;

        if (!slotNumber) {
            return res.status(400).json({ error: 'No slot number available. Please book a slot first.' });
        }

        res.status(200).json({ slotNumber: slotNumber });
    } catch (error) {
        console.error('Error fetching slot information:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/fetch-Vnum', async (req, res) => {
    try {
        const Vnum = storedVnum;

        if (!Vnum) {
            return res.status(400).json({ error: 'No Vehicle number was given. Please give Vehicle Number' });
        }

        res.status(200).json({ Vnum: Vnum });
    } catch (error) {
        console.error('Error fetching Veshicle Number:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.listen(3000, () => {
    console.log('Server connected at port 3000');
});
