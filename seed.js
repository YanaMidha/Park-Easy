const mongoose = require('mongoose');
const City = require('./model/City');
const Location = require('./model/Location');



let cities = [
    {
        name:"AGRA" ,
        img: "https://cdn.getyourguide.com/img/tour/b0b2d3e2be8dea19.jpeg/145.jpg",
    },{
        name:"MATHURA" ,
        img: "https://www.chardhambooking.com/wp-content/uploads/2021/01/wootrips-1-day-delhi-to-mathura-and-vrindavan-sightseeing-tour-package-private-car-header.jpg",
    }
]

let locations = [
    {
        name:"AGRA" ,
        img: "https://cdn.getyourguide.com/img/tour/b0b2d3e2be8dea19.jpeg/145.jpg",
    },{
        name:"MATHURA" ,
        img: "https://www.chardhambooking.com/wp-content/uploads/2021/01/wootrips-1-day-delhi-to-mathura-and-vrindavan-sightseeing-tour-package-private-car-header.jpg",
    }
]


async function seedCity(){
    await City.insertMany(cities);
    console.log("City Data seeded");
}

async function seedLocation(){
    await Location.insertMany(cities);
    console.log("Location Data seeded");
}


module.exports = seedCity;