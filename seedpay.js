// const mongoose = require('mongoose');
// const ParkingSlot = require('./model/ParkingSlot'); // Adjust the path based on your project structure

// async function seedPay() {
//   const connectionString = 'mongodb://127.0.0.1:27017/abc'; // Your MongoDB connection string

//   try {
//     await mongoose.connect(connectionString, {
//       useUnifiedTopology: true,
//       useNewUrlParser: true,
//     });

//     console.log('Connected to MongoDB for seeding...');

//     // Seed data for parking slots
//     const initialData = [
//       {
//         availability: Array.from({ length: 24 }, (_, hour) => ({
//           hour,
//           isAvail: true,
//           paymentIntentId: '',
//         })),
//         SlotNumber: 1,
//       },
//       {
//         availability: Array.from({ length: 24 }, (_, hour) => ({
//           hour,
//           isAvail: true,
//           paymentIntentId: '',
//         })),
//         SlotNumber: 2,
//       },
//       // Add more parking slots as needed
//     ];

//     await ParkingSlot.insertMany(initialData);
//     console.log('Parking slots seeded successfully.');
//   } catch (error) {
//     console.error('Error seeding database:', error);
//   } finally {
//     // Close the connection after seeding
//     mongoose.connection.close();
//     console.log('MongoDB connection closed.');
//   }
// }

// module.exports = seedPay;


// const mongoose = require('mongoose');
// const ParkingSlot = require('./model/ParkingSlot'); // Adjust the path based on your project structure

// async function seedPay() {
//   let connection;
//   try {
//     // Check if there's an active Mongoose connection
//     if (mongoose.connection.readyState === 0) {
//       const connectionString = 'mongodb://127.0.0.1:27017/abc'; // Your MongoDB connection string

//       // Create a new Mongoose connection
//       connection = await mongoose.createConnection(connectionString, {
//         useUnifiedTopology: true,
//         useNewUrlParser: true,
//       });

//       console.log('Connected to MongoDB for seeding...');
//     } else {
//       // Use the existing active connection
//       connection = mongoose.connection;
//     }

//     // Seed data for parking slots
//     // ... (the rest of your seeding logic)
//     // Seed data for parking slots
//     const initialData = [
//         {
//           availability: Array.from({ length: 24 }, (_, hour) => ({
//             hour,
//             isAvail: true,
//             paymentIntentId: '',
//           })),
//           SlotNumber: 1,
//         },
//         {
//           availability: Array.from({ length: 24 }, (_, hour) => ({
//             hour,
//             isAvail: true,
//             paymentIntentId: '',
//           })),
//           SlotNumber: 2,
//         },
//         // Add more parking slots as needed
//       ];
  
//       await ParkingSlot.insertMany(initialData);
//       console.log('Parking slots seeded successfully.');
    

//   } catch (error) {
//     console.error('Error seeding database:', error);
//   } finally {
//     if (connection) {
//       // Close the connection after seeding
//       await connection.close();
//       console.log('MongoDB connection closed.');
//     }
//   }
// }
const mongoose = require('mongoose');
const ParkingSlot = require('./model/ParkingSlot'); // Adjust the path based on your project structure
const connectionString = 'mongodb://127.0.0.1:27017/Parking';

mongoose.connect(connectionString, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
    console.log('Connected to MongoDB');

    // Seed data
    const initialData = [
        {
            availability: Array.from({ length: 24 }, (_, hour) => ({
                hour,
                isAvail: true,
                paymentIntentId: '',
            })),
            SlotNumber:1
        },
        {
            availability: Array.from({ length: 24 }, (_, hour) => ({
                hour,
                isAvail: true,
                paymentIntentId: '',
            })),
            SlotNumber:2
        },
        {
            availability: Array.from({ length: 24 }, (_, hour) => ({
                hour,
                isAvail: true,
                paymentIntentId: '',
            })),
            SlotNumber:3
        },
        {
            availability: Array.from({ length: 24 }, (_, hour) => ({
                hour,
                isAvail: true,
                paymentIntentId: '',
            })),
            SlotNumber:4
        },
        {
            availability: Array.from({ length: 24 }, (_, hour) => ({
                hour,
                isAvail: true,
                paymentIntentId: '',
            })),
            SlotNumber:5
        },{
            availability: Array.from({ length: 24 }, (_, hour) => ({
                hour,
                isAvail: true,
                paymentIntentId: '',
            })),
            SlotNumber:6
        },{
            availability: Array.from({ length: 24 }, (_, hour) => ({
                hour,
                isAvail: true,
                paymentIntentId: '',
            })),
            SlotNumber:7
        }
    ];

    try {
        await ParkingSlot.insertMany(initialData);
        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // Close the connection after seeding
        mongoose.connection.close();
    }
});




// Make sure this file exports the seedPay function and that the logic for seeding your data is in place within the try block.
